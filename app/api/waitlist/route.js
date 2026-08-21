import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistAckEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit({ key: `waitlist:${ip}`, limit: 8, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    const source = String(body.source || "website").trim().slice(0, 80);

    if (!rateLimit({ key: `waitlist-email:${email}`, limit: 3, windowMs: 60 * 60_000 })) {
      return NextResponse.json({ ok: true, already: true });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("waitlist").insert({ email, source });
    if (error && error.code === "23505") return NextResponse.json({ ok: true, already: true });
    if (error) return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
    await Promise.allSettled([sendWaitlistAckEmail({ to: email })]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
  }
}
