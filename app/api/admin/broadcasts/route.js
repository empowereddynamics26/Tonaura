import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAuthEmails, writeAuditLog } from "@/lib/admin";
import { sendBroadcastEmail } from "@/lib/mail";

const SEGMENTS = new Set(["all", "free", "premium", "inactive"]);

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Could not load broadcasts." }, { status: 500 });
  return NextResponse.json({ broadcasts: data || [] });
}

async function resolveRecipients(admin, segment) {
  const { data: profiles } = await admin.from("profiles").select("id").limit(2000);
  const ids = (profiles || []).map((p) => p.id);
  if (!ids.length) return [];

  const { data: ents } = await admin
    .from("entitlement_cache")
    .select("user_id,is_active,expires_at")
    .in("user_id", ids);
  const entByUser = new Map((ents || []).map((e) => [e.user_id, e]));
  const emailById = await listAuthEmails(admin, { maxPages: 20 });

  const now = Date.now();
  const out = [];
  for (const id of ids) {
    const email = emailById.get(id);
    if (!email) continue;
    const ent = entByUser.get(id);
    const active = !!(ent && ent.is_active && (!ent.expires_at || Date.parse(ent.expires_at) >= now));
    if (segment === "premium" && !active) continue;
    if (segment === "free" && ent) continue;
    if (segment === "inactive" && (!ent || active)) continue;
    out.push({ id, email });
  }
  return out;
}

export async function POST(request) {
  const { ok, user } = await requireAdmin(request, { full: true });
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const subject = String(body?.subject || "").trim().slice(0, 200);
  const bodyHtml = String(body?.body_html || "").trim().slice(0, 20000);
  const segment = SEGMENTS.has(body?.segment) ? body.segment : "all";
  const sendNow = body?.send === true;

  if (!subject || !bodyHtml) {
    return NextResponse.json({ error: "subject and body_html required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: draft, error } = await admin
    .from("admin_broadcasts")
    .insert({
      subject,
      body_html: bodyHtml,
      segment,
      status: sendNow ? "sending" : "draft",
      created_by: user?.id || null,
    })
    .select("*")
    .single();

  if (error || !draft) {
    return NextResponse.json({ error: error?.message || "Could not create broadcast." }, { status: 500 });
  }

  if (!sendNow) {
    await writeAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "broadcast.draft",
      targetType: "broadcast",
      targetId: draft.id,
      meta: { segment, subject },
    });
    return NextResponse.json({ broadcast: draft });
  }

  const recipients = await resolveRecipients(admin, segment);
  let sent = 0;
  for (const r of recipients.slice(0, 500)) {
    const result = await sendBroadcastEmail({ to: r.email, subject, bodyHtml });
    if (!result?.skipped) sent += 1;
  }

  const { data: updated } = await admin
    .from("admin_broadcasts")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: sent,
    })
    .eq("id", draft.id)
    .select("*")
    .maybeSingle();

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "broadcast.send",
    targetType: "broadcast",
    targetId: draft.id,
    meta: { segment, subject, recipient_count: sent },
  });

  return NextResponse.json({ broadcast: updated || draft, recipient_count: sent });
}
