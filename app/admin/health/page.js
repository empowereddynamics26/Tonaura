"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import "./health.css";

/**
 * Display names for the check keys returned by /api/admin/health.
 * If a key isn't listed, the raw key is shown instead — so the page
 * never breaks when a new check is added on the server.
 */
const CHECK_LABELS = {
  supabase_url: "Supabase URL",
  supabase_anon: "Supabase publishable key",
  supabase_service_role: "Service role key",
  service_role: "Service role key",
  stripe_secret: "Stripe secret key",
  stripe_webhook: "Stripe webhook secret",
  stripe_prices: "Stripe price IDs",
  smtp_host: "SMTP host",
  smtp_user: "SMTP user",
  smtp_pass: "SMTP password",
  mail_from: "Mail from address",
  admin_emails: "ADMIN_EMAILS",
  site_url: "Site URL",
};

/**
 * Longer descriptions, shown under each label. Optional — if a key
 * isn't here, only the label + detail are shown.
 */
const CHECK_DESCRIPTIONS = {
  supabase_url:
    "Where the app reads and writes auth, profiles, and entitlements.",
  supabase_anon:
    "Public key used by the browser client. Safe to expose in the site.",
  supabase_service_role:
    "Secret key for admin API routes. Never exposed to the browser.",
  service_role:
    "Secret key for admin API routes. Never exposed to the browser.",
  stripe_secret:
    "Server key for creating checkouts and the customer portal.",
  stripe_webhook:
    "Signing secret for verifying Stripe webhook events.",
  stripe_prices:
    "Price IDs for monthly, yearly, and lifetime plans.",
  smtp_host:
    "Mail server used for signup confirmations, receipts, and replies.",
  smtp_user:
    "Sender address used by the app when sending transactional email.",
  smtp_pass:
    "App password for the mail server. Never exposed to the browser.",
  mail_from:
    "Reply-to and 'from' address shown in recipient inboxes.",
  admin_emails:
    "Comma-separated list of emails with admin access, in addition to profiles.role.",
  site_url:
    "Canonical site URL. Used in emails and redirect links.",
};

function relativeTime(iso) {
  if (!iso) return "just now";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}

function friendlyCheckKey(key) {
  return CHECK_LABELS[key] || key.replace(/_/g, " ");
}

function friendlyFlagKey(key) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function StatusIcon({ ok }) {
  if (ok) {
    return (
      <span className="ta-health-check-icon ta-health-check-icon--ok">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12 5 5 9-11" />
        </svg>
      </span>
    );
  }
  return (
    <span className="ta-health-check-icon ta-health-check-icon--warn">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v5" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="10" opacity="0.5" />
      </svg>
    </span>
  );
}

export default function AdminHealthPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/health");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setData(json);
      } catch {
        setError("Could not load health.");
      }
    })();
  }, []);

  const checks = data?.checks || [];
  const flags = Object.entries(data?.flags || {});
  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.length - passed;

  return (
    <AdminShell
      title="System health"
      section="Overview"
      subtitle="Environment, integrations, and feature flag status."
    >
      {error ? <div className="ta-error">{error}</div> : null}

      {!data && !error ? (
        <div className="ta-muted">Checking system…</div>
      ) : null}

      {data ? (
        <div className="ta-health">
          {/* ── Overall status ──────────────────────────────────── */}
          <section
            className={`ta-health-hero${
              data.healthy ? " is-healthy" : " is-attention"
            }`}
          >
            <span className="ta-health-hero-dot" aria-hidden="true" />
            <div className="ta-health-hero-copy">
              <h2 className="ta-health-hero-title">
                {data.healthy
                  ? "All systems healthy"
                  : `${failed} ${
                      failed === 1 ? "check needs" : "checks need"
                    } attention`}
              </h2>
              <p className="ta-health-hero-sub">
                Checked {relativeTime(data.generatedAt)} ·{" "}
                {passed} of {checks.length} checks passed
              </p>
            </div>
          </section>

          {/* ── Checks list ─────────────────────────────────────── */}
          <section className="ta-health-section">
            <header className="ta-health-section-head">
              <h3>Environment checks</h3>
              <p>
                Configuration the app reads on every deploy. A failed check
                usually means a missing env var.
              </p>
            </header>

            {checks.length === 0 ? (
              <div className="ta-card">
                <div className="ta-empty">No checks reported.</div>
              </div>
            ) : (
              <ul className="ta-health-checks">
                {checks.map((c) => (
                  <li
                    key={c.key}
                    className={`ta-health-check${
                      c.ok ? " is-ok" : " is-warn"
                    }`}
                  >
                    <StatusIcon ok={c.ok} />
                    <div className="ta-health-check-body">
                      <div className="ta-health-check-head">
                        <span className="ta-health-check-label">
                          {friendlyCheckKey(c.key)}
                        </span>
                        <span
                          className={`ta-health-check-status${
                            c.ok ? " is-ok" : " is-warn"
                          }`}
                        >
                          {c.ok ? "OK" : "Missing"}
                        </span>
                      </div>
                      {CHECK_DESCRIPTIONS[c.key] ? (
                        <p className="ta-health-check-desc">
                          {CHECK_DESCRIPTIONS[c.key]}
                        </p>
                      ) : null}
                      {c.detail ? (
                        <p className="ta-health-check-detail">
                          {c.detail}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Feature flags ───────────────────────────────────── */}
          <section className="ta-health-section">
            <header className="ta-health-section-head">
              <h3>Feature flags</h3>
              <p>
                Toggle behaviour without a deploy. Manage these on the{" "}
                <a href="/admin/flags">Feature flags</a> page.
              </p>
            </header>

            {flags.length === 0 ? (
              <div className="ta-card">
                <div className="ta-empty">No feature flags defined.</div>
              </div>
            ) : (
              <ul className="ta-health-flags">
                {flags.map(([key, value]) => {
                  const on = value === true || value === "true";
                  return (
                    <li key={key} className="ta-health-flag">
                      <span className="ta-health-flag-name">
                        {friendlyFlagKey(key)}
                      </span>
                      <span
                        className={`ta-health-flag-state${
                          on ? " is-on" : " is-off"
                        }`}
                      >
                        <span className="ta-health-flag-dot" aria-hidden="true" />
                        {on ? "On" : "Off"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}