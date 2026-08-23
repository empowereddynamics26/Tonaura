import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { sendSecurityAlertEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";

/** Security alert for the signed-in user only (password / email changes). */
export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const ip = clientIp(request);
    if (!rateLimit({ key: `security-alert:${ip}`, limit: 10, windowMs: 60_000 })) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || user.email).trim().toLowerCase();
    if (email !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const eventLabel = String(body.eventLabel || "Account change").trim().slice(0, 120);
    const detail = body.detail ? String(body.detail).trim().slice(0, 500) : "";

    await Promise.allSettled([
      sendSecurityAlertEmail({ to: email, eventLabel, detail }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/security-alert]", err?.message || err);
    return NextResponse.json({ ok: true });
  }
}
