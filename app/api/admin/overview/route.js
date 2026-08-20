import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { ok, user } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: waitlistCount },
    { count: waitlistWeek },
    { data: waitlist },
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
  ] = await Promise.all([
    admin.from("waitlist").select("*", { count: "exact", head: true }),
    admin.from("waitlist").select("*", { count: "exact", head: true }).gte("created_at", since7),
    admin.from("waitlist").select("id,email,source,created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("contact_messages").select("*", { count: "exact", head: true }),
    admin.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    admin
      .from("contact_messages")
      .select("id,name,email,topic,message,status,created_at")
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
    admin.from("entitlement_cache").select("plan_key").eq("is_active", true),
  ]);

  const planBreakdown = (allActivePlans || []).reduce((acc, row) => {
    const key = row.plan_key || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    viewer: { email: user?.email || null, id: user?.id || null },
    stats: {
      accounts: profileCount || 0,
      accountsWeek: signupWeek || 0,
      accountsMonth: signupMonth || 0,
      waitlist: waitlistCount || 0,
      waitlistWeek: waitlistWeek || 0,
      contact: contactCount || 0,
      contactNew: contactNew || 0,
      premiumActive: premiumActive || 0,
      planBreakdown,
    },
    waitlist: waitlist || [],
    messages: messages || [],
    premium: entitlements || [],
    recentBilling: recentBilling || [],
  });
}
