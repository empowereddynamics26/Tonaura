import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMagicLinkEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Branded magic-link sign-in email. */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit({ key: `magic:${ip}`, limit: 8, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    const next = String(body.next || "/account").trim();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

    if (!rateLimit({ key: `magic-email:${email}`, limit: 3, windowMs: 60 * 60_000 })) {
      return NextResponse.json({ ok: true });
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonaura.io").replace(/\/$/, "");
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (!error) {
      const magicUrl = data?.properties?.action_link;
      if (magicUrl) {
        await Promise.allSettled([sendMagicLinkEmail({ to: email, magicUrl })]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/magic-link]", err?.message || err);
    return NextResponse.json({ ok: true });
  }
}
