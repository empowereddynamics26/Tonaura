import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailConfigured, notifySupportInbox, sendContactAckEmail } from "@/lib/mail";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const topic = String(body.topic || "general").trim().slice(0, 80);
    const message = String(body.message || "").trim();
    if (name.length < 1 || name.length > 120) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (message.length < 1 || message.length > 8000) return NextResponse.json({ error: "Enter a message." }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name,
      email,
      topic: topic || "general",
      message,
    });
    if (error) return NextResponse.json({ error: "Could not send that message." }, { status: 500 });

    const mailResults = await Promise.allSettled([
      sendContactAckEmail({ to: email, name }),
      notifySupportInbox({
        subject: `Contact: ${topic || "general"} — ${name}`,
        text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
      }),
    ]);
    const mailed = mailResults.every(
      (r) => r.status === "fulfilled" && r.value && r.value.ok
    );

    return NextResponse.json({
      ok: true,
      mailed,
      mailConfigured: mailConfigured(),
    });
  } catch {
    return NextResponse.json({ error: "Could not send that message." }, { status: 500 });
  }
}
