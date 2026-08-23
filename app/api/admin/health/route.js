import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailConfigured } from "@/lib/mail";
import { getFeatureFlags, flagsMap } from "@/lib/admin";

export async function GET(request) {
  const { ok } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const checks = [];

  const push = (key, okFlag, detail) => checks.push({ key, ok: okFlag, detail });

  push("supabase_url", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), "NEXT_PUBLIC_SUPABASE_URL");
  push("service_role", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), "SUPABASE_SERVICE_ROLE_KEY");
  push("smtp", mailConfigured(), mailConfigured() ? "SMTP configured" : "SMTP_USER / SMTP_PASS missing");
  push("stripe_secret", Boolean(process.env.STRIPE_SECRET_KEY), "STRIPE_SECRET_KEY");
  push("stripe_webhook", Boolean(process.env.STRIPE_WEBHOOK_SECRET), "STRIPE_WEBHOOK_SECRET");
  push("site_url", Boolean(process.env.NEXT_PUBLIC_SITE_URL), process.env.NEXT_PUBLIC_SITE_URL || "unset");

  try {
    const { error } = await admin.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    push("db_profiles", !error, error?.message || "ok");
  } catch (e) {
    push("db_profiles", false, e?.message || "failed");
  }

  let flags = {};
  try {
    flags = flagsMap(await getFeatureFlags(admin));
  } catch {
    push("feature_flags", false, "table missing — run admin_console_v2 migration");
  }

  const healthy = checks.every((c) => c.ok) && !flags.maintenance_mode;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    healthy,
    checks,
    flags,
  });
}
