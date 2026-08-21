import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mail";
import { getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Welcome mail is only for the signed-in user's own address — not a public mailer. */
export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.honey || body._honey) return NextResponse.json({ ok: true });

    const email = String(body.email || user.email).trim().toLowerCase();
    if (!EMAIL.test(email) || email !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const ip = clientIp(request);
    if (!rateLimit({ key: `welcome:${ip}:${email}`, limit: 3, windowMs: 60 * 60_000 })) {
      return NextResponse.json({ ok: true });
    }

    await sendWelcomeEmail({ to: email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[welcome email]", err);
    return NextResponse.json({ ok: true });
  }
}
