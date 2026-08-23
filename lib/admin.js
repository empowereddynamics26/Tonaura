import { createAdminClient } from "@/lib/supabase/admin";

export const PLAN_MRR = {
  monthly: 3.99,
  yearly: 24.99 / 12,
  lifetime: 0,
};

export async function writeAuditLog({
  actorId,
  actorEmail,
  action,
  targetType = null,
  targetId = null,
  meta = {},
}) {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: actorId || null,
      actor_email: actorEmail || null,
      action,
      target_type: targetType,
      target_id: targetId ? String(targetId) : null,
      meta,
    });
  } catch (err) {
    console.warn("[audit]", err?.message || err);
  }
}

export function estimateRevenue(rows = []) {
  let mrr = 0;
  let lifetimeCount = 0;
  const planBreakdown = {};
  for (const row of rows) {
    const key = row.plan_key || "unknown";
    planBreakdown[key] = (planBreakdown[key] || 0) + 1;
    if (key === "lifetime") lifetimeCount += 1;
    else mrr += PLAN_MRR[key] || PLAN_MRR.monthly;
  }
  return {
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    lifetimeCount,
    planBreakdown,
    currency: "GBP",
  };
}

export async function listAuthEmails(admin, { maxPages = 10 } = {}) {
  const map = new Map();
  try {
    let page = 1;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = data?.users || [];
      users.forEach((u) => map.set(u.id, u.email || null));
      if (users.length < 200) break;
      page += 1;
      if (page > maxPages) break;
    }
  } catch {
    // optional
  }
  return map;
}

export async function getFeatureFlags(admin) {
  const { data, error } = await admin.from("feature_flags").select("*").order("key");
  if (error) throw error;
  return data || [];
}

export async function getPlatformSettings(admin) {
  const { data, error } = await admin.from("platform_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (
    data || {
      id: 1,
      maintenance_message: "Tonaura is under maintenance. Back shortly.",
      support_email: "support@tonaura.io",
      from_name: "Tonaura",
    }
  );
}

export function flagsMap(rows) {
  const out = {};
  for (const row of rows || []) out[row.key] = !!row.enabled;
  return out;
}
