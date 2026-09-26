import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAuthEmails, writeAuditLog } from "@/lib/admin";

const STAFF = new Set(["user", "support", "admin", "super_admin"]);

export async function GET(request, { params }) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const admin = createAdminClient();
  const { data: profile, error } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error || !profile) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const [{ data: entitlement }, { data: billing }, emailById] = await Promise.all([
    admin.from("entitlement_cache").select("*").eq("user_id", id).maybeSingle(),
    admin
      .from("billing_events")
      .select("event_id,event_type,processed_at,payload")
      .eq("user_id", id)
      .order("processed_at", { ascending: false })
      .limit(30),
    listAuthEmails(admin, { maxPages: 5 }),
  ]);

  const email = emailById.get(id) || null;
  let authUser = null;
  try {
    const { data } = await admin.auth.admin.getUserById(id);
    authUser = data?.user
      ? {
          email: data.user.email,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
          email_confirmed_at: data.user.email_confirmed_at,
          banned_until: data.user.banned_until || null,
        }
      : null;
  } catch {
    // optional
  }

  const ent = entitlement;
  const expired = ent?.expires_at && Date.parse(ent.expires_at) < Date.now();
  const premiumActive = !!(ent && ent.is_active && !expired);

  return NextResponse.json({
    user: {
      id: profile.id,
      display_name: profile.display_name,
      role: profile.role || "user",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      stripe_customer_id: profile.stripe_customer_id,
      email: email || authUser?.email || null,
      premium_active: premiumActive,
      plan_key: ent?.plan_key || null,
      premium_source: ent?.source || null,
      premium_expires_at: ent?.expires_at || null,
      entitlement: ent || null,
      auth: authUser,
      billing: billing || [],
    },
  });
}

export async function PATCH(request, { params }) {
  const { ok, user } = await requireAdmin(request, { full: true });
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const role = body?.role;
  if (!STAFF.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update role." }, { status: 500 });

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "user.role",
    targetType: "user",
    targetId: id,
    meta: { role },
  });

  return NextResponse.json({ ok: true, role });
}
