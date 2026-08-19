import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const [{ count: waitlistCount }, { data: waitlist }, { data: messages }, { data: entitlements }] = await Promise.all([
    admin.from("waitlist").select("*", { count: "exact", head: true }),
    admin.from("waitlist").select("id,email,source,created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50),
    admin.from("entitlement_cache").select("user_id,is_active,plan_key,expires_at,source").eq("is_active", true),
  ]);
  return NextResponse.json({
    waitlistCount: waitlistCount || 0,
    waitlist: waitlist || [],
    messages: messages || [],
    premiumCount: (entitlements || []).length,
  });
}
