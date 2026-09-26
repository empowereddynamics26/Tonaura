"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * AdminTopBar — the admin console's header.
 *
 * Left: menu button (mobile), then page title (serif) with a section
 * label beneath it.
 * Right: a single account chip — avatar, role, chevron. Click to open
 * a small dropdown with the email, a link to /account, and sign out.
 */
export function AdminTopBar({
  title,
  section = "Overview",
  email,
  role = "admin",
  onMenu,
  onSignOut,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const initial = (email || "A").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <header className="ta-topbar">
      <button
        type="button"
        className="ta-menu-btn"
        aria-label="Open menu"
        onClick={onMenu}
      >
        ☰
      </button>

      <div className="ta-top-titles">
        <h1>{title}</h1>
        {section ? <p className="ta-top-section">{section}</p> : null}
      </div>

      <div className="ta-top-end" ref={menuRef}>
     <button
  type="button"
  className={`ta-user-chip${open ? " is-open" : ""}`}
  data-role={role}
  onClick={() => setOpen((v) => !v)}
  aria-haspopup="menu"
  aria-expanded={open}
>
          <span className="ta-avatar" aria-hidden="true">
            {initial}
          </span>
         <span className="ta-user-role">
  {role.replace(/_/g, " ")}
</span>
          <span className="ta-user-chev" aria-hidden="true">
            <ChevronDown />
          </span>
        </button>

        {open ? (
          <div className="ta-user-menu" role="menu">
            <div className="ta-user-menu-head">
              <span className="ta-user-menu-email">{email || "—"}</span>
              <span className="ta-user-menu-role">{role}</span>
            </div>
            <Link
              href="/account"
              className="ta-user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Account
            </Link>
            <Link
              href="/"
              className="ta-user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Public site
            </Link>
            <button
              type="button"
              className="ta-user-menu-item ta-user-menu-item--quiet"
              onClick={onSignOut}
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}