"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { shortId } from "@/components/admin/ui";
import "./audit.css";

/* ==========================================================================
   Action registry
   Every action the codebase emits should have an entry here. If a key
   isn't listed, the raw key is shown and the category defaults to
   "system" — so the page never breaks when new actions are added.
   ========================================================================== */

const ACTION_META = {
  // Broadcasts
  "broadcast.send": { label: "Broadcast sent", category: "write" },
  "broadcast.draft": { label: "Broadcast drafted", category: "write" },

  // Premium / entitlement
  "entitlement.grant": { label: "Premium granted", category: "write" },
  "entitlement.revoke": { label: "Premium revoked", category: "destructive" },
  "premium.grant": { label: "Premium granted", category: "write" },
  "premium.revoke": { label: "Premium revoked", category: "destructive" },

  // Flags
  "flag.update": { label: "Flag updated", category: "write" },
  "flag.enable": { label: "Flag enabled", category: "write" },
  "flag.disable": { label: "Flag disabled", category: "write" },

  // Users / roles
  "user.role_change": { label: "Role changed", category: "write" },
  "user.update": { label: "User updated", category: "write" },
  "user.delete": { label: "User deleted", category: "destructive" },
  "user.invite": { label: "Admin invited", category: "write" },

  // Templates
  "template.update": { label: "Template updated", category: "write" },

  // Contact
  "contact.reply": { label: "Contact reply sent", category: "write" },
  "contact.status": { label: "Contact status changed", category: "write" },

  // Settings
  "settings.update": { label: "Platform settings updated", category: "write" },
};

const CATEGORY_META = {
  write: { label: "Write", tone: "gold" },
  destructive: { label: "Destructive", tone: "danger" },
  read: { label: "Read", tone: "teal" },
  system: { label: "System", tone: "default" },
};

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "write", label: "Writes" },
  { id: "destructive", label: "Destructive" },
  { id: "system", label: "System" },
];

const TIME_FILTERS = [
  { id: "all", label: "All time" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

function actionMeta(action) {
  return (
    ACTION_META[action] || {
      label: action || "Unknown action",
      category: "system",
    }
  );
}

function categoryIcon(category) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (category === "destructive") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    );
  }
  if (category === "write") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }
  if (category === "read") {
    return (
      <svg {...common}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

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
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function dayLabel(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Earlier";
  }
}

/* Turn a meta object into a small list of readable key/value pairs. */
function metaEntries(meta) {
  if (!meta || typeof meta !== "object") return [];
  return Object.entries(meta).map(([key, value]) => ({
    key,
    label: key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    value:
      typeof value === "boolean"
        ? value
          ? "On"
          : "Off"
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value),
  }));
}

