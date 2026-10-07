import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAccessActive, premiumFromSources } from "@/lib/premiumAccess";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id,display_name,role,created_at,updated_at,stripe_customer_id")
    .order("created_at", { ascending: false })
    .limit(200);

  if (profileError) {
    return NextResponse.json({ error: "Could not load profiles." }, { status: 500 });
  }

  const [{ data: entitlements }, { data: storeEntitlements }] = await Promise.all([
    admin.from("entitlement_cache").select("user_id,is_active,plan_key,expires_at,source,updated_at"),
    admin.from("store_entitlements").select("user_id,is_active,plan_key,expires_at,store"),
  ]);

  const entByUser = new Map((entitlements || []).map((e) => [e.user_id, e]));
  const storesByUser = new Map();
  for (const row of storeEntitlements || []) {
    const list = storesByUser.get(row.user_id) || [];
    list.push(row);
    storesByUser.set(row.user_id, list);
  }

  const emailById = new Map();
  try {
    let page = 1;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = data?.users || [];
      users.forEach((u) => emailById.set(u.id, u.email || null));
      if (users.length < 200) break;
      page += 1;
      if (page > 10) break;
    }
  } catch {
    // Emails optional if auth admin listing fails
  }

  const users = (profiles || []).map((p) => {
    const ent = entByUser.get(p.id);
    const access = premiumFromSources(ent, storesByUser.get(p.id) || []);
    return {
      id: p.id,
      display_name: p.display_name,
      role: p.role || "user",
      created_at: p.created_at,
      updated_at: p.updated_at,
      stripe_customer_id: p.stripe_customer_id,
      email: emailById.get(p.id) || null,
      premium_active: access.active,
      plan_key: access.planKey,
      premium_source: access.source,
      premium_expires_at: access.expiresAt,
      stripe_active: isAccessActive(ent),
    };
  });

  return NextResponse.json({ users, generatedAt: new Date().toISOString() });
}
