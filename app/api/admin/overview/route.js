import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { estimateRevenue, getFeatureFlags, flagsMap } from "@/lib/admin";
import { isAccessActive } from "@/lib/premiumAccess";

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
    { data: storeEntitlements },
    { data: recentBilling },
    { count: signupWeek },
    { count: signupMonth },
    { data: stripeRows },
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
    admin
      .from("store_entitlements")
      .select("user_id,is_active,plan_key,expires_at,store,environment,updated_at")
      .eq("is_active", true),
    admin
      .from("billing_events")
      .select("event_id,event_type,user_id,processed_at")
      .order("processed_at", { ascending: false })
      .limit(50),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since7),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since30),
    admin
      .from("entitlement_cache")
      .select("user_id,is_active,plan_key,expires_at,source,environment,updated_at")
      .eq("is_active", true),
    admin.from("admin_audit_log").select("*", { count: "exact", head: true }),
    getFeatureFlags(admin).catch(() => []),
  ]);

  const now = Date.now();
  const stripeActive = (stripeRows || []).filter((row) => isAccessActive(row, now));
  const storeActive = (storeEntitlements || []).filter((row) => isAccessActive(row, now));
  const stripeUserIds = new Set(stripeActive.map((row) => row.user_id));
  const premium = [
    ...stripeActive.map((row) => ({ ...row, source: row.source || "stripe", stripe_active: true })),
    ...storeActive
      .filter((row) => !stripeUserIds.has(row.user_id))
      .map((row) => ({
        user_id: row.user_id,
        is_active: true,
        plan_key: row.plan_key,
        expires_at: row.expires_at,
        source: row.store,
        environment: row.environment,
        updated_at: row.updated_at,
        stripe_active: false,
      })),
  ].sort((a, b) => Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0));
  const revenue = estimateRevenue(premium);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    viewer: { email: user?.email || null, id: user?.id || null, role: role || null },
    stats: {
      accounts: profileCount || 0,
      accountsWeek: signupWeek || 0,
      accountsMonth: signupMonth || 0,
      contact: contactCount || 0,
      contactNew: contactNew || 0,
      premiumActive: premium.length,
      planBreakdown: revenue.planBreakdown,
      mrr: revenue.mrr,
      arr: revenue.arr,
      lifetimeCount: revenue.lifetimeCount,
      currency: revenue.currency,
      auditEvents: auditCount || 0,
    },
    flags: flagsMap(flags),
    messages: messages || [],
    premium: premium.slice(0, 100),
    recentBilling: recentBilling || [],
  });
}
