"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SiteNav({ extra }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user || !alive) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (alive) setIsAdmin(profile?.role === "admin");
      } catch {
        // Guest / misconfigured — no admin link.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <nav className={`site-nav ${menuOpen ? "is-open" : ""}`}>
      <div className="site-nav-inner">
        <a className="site-brand" href="/">
          <img src="/images/brand/lockup.png" width="168" height="54" alt="Tonaura" />
        </a>
        <button
          type="button"
          className="site-burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
        <div className="site-nav-links">
          <a href="/#inside">Inside</a>
          <a href="/#how">How it works</a>
          <a href="/#pricing">Pricing</a>
          <a href="/about.html">About</a>
          {isAdmin ? (
            <a className="admin-nav" href="/admin">
              Admin
            </a>
          ) : null}
          <a href="/account">Account</a>
          {extra}
          <a className="site-nav-cta" href="/login">
            Sign in
          </a>
        </div>
      </div>
    </nav>
  );
}
