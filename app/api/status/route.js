import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public, non-secret status checks for status.html.
 * Does not report admin-only config or invent healthy systems we cannot measure.
 */
export async function GET() {
  const checkedAt = new Date().toISOString();
  const checks = [];

  // This response itself proves the website/API edge is reachable.
  checks.push({
    id: "website",
    name: "Website",
    status: "operational",
    detail: "This status API responded.",
  });

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  if (!supabaseUrl) {
    checks.push({
      id: "auth",
      name: "Sign-in & sync",
      status: "unavailable",
      detail: "Auth host is not configured in this environment.",
    });
  } else {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);
      if (res.ok) {
        checks.push({
          id: "auth",
          name: "Sign-in & sync",
          status: "operational",
          detail: "Auth health endpoint responded.",
        });
      } else {
        checks.push({
          id: "auth",
          name: "Sign-in & sync",
          status: "degraded",
          detail: `Auth health returned HTTP ${res.status}.`,
        });
      }
    } catch (err) {
      checks.push({
        id: "auth",
        name: "Sign-in & sync",
        status: "unavailable",
        detail: err?.name === "AbortError" ? "Auth health timed out." : "Auth health could not be reached.",
      });
    }
  }

  // Billing/email are not safely measurable from a public endpoint without leaking config.
  checks.push({
    id: "billing",
    name: "Billing (Stripe)",
    status: "unavailable",
    detail: "Not publicly measurable from this page.",
  });
  checks.push({
    id: "email",
    name: "Transactional email",
    status: "unavailable",
    detail: "Not publicly measurable from this page.",
  });

  const summary =
    checks.some((c) => c.status === "unavailable" && (c.id === "website" || c.id === "auth"))
      ? "partial"
      : checks.every((c) => c.status === "operational" || c.status === "unavailable")
        ? "mixed"
        : "mixed";

  return NextResponse.json(
    {
      checkedAt,
      summary,
      checks,
      note: "Systems we cannot measure are marked Status Unavailable — never assumed green.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
