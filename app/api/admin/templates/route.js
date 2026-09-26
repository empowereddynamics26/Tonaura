import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/admin";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("email_templates").select("*").order("label");
  if (error) return NextResponse.json({ error: "Could not load templates." }, { status: 500 });
  return NextResponse.json({ templates: data || [] });
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
  if (!key) return NextResponse.json({ error: "key required." }, { status: 400 });

  const patch = {
    updated_at: new Date().toISOString(),
    updated_by: user?.id || null,
  };
  if (typeof body.subject === "string") patch.subject = body.subject.slice(0, 200);
  if (typeof body.body_html === "string") patch.body_html = body.body_html.slice(0, 20000);
  if (typeof body.label === "string") patch.label = body.label.slice(0, 120);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_templates")
    .update(patch)
    .eq("key", key)
    .select("*")
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Template not found." }, { status: 404 });

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "template.update",
    targetType: "email_template",
    targetId: key,
    meta: { subject: data.subject },
  });

  return NextResponse.json({ template: data });
}
