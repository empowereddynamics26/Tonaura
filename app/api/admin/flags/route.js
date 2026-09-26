import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeatureFlags, writeAuditLog, listAuthEmails } from "@/lib/admin";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const flags = await getFeatureFlags(admin);

  // Enrich each flag with the email of whoever last changed it.
  // Skip the lookup entirely if nothing has been changed yet.
  const changedByIds = [
    ...new Set((flags || []).map((f) => f.updated_by).filter(Boolean)),
  ];
  let emailById = new Map();
  if (changedByIds.length > 0) {
    try {
      emailById = await listAuthEmails(admin, { maxPages: 20 });
    } catch {
      emailById = new Map();
    }
  }

  const enriched = (flags || []).map((f) => ({
    ...f,
    updated_by_email: f.updated_by ? emailById.get(f.updated_by) || null : null,
  }));

  return NextResponse.json({ flags: enriched });
}

export async function PATCH(request) {
  const { ok, user } = await requireAdmin(request, { full: true });
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const key = String(body?.key || "").trim();
  if (!key || typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "key and enabled required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feature_flags")
    .update({
      enabled: body.enabled,
      updated_at: new Date().toISOString(),
      updated_by: user?.id || null,
    })
    .eq("key", key)
    .select("*")
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Flag not found." }, { status: 404 });

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "flag.update",
    targetType: "feature_flag",
    targetId: key,
    meta: { enabled: body.enabled },
  });

  return NextResponse.json({ flag: data });
}
