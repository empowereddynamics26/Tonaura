"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SiteNav({ extra }) {
  const [isAdmin, setIsAdmin] = useState(false);

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
    <nav className="top">
      <a className="brand" href="/">
        Tonaura
      </a>
      <div className="top-links">
        {isAdmin ? (
          <a className="admin-nav" href="/admin">
            Admin
          </a>
        ) : null}
        {extra || <a href="/account">Account</a>}
      </div>
    </nav>
  );
}
