import { NextResponse } from "next/server";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Lightweight check: does not send mail or expose secrets. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    mailConfigured: mailConfigured(),
    host: process.env.SMTP_HOST || "smtp.fastmail.com",
    userSet: Boolean((process.env.SMTP_USER || "").trim()),
    passSet: Boolean((process.env.SMTP_PASS || "").trim()),
    supportInbox: process.env.MAIL_SUPPORT_INBOX || process.env.MAIL_FROM_SUPPORT || "support@tonaura.io",
  });
}
