import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlatformSettings, writeAuditLog } from "@/lib/admin";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const settings = await getPlatformSettings(admin);
  return NextResponse.json({ settings });
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

  const patch = {
    updated_at: new Date().toISOString(),
    updated_by: user?.id || null,
  };
  if (typeof body.maintenance_message === "string") {
    patch.maintenance_message = body.maintenance_message.slice(0, 500);
  }
  if (typeof body.support_email === "string") {
    patch.support_email = body.support_email.trim().slice(0, 200);
  }
  if (typeof body.from_name === "string") {
    patch.from_name = body.from_name.trim().slice(0, 80);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platform_settings")
    .upsert({ id: 1, ...patch }, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not save settings." }, { status: 500 });

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "settings.update",
    targetType: "platform_settings",
    targetId: "1",
    meta: patch,
  });

  return NextResponse.json({ settings: data });
}
