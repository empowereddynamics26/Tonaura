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

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/checkout/:path*",
  ],
};
