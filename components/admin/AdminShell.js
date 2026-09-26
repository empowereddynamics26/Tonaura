"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "./Sidebar";
import { AdminTopBar } from "./TopBar";
import { LoadingState } from "@/components/ui/LoadingState";

const ROLE_CACHE_KEY = "tonaura_admin_role";

export function AdminShell({ title, section = "Overview", subtitle, children }) {
  const [state, setState] = useState({
    loading: true,
    ok: false,
    email: "",
    role: "admin",
    error: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
  let alive = true;

  (async () => {
    try {
      // Fast path: role cached from a previous visit this session.
      const cachedRole =
        typeof window !== "undefined"
          ? sessionStorage.getItem(ROLE_CACHE_KEY)
          : null;

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!alive) return;

      if (!data.user) {
        // No session at all. The middleware should have redirected us,
        // but if it didn't, render the gate gracefully.
        setState({
          loading: false,
          ok: false,
          email: "",
          role: cachedRole || "admin",
          error: "signed-out",
        });
        return;
      }

      // Resolve the role from profiles. If cached, use it.
      // We do NOT check admin permissions here — the middleware
      // guarantees that only admins reach this page. If a non-admin
      // somehow gets through, individual API calls will fail with 403
      // and the specific pages will surface that.
      let role = cachedRole;

      if (!role) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();
          role = profile?.role || "admin";
        } catch {
          role = "admin";
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem(ROLE_CACHE_KEY, role);
        }
      }

      if (!alive) return;

      setState({
        loading: false,
        ok: true,
        email: data.user.email || "",
        role,
        error: "",
      });
    } catch {
      if (alive) {
        setState({
          loading: false,
          ok: false,
          email: "",
          role: "admin",
          error: "api",
        });
      }
    }
  })();

  return () => {
    alive = false;
  };
}, []);

async function signOut() {
  // Clear the cached role and the welcome flag so the next session
  // starts fresh.
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ROLE_CACHE_KEY);
    sessionStorage.removeItem("tonaura_welcomed");
  }
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/login";
}

  if (state.loading) {
    return <LoadingState label="Opening admin console" size="lg" />;
  }

  if (!state.ok) {
    return (
      <div className="ta-admin-root">
        <div className="ta-gate">
          <div className="ta-gate-card">
            <span className="ta-gate-diamond" aria-hidden="true" />

            <div className="ta-gate-brand">
              <img src="/images/brand/mark.png" alt="" width={36} height={36} />
              <div>
                <div className="ta-gate-brand-name">Tonaura</div>
                <div className="ta-gate-brand-sub">Admin Console</div>
              </div>
            </div>

            <h1 className="ta-gate-title">
              {state.error === "signed-out"
                ? "Sign in required"
                : "Access restricted"}
            </h1>

            <p className="ta-gate-body">
              {state.error === "signed-out"
                ? "Sign in with an admin account to open the Tonaura console."
                : "This account does not have admin access. Set profiles.role = admin or add your email to ADMIN_EMAILS."}
            </p>

            <div className="ta-gate-actions">
              <a className="ta-btn ta-btn-gold" href="/login?next=/admin">
                Sign in
              </a>
              <a className="ta-btn ta-btn-ghost" href="/">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-admin-root">
      <div className="ta-shell">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="ta-main">
          <AdminTopBar
            title={title}
            section={section}
            email={state.email}
            role={state.role}
            onMenu={() => setMenuOpen(true)}
            onSignOut={signOut}
          />
          <main className="ta-content">{children}</main>
        </div>
      </div>
    </div>
  );
}