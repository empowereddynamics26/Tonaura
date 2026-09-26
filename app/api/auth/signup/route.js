import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerifyEmail, sendWelcomeEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign up via generateLink + branded verify/welcome mail.
 * Prefer turning off Supabase's built-in confirmation email (or custom SMTP templates)
 * so users don't get duplicate messages.
 */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit({ key: `signup:${ip}`, limit: 8, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (!rateLimit({ key: `signup-email:${email}`, limit: 5, windowMs: 60 * 60_000 })) {
      return NextResponse.json({ error: "Too many signups for this email." }, { status: 429 });
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonaura.com").replace(/\/$/, "");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: `${origin}/auth/callback?next=/account`,
      },
    });

    if (error) {
      const msg = error.message || "Could not create that account.";
      if (/already|registered|exists/i.test(msg)) {
        return NextResponse.json(
          { error: "An account with that email already exists. Sign in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const verifyUrl = data?.properties?.action_link;
    if (verifyUrl) {
      await Promise.allSettled([
        sendVerifyEmail({ to: email, verifyUrl }),
        sendWelcomeEmail({ to: email }),
      ]);
    } else {
      await Promise.allSettled([sendWelcomeEmail({ to: email })]);
    }

    return NextResponse.json({ ok: true, needsConfirmation: Boolean(verifyUrl) });
  } catch (err) {
    console.error("[auth/signup]", err?.message || err);
    return NextResponse.json({ error: "Could not create that account." }, { status: 500 });
  }
}
