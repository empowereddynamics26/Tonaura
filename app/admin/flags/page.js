"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import "./flags.css";

/**
 * The set of flags that are dangerous to toggle. These require
 * an inline confirmation before the change is committed.
 */
const CRITICAL_KEYS = new Set([
  "maintenance_mode",
  "block_signups",
  "pause_checkouts",
]);

/**
 * Human-friendly impact descriptions, shown when a critical flag
 * is enabled. These appear in the confirmation dialog.
 */
const IMPACT_COPY = {
  maintenance_mode:
    "Every visitor will see the maintenance message and new checkouts will be blocked.",
  block_signups:
    "New visitors will not be able to create an account.",
  pause_checkouts:
    "Nobody will be able to purchase or upgrade to Premium.",
};

/**
 * Risk grouping. Flags in these groups render in separate sections,
 * with the critical ones at the top.
 */
function groupFlags(flags) {
  const critical = [];
  const product = [];
  for (const f of flags) {
    if (CRITICAL_KEYS.has(f.key)) critical.push(f);
    else product.push(f);
  }
  // Sort "on" first within each group.
  const sortOnFirst = (a, b) => Number(b.enabled) - Number(a.enabled);
  critical.sort(sortOnFirst);
  product.sort(sortOnFirst);
  return { critical, product };
}

