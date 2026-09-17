import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security";

function loginWithMessage(origin, message, { cancelled = false } = {}) {
  const login = new URL("/login", origin);
  if (cancelled) login.searchParams.set("cancelled", "1");
  else if (message) login.searchParams.set("error", message);
  return NextResponse.redirect(login);
}

function requestOrigin(request) {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured;
  }
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return url.origin;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = requestOrigin(request);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthDesc = searchParams.get("error_description");
  // Relative path only — safeRedirectPath blocks //evil and absolute URLs.
  const next = safeRedirectPath(searchParams.get("next"), "/account");
  const nextUrl = new URL(next, `${origin}/`);

  if (oauthError) {
    const raw = `${oauthError} ${oauthDesc || ""}`;
    if (/access_denied|user_cancelled|user canceled|cancelled|canceled/i.test(raw)) {
      return loginWithMessage(origin, null, { cancelled: true });
    }
    const msg = oauthDesc || oauthError || "Could not finish sign-in.";
    return loginWithMessage(origin, msg);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return loginWithMessage(origin, error.message || "Could not finish sign-in.");
    }
    return NextResponse.redirect(nextUrl);
  }

  // No code and no provider error — incomplete callback.
  return loginWithMessage(origin, "Sign-in did not complete. Try again.");
}
