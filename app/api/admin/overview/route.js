import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { estimateRevenue, getFeatureFlags, flagsMap } from "@/lib/admin";

export async function GET(request) {
  const { ok, user, role } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: contactCount },
    { count: contactNew },
    { data: messages },
    { count: profileCount },
    { count: premiumActive },
    { data: entitlements },
    { data: recentBilling },
    { count: signupWeek },
    { count: signupMonth },
    { data: allActivePlans },
    { count: auditCount },
    flags,
  ] = await Promise.all([
    admin.from("contact_messages").select("*", { count: "exact", head: true }),
    admin.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    admin
      .from("contact_messages")
      .select("id,name,email,topic,message,status,created_at,admin_reply,replied_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("entitlement_cache").select("*", { count: "exact", head: true }).eq("is_active", true),
    admin
      .from("entitlement_cache")
      .select("user_id,is_active,plan_key,expires_at,source,environment,updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(100),
    admin
      .from("billing_events")
      .select("event_id,event_type,user_id,processed_at")
      .order("processed_at", { ascending: false })
      .limit(50),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since7),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since30),
    admin.from("entitlement_cache").select("plan_key,is_active,expires_at").eq("is_active", true),
    admin.from("admin_audit_log").select("*", { count: "exact", head: true }),
    getFeatureFlags(admin).catch(() => []),
  ]);

  const activeRows = (allActivePlans || []).filter((row) => {
    if (!row.expires_at) return true;
    return Date.parse(row.expires_at) >= Date.now();
  });
  const revenue = estimateRevenue(activeRows);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    viewer: { email: user?.email || null, id: user?.id || null, role: role || null },
    stats: {
      accounts: profileCount || 0,
      accountsWeek: signupWeek || 0,
      accountsMonth: signupMonth || 0,
      contact: contactCount || 0,
      contactNew: contactNew || 0,
      premiumActive: premiumActive || 0,
      planBreakdown: revenue.planBreakdown,
      mrr: revenue.mrr,
      arr: revenue.arr,
      lifetimeCount: revenue.lifetimeCount,
      currency: revenue.currency,
      auditEvents: auditCount || 0,
    },
    flags: flagsMap(flags),
    messages: messages || [],
    premium: entitlements || [],
    recentBilling: recentBilling || [],
  });
}
