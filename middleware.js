import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function adminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ── Admin gate (existing) ────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", "/admin");
      return NextResponse.redirect(login);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const byRole = profile?.role === "admin";
    const byEmail = user.email && adminEmailSet().has(user.email.toLowerCase());
    if (!byRole && !byEmail) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // ─── NEW ─────────────────────────────────────────────────────────────────
  // Signed-in users shouldn't see the auth pages. Redirect them before
  // the page is ever rendered — no client-side flash.
  //
  // /reset-password is deliberately NOT in this list: a user resetting
  // their password has a valid recovery session and needs to reach the page.
  const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );
  if (isAuthRoute && user) {
    const rawNext = request.nextUrl.searchParams.get("next");
    // Open-redirect guard: only allow same-origin relative paths.
    const next =
      rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
        ? rawNext
        : "/account";
    return NextResponse.redirect(new URL(next, request.url));
  }
  // ─────────────────────────────────────────────────────────────────────────

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",     // ← keeps the admin API session fresh
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/checkout/:path*",
  ],
};