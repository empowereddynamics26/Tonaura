import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Admin-only — does not expose SMTP secrets. */
export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
    ok: true,
    mailConfigured: mailConfigured(),
  });
}
