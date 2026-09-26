import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_audit_log")
    .select("id,actor_id,actor_email,action,target_type,target_id,meta,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: "Could not load audit log." }, { status: 500 });
  return NextResponse.json({ events: data || [] });
}
