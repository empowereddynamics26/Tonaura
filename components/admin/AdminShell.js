"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "./Sidebar";
import { AdminTopBar } from "./TopBar";

export function AdminShell({ title, subtitle, children }) {
  const [state, setState] = useState({ loading: true, ok: false, email: "", error: "" });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          if (alive) setState({ loading: false, ok: false, email: "", error: "signed-out" });
          return;
        }
        // The API is authoritative for support/admin/super_admin and ADMIN_EMAILS.
        const res = await fetch("/api/admin/overview");
        if (!res.ok) {
          if (alive)
            setState({
              loading: false,
              ok: false,
              email: data.user.email || "",
              error: res.status === 403 ? "forbidden" : "api",
            });
          return;
        }
        if (alive) setState({ loading: false, ok: true, email: data.user.email || "", error: "" });
      } catch {
        if (alive) setState({ loading: false, ok: false, email: "", error: "api" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (state.loading) {
    return (
      <div className="ta-admin-root">
        <div className="ta-loading">Loading admin console…</div>
      </div>
    );
  }

  if (!state.ok) {
    return (
      <div className="ta-admin-root">
        <div className="ta-gate">
          <div className="ta-gate-card">
            <div className="ta-brand" style={{ padding: 0, marginBottom: 16 }}>
              <img src="/images/brand/mark.png" alt="" width={36} height={36} />
              <div>
                <div className="ta-brand-name">Tonaura</div>
                <div className="ta-brand-sub">Admin Console</div>
              </div>
            </div>
            <h1>{state.error === "signed-out" ? "Sign in required" : "Access restricted"}</h1>
            <p>
              {state.error === "signed-out"
                ? "Sign in with an admin account to open the Tonaura console."
                : "This account does not have admin access. Set profiles.role = admin or add your email to ADMIN_EMAILS."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
            subtitle={subtitle}
            email={state.email}
            onMenu={() => setMenuOpen(true)}
            onSignOut={signOut}
          />
          <main className="ta-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