function relativeTime(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * The toggle switch. Pure CSS — a checkbox is the semantic primitive;
 * the visual layer hides it and renders a styled pill instead.
 */
function Toggle({ enabled, busy, onChange, label }) {
  return (
    <label className={`ta-flag-toggle${enabled ? " is-on" : ""}${busy ? " is-busy" : ""}`}>
      <input
        type="checkbox"
        checked={enabled}
        disabled={busy}
        onChange={onChange}
        aria-label={label}
      />
      <span className="ta-flag-toggle-track" aria-hidden="true">
        <span className="ta-flag-toggle-knob" />
      </span>
    </label>
  );
}

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(null); // { key, enabled }

  async function load() {
    try {
      const res = await fetch("/api/admin/flags");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setFlags(json.flags || []);
    } catch {
      setError(
        "Could not load flags. Apply the admin_console_v2 migration if needed."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function commitToggle(key, enabled) {
    // Optimistic update — flip the flag locally first.
    const previous = flags;
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled } : f))
    );
    setBusy(key);
    setError("");
    setNotice("");
    setConfirming(null);

    try {
      const res = await fetch("/api/admin/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice(
        `${json.flag?.label || key} ${enabled ? "enabled" : "disabled"}.`
      );
      // Reconcile with the server's response — keeps updated_at fresh.
      setFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, ...json.flag } : f))
      );
    } catch (e) {
      // Rollback.
      setFlags(previous);
      setError(e.message || "Could not update flag.");
    } finally {
      setBusy("");
    }
  }

  function handleToggle(f, nextEnabled) {
    if (CRITICAL_KEYS.has(f.key)) {
      setConfirming({ key: f.key, enabled: nextEnabled, flag: f });
      return;
    }
    commitToggle(f.key, nextEnabled);
  }

  const { critical, product } = useMemo(() => groupFlags(flags), [flags]);

  /* Which critical flags are currently on — for the warning banner. */
  const activeCritical = critical.filter((f) => f.enabled);

  const totalOn = flags.filter((f) => f.enabled).length;

  return (
    <AdminShell
      title="Feature flags"
      section="Administration"
      subtitle="Kill switches and product toggles. Changes apply immediately."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {/* ── Warning banner when critical flags are enabled ────── */}
      {activeCritical.length > 0 ? (
        <div className="ta-flag-warning" role="alert">
          <span className="ta-flag-warning-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          <div className="ta-flag-warning-body">
            <strong>
              {activeCritical.length === 1
                ? "A critical flag is enabled."
                : `${activeCritical.length} critical flags are enabled.`}
            </strong>
            <span>
              {activeCritical.map((f) => f.label || f.key).join(", ")}
            </span>
          </div>
        </div>
      ) : null}

      {flags.length === 0 ? (
        <div className="ta-card">
          <div className="ta-empty">No flags defined.</div>
        </div>
      ) : (
        <>
          {/* ── Critical ──────────────────────────────────────── */}
          <section className="ta-flags-section">
            <header className="ta-flags-section-head">
              <div className="ta-flags-section-title-row">
                <h2>Critical</h2>
                {activeCritical.length > 0 ? (
                  <span className="ta-flags-section-count is-active">
                    {activeCritical.length} on
                  </span>
                ) : null}
              </div>
              <p>
                Take effect immediately for every visitor. Toggling any of
                these requires confirmation.
              </p>
            </header>

            <ul className="ta-flags-list">
              {critical.map((f) => {
                const isConfirming = confirming?.key === f.key;
                const isBusy = busy === f.key;
                const lastChange = relativeTime(f.updated_at);
                return (
                  <li
                    key={f.key}
                    className={`ta-flag-item${f.enabled ? " is-on" : ""}${
                      isConfirming ? " is-confirming" : ""
                    }`}
                  >
                    <div className="ta-flag-row">
                      <Toggle
                        enabled={f.enabled}
                        busy={isBusy}
                        onChange={() => handleToggle(f, !f.enabled)}
                        label={`Toggle ${f.label || f.key}`}
                      />
                      <div className="ta-flag-copy">
                        <div className="ta-flag-title-row">
                          <span className="ta-flag-label">
                            {f.label || f.key}
                          </span>
                          <span
                            className={`ta-flag-state${
                              f.enabled ? " is-on" : " is-off"
                            }`}
                          >
                            {f.enabled ? "On" : "Off"}
                          </span>
                        </div>
                        <p className="ta-flag-desc">{f.description}</p>
                        <p className="ta-flag-meta">
                          {lastChange
                            ? `Last changed ${lastChange}${
                                f.updated_by_email
                                  ? ` by ${f.updated_by_email}`
                                  : ""
                              }`
                            : "Never changed"}
                        </p>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="ta-flag-confirm">
                        <p className="ta-flag-confirm-text">
                          <strong>
                            {confirming.enabled ? "Enable" : "Disable"}{" "}
                            &ldquo;{f.label || f.key}&rdquo;?
                          </strong>{" "}
                          {confirming.enabled
                            ? IMPACT_COPY[f.key] ||
                              "This takes effect immediately for all users."
                            : "This restores the normal behaviour."}
                        </p>
                        <div className="ta-flag-confirm-actions">
                          <button
                            type="button"
                            className="ta-btn ta-btn-ghost"
                            onClick={() => setConfirming(null)}
                            disabled={isBusy}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className={`ta-btn ${
                              confirming.enabled
                                ? "ta-btn-danger"
                                : "ta-btn-gold"
                            }`}
                            onClick={() =>
                              commitToggle(f.key, confirming.enabled)
                            }
                            disabled={isBusy}
                          >
                            {isBusy
                              ? "Working…"
                              : confirming.enabled
                                ? "Yes, enable"
                                : "Yes, disable"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── Product ───────────────────────────────────────── */}
          <section className="ta-flags-section">
            <header className="ta-flags-section-head">
              <h2>Product</h2>
              <p>
                Safer toggles. They affect specific user segments and don&rsquo;t
                disrupt the whole site.
              </p>
            </header>

            <ul className="ta-flags-list">
              {product.map((f) => {
                const isBusy = busy === f.key;
                const lastChange = relativeTime(f.updated_at);
                return (
                  <li
                    key={f.key}
                    className={`ta-flag-item${f.enabled ? " is-on" : ""}`}
                  >
                    <div className="ta-flag-row">
                      <Toggle
                        enabled={f.enabled}
                        busy={isBusy}
                        onChange={() => handleToggle(f, !f.enabled)}
                        label={`Toggle ${f.label || f.key}`}
                      />
                      <div className="ta-flag-copy">
                        <div className="ta-flag-title-row">
                          <span className="ta-flag-label">
                            {f.label || f.key}
                          </span>
                          <span
                            className={`ta-flag-state${
                              f.enabled ? " is-on" : " is-off"
                            }`}
                          >
                            {f.enabled ? "On" : "Off"}
                          </span>
                        </div>
                        <p className="ta-flag-desc">{f.description}</p>
                        <p className="ta-flag-meta">
                          {lastChange
                            ? `Last changed ${lastChange}${
                                f.updated_by_email
                                  ? ` by ${f.updated_by_email}`
                                  : ""
                              }`
                            : "Never changed"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </AdminShell>
  );
}