"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tonaura_cookie_prefs";

export function CookieModal() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnalytics(!!parsed.analytics);
        return;
      }
    } catch {
      // ignore malformed storage
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    function onOpen() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAnalytics(!!parsed.analytics);
        }
      } catch {
        // ignore
      }
      setOpen(true);
    }
    window.addEventListener("tonaura:open-cookie-prefs", onOpen);
    return () =>
      window.removeEventListener("tonaura:open-cookie-prefs", onOpen);
  }, []);

  function save(prefs) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: prefs,
          savedAt: Date.now(),
        })
      );
    } catch {
      // ignore storage errors (private mode etc.)
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="cookie-backdrop"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        className="cookie-modal"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="cookie-diamond" aria-hidden="true" />
        <h2 id="cookie-title">Cookie preferences</h2>
        <p>
          Essential cookies keep the site working. Analytics help us
          improve — optional.
        </p>

        <label className="cookie-toggle">
          <span className="cookie-toggle-label">
            Analytics cookies
            <span className="cookie-toggle-hint">
              Help us understand what&rsquo;s working
            </span>
          </span>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
          />
          <span className="cookie-switch" aria-hidden="true" />
        </label>

        <div className="cookie-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => save(false)}
          >
            Essential only
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => save(analytics)}
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}