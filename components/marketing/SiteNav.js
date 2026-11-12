"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The Supabase client (~75 KB gzipped) is loaded on demand, only when the
// visitor might be signed in. Signed-out visitors (most traffic) never
// download it on marketing pages and make no auth/profile requests.
const loadSupabase = () =>
  import("@/lib/supabase/client").then((m) => m.createClient());

// @supabase/ssr keeps the session in `sb-<project>-auth-token` cookies
// (chunked as `.0`, `.1`, … when large). Not httpOnly, so readable here.
const AUTH_COOKIE_RE = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/;

function mightHaveSession() {
  if (AUTH_COOKIE_RE.test(document.cookie)) return true;
  // Implicit-flow links land with tokens in the hash; let the client
  // (detectSessionInUrl) pick them up as before.
  return /(?:access_token|refresh_token)=/.test(window.location.hash);
}

// Admin flag cached per tab so the nav does not query `profiles` on every
// full page load. Only cosmetic — /admin is enforced by middleware.
const ADMIN_FLAG_KEY = "tonaura_nav_admin";

/**
 * SiteNav — the single navigation for every public page.
 *
 * Design (Phase 4):
 *   - Transparent at top, soft glass plaque on scroll
 *   - Links: Home · How it works · Pricing · Compare · About
 *   - Signed out: Sign in (text) + Sign up (gold pill)
 *   - Signed in:  avatar chip → dropdown (Account · Admin · Sign out)
 *   - Mobile:     slide-down panel, actions reflect auth state
 */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
];

export function SiteNav({ extra }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  /* ---- Session + admin flag ---- */
  useEffect(() => {
    let alive = true;

    // No auth cookie → definitely signed out. Skip the client entirely.
    if (!mightHaveSession()) {
      setUser(null);
      setUserLoaded(true);
      return;
    }

    (async () => {
      try {
        const supabase = await loadSupabase();
        // getSession() reads the cookie locally (it only hits the network to
        // refresh an expired token). The nav just needs the email/initial,
        // so the extra /auth/v1/user round trip from getUser() is skipped;
        // protected pages still verify the user server-side.
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUser = session?.user || null;
        if (!alive) return;

        setUser(sessionUser);
        setUserLoaded(true);
        if (!sessionUser) return;

        let cached = null;
        try {
          cached = JSON.parse(sessionStorage.getItem(ADMIN_FLAG_KEY) || "null");
        } catch {
          // ignore unreadable storage
        }
        if (cached && cached.id === sessionUser.id) {
          setIsAdmin(!!cached.admin);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .maybeSingle();
        const admin = profile?.role === "admin";
        try {
          sessionStorage.setItem(
            ADMIN_FLAG_KEY,
            JSON.stringify({ id: sessionUser.id, admin })
          );
        } catch {
          // ignore storage errors (private mode etc.)
        }
        if (alive) setIsAdmin(admin);
      } catch {
        if (alive) {
          setUser(null);
          setUserLoaded(true);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---- Close menus on route change ---- */
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  /* ---- Solid nav on scroll ---- */
  // rAF-throttled, and React state only changes when the threshold is
  // actually crossed (not on every scroll frame).
  const scrolledRef = useRef(false);
  useEffect(() => {
    let ticking = false;
    function update() {
      ticking = false;
      const next = window.scrollY > 40;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- Body lock while mobile menu is open ---- */
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("nav-menu-open");
    } else {
      document.body.classList.remove("nav-menu-open");
    }
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  /* ---- Close account dropdown on outside click / Escape ---- */
  useEffect(() => {
    if (!accountOpen) return;
    function onDocClick(e) {
      if (!e.target.closest(".site-nav-account")) setAccountOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [accountOpen]);

 async function signOut() {
  // Clear the welcome flag so the transition greets the next sign-in.
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("tonaura_welcomed");
    sessionStorage.removeItem(ADMIN_FLAG_KEY);
  }
  try {
    const supabase = await loadSupabase();
    await supabase.auth.signOut();
  } catch {
    // ignore — we still navigate
  }
  window.location.href = "/";
}

  const isActive = (href) => {
    if (href.startsWith("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const signedIn = userLoaded && !!user;
  const initial =
    user?.email?.[0]?.toUpperCase() ||
    user?.user_metadata?.full_name?.[0]?.toUpperCase() ||
    "·";

  return (
    <>
      <nav
        className={`site-nav${scrolled ? " is-solid" : ""}${menuOpen ? " is-open" : ""}`}
        aria-label="Primary"
      >
        <div className="site-nav-inner">
          <Link className="site-brand" href="/" aria-label="Tonaura home">
            <img
              src="/images/brand/lockup.webp"
              width="180"
              height="58"
              alt="Tonaura"
            />
          </Link>

          <div className="site-nav-links" id="site-nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${isActive(link.href) ? " is-active" : ""}`}
              >
                {isActive(link.href) ? (
                  <span className="site-nav-active-dot" aria-hidden="true" />
                ) : null}
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link className="site-nav-link site-nav-admin" href="/admin">
                Admin
              </Link>
            ) : null}
            {extra}

            {/* Mobile-only action buttons — reflect auth state */}
            <div className="site-nav-mobile-actions">
              {signedIn ? (
                <>
                  <Link
                    className="btn btn--primary"
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={signOut}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="btn btn--primary"
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                  <Link
                    className="btn btn--ghost"
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="site-nav-end">
            {!userLoaded ? (
              <span className="site-nav-end-placeholder" aria-hidden="true" />
            ) : signedIn ? (
              <div className={`site-nav-account${accountOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="site-nav-avatar"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  <span className="site-nav-avatar-initial" aria-hidden="true">
                    {initial}
                  </span>
                </button>

                {accountOpen ? (
                  <div className="site-nav-account-menu" role="menu">
                    <p className="site-nav-account-email" role="presentation">
                      {user.email}
                    </p>
                    <Link
                      className="site-nav-account-item"
                      href="/account"
                      role="menuitem"
                    >
                      Account
                    </Link>
                    {isAdmin ? (
                      <Link
                        className="site-nav-account-item"
                        href="/admin"
                        role="menuitem"
                      >
                        Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="site-nav-account-item site-nav-account-item--quiet"
                      onClick={signOut}
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link className="site-nav-signin" href="/login">
                  <span>Sign in</span>
                </Link>
                <Link className="site-nav-signup" href="/signup">
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              className="site-nav-burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-nav-links"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="site-nav-burger-bar site-nav-burger-bar--1" />
              <span className="site-nav-burger-bar site-nav-burger-bar--2" />
              <span className="site-nav-burger-bar site-nav-burger-bar--3" />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen ? (
        <button
          type="button"
          className="site-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  );
}