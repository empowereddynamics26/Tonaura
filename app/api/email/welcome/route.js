import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mail";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recent = new Map();

function rateOk(ip, email) {
  const key = `${ip}|${email}`;
  const now = Date.now();
  const last = recent.get(key) || 0;
  if (now - last < 60_000) return false;
  recent.set(key, now);
  if (recent.size > 500) {
    for (const [k, t] of recent) {
      if (now - t > 300_000) recent.delete(k);
    }
  }
  return true;
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    const ip = request.headers.get("x-forwarded-for") || "local";
    if (!rateOk(ip, email)) return NextResponse.json({ ok: true });
    await sendWelcomeEmail({ to: email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[welcome email]", err);
    return NextResponse.json({ ok: true });
  }
}
