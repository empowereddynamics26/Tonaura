"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";
import "./subscriptions.css";

const PLAN_FILTERS = [
  { id: "all", label: "All plans" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "lifetime", label: "Lifetime" },
  { id: "premium", label: "Other" },
];

const SOURCE_FILTERS = [
  { id: "all", label: "All sources" },
  { id: "stripe", label: "Stripe" },
  { id: "revenuecat", label: "RevenueCat" },
  { id: "manual", label: "Manual" },
];

function relativeTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
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

function daysUntil(iso) {
  if (!iso) return null;
  const diff = Date.parse(iso) - Date.now();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

function expirationTone(iso) {
  if (!iso) return "none"; // lifetime
  const days = daysUntil(iso);
  if (days === null) return "none";
  if (days < 0) return "expired";
  if (days <= 7) return "soon";
  return "ok";
}

function expirationLabel(iso) {
  if (!iso) return "Never expires";
  const days = daysUntil(iso);
  if (days === null) return "—";
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  if (days === 1) return "Renews tomorrow";
  if (days <= 7) return `Renews in ${days}d`;
  return `Renews ${new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function planTone(planKey) {
  if (planKey === "lifetime") return "gold";
  if (planKey === "yearly") return "teal";
  if (planKey === "monthly") return "default";
  return "default";
}

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmingRevoke, setConfirmingRevoke] = useState(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.premium || []);
      setStats(json.stats || null);
    } catch {
      setError("Could not load Premium.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const planCounts = useMemo(() => {
    const counts = { monthly: 0, yearly: 0, lifetime: 0, other: 0 };
    rows.forEach((r) => {
      const k = r.plan_key;
      if (k === "monthly" || k === "yearly" || k === "lifetime") {
        counts[k] += 1;
      } else {
        counts.other += 1;
      }
    });
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (planFilter !== "all") {
        const k = r.plan_key || "premium";
        if (planFilter === "premium") {
          if (k === "monthly" || k === "yearly" || k === "lifetime") return false;
        } else if (k !== planFilter) {
          return false;
        }
      }
      if (sourceFilter !== "all") {
        if ((r.source || "").toLowerCase() !== sourceFilter) return false;
      }
      if (needle) {
        const hay =
          (r.email || "").toLowerCase() +
          " " +
          (r.display_name || "").toLowerCase() +
          " " +
          (r.user_id || "").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, q, planFilter, sourceFilter]);

  async function revoke(userId) {
    setBusy(userId);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "revoke" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice("Premium revoked.");
      setConfirmingRevoke(null);
      await load();
    } catch {
      setError("Could not revoke Premium.");
      setConfirmingRevoke(null);
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminShell
      title="Premium"
      section="Revenue"
      subtitle="Every active entitlement unlocked in the app."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {/* ── Plan breakdown ──────────────────────────────────────── */}
      {stats ? (
        <div className="ta-sub-stats">
          <div className="ta-sub-stat">
            <span className="ta-sub-stat-label">Active</span>
            <span className="ta-sub-stat-value">
              {stats.premiumActive || 0}
            </span>
            <span className="ta-sub-stat-hint">
              of {stats.accounts || 0} accounts
            </span>
          </div>
          <div className="ta-sub-stat">
            <span className="ta-sub-stat-label">Monthly</span>
            <span className="ta-sub-stat-value">
              {planCounts.monthly}
            </span>
            <span className="ta-sub-stat-hint">£3.99 / mo</span>
          </div>
          <div className="ta-sub-stat">
            <span className="ta-sub-stat-label">Yearly</span>
            <span className="ta-sub-stat-value">
              {planCounts.yearly}
            </span>
            <span className="ta-sub-stat-hint">£24.99 / yr</span>
          </div>
          <div className="ta-sub-stat">
            <span className="ta-sub-stat-label">Lifetime</span>
            <span className="ta-sub-stat-value">
              {planCounts.lifetime}
            </span>
            <span className="ta-sub-stat-hint">one-time</span>
          </div>
        </div>
      ) : null}

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="ta-sub-toolbar">
        <input
          className="ta-input ta-input--search"
          type="search"
          placeholder="Search email, name, or id…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search Premium subscribers"
        />

        <select
          className="ta-select ta-sub-filter"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          aria-label="Filter by plan"
        >
          {PLAN_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          className="ta-select ta-sub-filter"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
        >
          {SOURCE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        <span className="ta-sub-count">
          <strong>{filtered.length}</strong>
          {q || planFilter !== "all" || sourceFilter !== "all"
            ? " matching"
            : " active"}
        </span>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="ta-card">
          <div className="ta-empty">
            {rows.length === 0
              ? "No active Premium subscribers."
              : "No subscribers match these filters."}
          </div>
        </div>
      ) : (
        <ul className="ta-sub-list">
          {filtered.map((row) => {
            const email = row.email || null;
            const name = row.display_name || null;
            const initial = (email || name || "?")[0].toUpperCase();
            const planKey = row.plan_key || "premium";
            const isRevoking = busy === row.user_id;
            const isConfirming = confirmingRevoke === row.user_id;
            const expTone = expirationTone(row.expires_at);

            return (
              <li key={row.user_id} className="ta-sub-item">
                <div className="ta-sub-item-main">
                  <span className="ta-sub-avatar" aria-hidden="true">
                    {initial}
                  </span>

                  <div className="ta-sub-copy">
                    <div className="ta-sub-title-row">
                      <Link
                        href={`/admin/users/${row.user_id}`}
                        className="ta-sub-email"
                      >
                        {email || shortId(row.user_id)}
                      </Link>
                      {!email ? (
                        <span className="ta-sub-warn">No email on record</span>
                      ) : null}
                    </div>
                    <div className="ta-sub-meta">
                      {name ? <span>{name}</span> : null}
                      {name ? <span className="ta-sub-sep">·</span> : null}
                      <span className="ta-sub-source">
                        {row.source || "unknown source"}
                        {row.environment ? ` · ${row.environment}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ta-sub-item-end">
                  <div className="ta-sub-plan">
                    <Badge tone={planTone(planKey)}>{planKey}</Badge>
                    <span className={`ta-sub-exp ta-sub-exp--${expTone}`}>
                      {expirationLabel(row.expires_at)}
                    </span>
                  </div>

                  <div className="ta-sub-actions">
                    <Link
                      className="ta-btn ta-btn-ghost ta-btn-row"
                      href={`/admin/users/${row.user_id}`}
                    >
                      Open
                    </Link>

                    {isConfirming ? (
                      <div className="ta-sub-confirm">
                        <span className="ta-sub-confirm-text">
                          Revoke Premium for this account? The app locks
                          immediately.
                        </span>
                        <div className="ta-sub-confirm-actions">
                          <button
                            type="button"
                            className="ta-btn ta-btn-ghost ta-btn-row"
                            onClick={() => setConfirmingRevoke(null)}
                            disabled={isRevoking}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="ta-btn ta-btn-danger ta-btn-row"
                            onClick={() => revoke(row.user_id)}
                            disabled={isRevoking}
                          >
                            {isRevoking ? "Revoking…" : "Yes, revoke"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ta-btn ta-btn-danger ta-btn-row"
                        disabled={isRevoking}
                        onClick={() => setConfirmingRevoke(row.user_id)}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}