export default function AdminAuditPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/audit?limit=200");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setEvents(json.events || []);
      } catch {
        setError("Could not load audit log.");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const now = Date.now();
    const windows = {
      "24h": now - 24 * 60 * 60 * 1000,
      "7d": now - 7 * 24 * 60 * 60 * 1000,
      "30d": now - 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = windows[timeFilter];

    return events.filter((e) => {
      if (categoryFilter !== "all") {
        if (actionMeta(e.action).category !== categoryFilter) return false;
      }
      if (cutoff) {
        const t = e.created_at ? new Date(e.created_at).getTime() : 0;
        if (t < cutoff) return false;
      }
      if (needle) {
        const hay =
          (e.actor_email || "").toLowerCase() +
          " " +
          (e.action || "").toLowerCase() +
          " " +
          (e.target_type || "").toLowerCase() +
          " " +
          (e.target_id || "").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [events, q, categoryFilter, timeFilter]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const row of filtered) {
      const key = dayLabel(row.created_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  /* Summary counts */
  const summary = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let today = 0;
    let destructive = 0;
    for (const e of events) {
      const t = e.created_at ? new Date(e.created_at).getTime() : 0;
      if (t >= oneDayAgo) today += 1;
      if (actionMeta(e.action).category === "destructive") destructive += 1;
    }
    return { total: events.length, today, destructive };
  }, [events]);

  return (
    <AdminShell
      title="Audit log"
      section="Administration"
      subtitle="Every admin action, across website and app."
    >
      {error ? <div className="ta-error">{error}</div> : null}

      {/* ── Summary ──────────────────────────────────────────── */}
      <div className="ta-audit-summary">
        <div className="ta-audit-summary-item">
          <span className="ta-audit-summary-label">Total</span>
          <span className="ta-audit-summary-value">{summary.total}</span>
          <span className="ta-audit-summary-hint">
            most recent {summary.total === 200 ? "200 events" : "events"}
          </span>
        </div>
        <div className="ta-audit-summary-item">
          <span className="ta-audit-summary-label">Last 24h</span>
          <span className="ta-audit-summary-value">{summary.today}</span>
          <span className="ta-audit-summary-hint">
            actions taken in the last day
          </span>
        </div>
        <div className="ta-audit-summary-item">
          <span className="ta-audit-summary-label">Destructive</span>
          <span
            className={`ta-audit-summary-value${
              summary.destructive > 0 ? " is-danger" : ""
            }`}
          >
            {summary.destructive}
          </span>
          <span className="ta-audit-summary-hint">
            revokes and deletions on record
          </span>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="ta-audit-toolbar">
        <input
          className="ta-input ta-input--search"
          type="search"
          placeholder="Search actor, action, or target…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search audit log"
        />

        <div className="ta-filters ta-audit-filters">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ta-chip${categoryFilter === f.id ? " is-active" : ""}`}
              onClick={() => setCategoryFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="ta-select ta-audit-time"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          aria-label="Filter by time"
        >
          {TIME_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        <span className="ta-audit-count">
          <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="ta-card">
          <div className="ta-empty">
            {events.length === 0
              ? "No audit events yet. Actions from the admin console will appear here."
              : "No events match these filters."}
          </div>
        </div>
      ) : (
        <div className="ta-audit-groups">
          {grouped.map(([day, items]) => (
            <section key={day} className="ta-audit-group">
              <header className="ta-audit-group-head">
                <span className="ta-audit-group-label">{day}</span>
                <span className="ta-audit-group-count">
                  {items.length} {items.length === 1 ? "event" : "events"}
                </span>
              </header>

              <ul className="ta-audit-list">
                {items.map((e) => {
                  const meta = actionMeta(e.action);
                  const isOpen = expanded === e.id;
                  const pairs = metaEntries(e.meta);
                  return (
                    <li
                      key={e.id}
                      className={`ta-audit-item is-${meta.category}${
                        isOpen ? " is-open" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="ta-audit-item-head"
                        onClick={() => setExpanded(isOpen ? null : e.id)}
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`ta-audit-icon is-${meta.category}`}
                          aria-hidden="true"
                        >
                          {categoryIcon(meta.category)}
                        </span>

                        <span className="ta-audit-main">
                          <span className="ta-audit-action">
                            {meta.label}
                          </span>
                          <span className="ta-audit-sub">
                            {e.actor_email ? (
                              <span className="ta-audit-actor">
                                {e.actor_email}
                              </span>
                            ) : e.actor_id ? (
                              <span className="ta-audit-actor ta-audit-actor--muted">
                                {shortId(e.actor_id)}
                              </span>
                            ) : (
                              <span className="ta-audit-actor ta-audit-actor--muted">
                                System
                              </span>
                            )}
                            {e.target_type ? (
                              <>
                                <span className="ta-audit-dot">·</span>
                                <span className="ta-audit-target">
                                  {e.target_type}
                                  {e.target_id
                                    ? ` ${shortId(e.target_id)}`
                                    : ""}
                                </span>
                              </>
                            ) : null}
                          </span>
                        </span>

                        <span className="ta-audit-end">
                          <span className="ta-audit-when">
                            {relativeTime(e.created_at)}
                          </span>
                          <span
                            className="ta-audit-chev"
                            aria-hidden="true"
                          >
                            {isOpen ? "▴" : "▾"}
                          </span>
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="ta-audit-detail">
                          <div className="ta-audit-detail-grid">
                            <div className="ta-audit-detail-cell">
                              <span className="ta-audit-detail-label">
                                Action key
                              </span>
                              <code className="ta-audit-detail-code">
                                {e.action}
                              </code>
                            </div>
                            <div className="ta-audit-detail-cell">
                              <span className="ta-audit-detail-label">
                                Occurred
                              </span>
                              <span className="ta-audit-detail-value">
                                {e.created_at
                                  ? new Date(e.created_at).toLocaleString(
                                      "en-GB"
                                    )
                                  : "—"}
                              </span>
                            </div>
                            {e.target_type ? (
                              <div className="ta-audit-detail-cell">
                                <span className="ta-audit-detail-label">
                                  Target
                                </span>
                                <span className="ta-audit-detail-value">
                                  {e.target_type}
                                  {e.target_id
                                    ? ` · ${e.target_id}`
                                    : ""}
                                </span>
                              </div>
                            ) : null}
                            {e.actor_id ? (
                              <div className="ta-audit-detail-cell">
                                <span className="ta-audit-detail-label">
                                  Actor ID
                                </span>
                                <code className="ta-audit-detail-code">
                                  {e.actor_id}
                                </code>
                              </div>
                            ) : null}
                          </div>

                          {pairs.length > 0 ? (
                            <div className="ta-audit-meta">
                              <span className="ta-audit-detail-label">
                                Metadata
                              </span>
                              <ul className="ta-audit-meta-list">
                                {pairs.map((p) => (
                                  <li key={p.key} className="ta-audit-meta-item">
                                    <span className="ta-audit-meta-key">
                                      {p.label}
                                    </span>
                                    <span className="ta-audit-meta-value">
                                      {p.value}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {e.target_type === "broadcast" ||
                          e.target_type === "user" ? (
                            <div className="ta-audit-links">
                              {e.target_type === "broadcast" ? (
                                <Link
                                  className="ta-audit-link"
                                  href="/admin/broadcasts"
                                >
                                  View broadcasts →
                                </Link>
                              ) : null}
                              {e.target_type === "user" ? (
                                <Link
                                  className="ta-audit-link"
                                  href={`/admin/users/${e.target_id}`}
                                >
                                  View account →
                                </Link>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  );
}