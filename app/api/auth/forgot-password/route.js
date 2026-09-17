import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Branded password-reset email. Always returns ok (no email enumeration). */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit({ key: `forgot:${ip}`, limit: 8, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

    if (!rateLimit({ key: `forgot-email:${email}`, limit: 3, windowMs: 60 * 60_000 })) {
      return NextResponse.json({ ok: true });
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonaura.com").replace(/\/$/, "");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      },
    });

    if (!error) {
      const resetUrl = data?.properties?.action_link;
      if (resetUrl) {
        await Promise.allSettled([sendPasswordResetEmail({ to: email, resetUrl })]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/forgot-password]", err?.message || err);
    return NextResponse.json({ ok: true });
  }
}
