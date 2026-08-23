import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/admin";
import { sendContactReplyEmail } from "@/lib/mail";

export async function POST(request) {
  const { ok, user } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = body?.id;
  const status = body?.status;
  const reply = typeof body?.reply === "string" ? body.reply.trim() : "";
  if (!id) return NextResponse.json({ error: "id required." }, { status: 400 });

  const admin = createAdminClient();

  if (reply) {
    const { data: row, error: loadErr } = await admin
      .from("contact_messages")
      .select("id,name,email,message")
      .eq("id", id)
      .maybeSingle();
    if (loadErr || !row) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    if (!row.email) return NextResponse.json({ error: "No email on message." }, { status: 400 });

    const mailResult = await sendContactReplyEmail({
      to: row.email,
      name: row.name,
      reply,
      originalMessage: row.message,
    });

    const { error } = await admin
      .from("contact_messages")
      .update({
        status: "replied",
        admin_reply: reply,
        replied_at: new Date().toISOString(),
        replied_by: user?.id || null,
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: "Could not save reply." }, { status: 500 });

    await writeAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "contact.reply",
      targetType: "contact_message",
      targetId: id,
      meta: { to: row.email, mailed: !mailResult?.skipped },
    });

    return NextResponse.json({ ok: true, status: "replied", mailed: !mailResult?.skipped });
  }

  if (!["new", "read", "replied", "archived"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { error } = await admin.from("contact_messages").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update." }, { status: 500 });

  await writeAuditLog({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "contact.status",
    targetType: "contact_message",
    targetId: id,
    meta: { status },
  });

  return NextResponse.json({ ok: true });
}
