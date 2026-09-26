import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendAdminInviteEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/security";
import { writeAuditLog } from "@/lib/admin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["support", "admin", "super_admin"]);

/** Invite an admin — branded email + profiles.role. */
export async function POST(request) {
  try {
    const { ok, user } = await requireAdmin(request, { full: true });
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ip = clientIp(request);
    if (!rateLimit({ key: `admin-invite:${ip}`, limit: 10, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many invites. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const role = ROLES.has(body.role) ? body.role : "admin";
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonaura.com").replace(/\/$/, "");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/admin`,
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message || "Could not send invite." }, { status: 400 });
    }

    const invitedUserId = data?.user?.id;
    if (invitedUserId) {
      await admin.from("profiles").upsert(
        { id: invitedUserId, role, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    }

    const inviteUrl = data?.properties?.action_link;
    if (inviteUrl) {
      await Promise.allSettled([
        sendAdminInviteEmail({
          to: email,
          inviteUrl,
          invitedBy: user?.email || null,
        }),
      ]);
    }

    await writeAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "admin.invite",
      targetType: "user",
      targetId: invitedUserId || email,
      meta: { email, role },
    });

    return NextResponse.json({ ok: true, emailed: Boolean(inviteUrl), role });
  } catch (err) {
    console.error("[admin/invite]", err?.message || err);
    return NextResponse.json({ error: "Could not send invite." }, { status: 500 });
  }
}
