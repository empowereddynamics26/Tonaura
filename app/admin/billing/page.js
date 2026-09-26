"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { shortId } from "@/components/admin/ui";
import "./billing.css";

/* Map Stripe event types to human labels + a category for coloring. */
const EVENT_META = {
  "checkout.session.completed": {
    label: "Checkout completed",
    category: "money-in",
  },
  "customer.subscription.created": {
    label: "Subscription created",
    category: "money-in",
  },
  "customer.subscription.updated": {
    label: "Subscription updated",
    category: "neutral",
  },
  "customer.subscription.deleted": {
    label: "Subscription cancelled",
    category: "money-out",
  },
  "invoice.paid": {
    label: "Invoice paid",
    category: "money-in",
  },
  "invoice.payment_failed": {
    label: "Payment failed",
    category: "failure",
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "money-in", label: "Money in" },
  { id: "money-out", label: "Cancellations" },
  { id: "failure", label: "Failed" },
];

function eventMeta(type) {
  return (
    EVENT_META[type] || {
      label: type || "Unknown event",
      category: "neutral",
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
  if (category === "money-in") {
    return (
      <svg {...common}>
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    );
  }
  if (category === "money-out") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M19 12l-7 7-7-7" />
      </svg>
    );
  }
  if (category === "failure") {
    return (
      <svg {...common}>
        <path d="M12 8v5" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="9" opacity="0.5" />
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

export default function AdminBillingPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setRows(json.recentBilling || []);
      } catch {
        setError("Could not load billing events.");
      }
    })();
  }, []);

  /* Summary counts */
  const summary = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    let today = 0;
    let week = 0;
    let failed = 0;
    for (const r of rows) {
      const t = r.processed_at ? new Date(r.processed_at).getTime() : 0;
      if (t >= oneDayAgo) today += 1;
      if (t >= oneWeekAgo) week += 1;
      if (r.event_type === "invoice.payment_failed") failed += 1;
    }
    return {
      total: rows.length,
      today,
      week,
      failed,
      lastAt: rows[0]?.processed_at || null,
    };
  }, [rows]);

  /* Filtered list */
  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => eventMeta(r.event_type).category === filter);
  }, [rows, filter]);

  /* Group by day */
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const row of filtered) {
      const key = dayLabel(row.processed_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <AdminShell
      title="Billing events"
      section="Revenue"
      subtitle="Stripe webhook processing log."
    >
      {error ? <div className="ta-error">{error}</div> : null}

      {/* ── Summary strip ─────────────────────────────────────── */}
      <div className="ta-bill-summary">
        <div className="ta-bill-summary-item">
          <span className="ta-bill-summary-label">Total</span>
          <span className="ta-bill-summary-value">{summary.total}</span>
          <span className="ta-bill-summary-hint">
            {summary.lastAt
              ? `last ${relativeTime(summary.lastAt)}`
              : "no events yet"}
          </span>
        </div>
        <div className="ta-bill-summary-item">
          <span className="ta-bill-summary-label">Last 24h</span>
          <span className="ta-bill-summary-value">{summary.today}</span>
          <span className="ta-bill-summary-hint">
            {summary.week} in the last week
          </span>
        </div>
        <div className="ta-bill-summary-item">
          <span className="ta-bill-summary-label">Failed</span>
          <span
            className={`ta-bill-summary-value${
              summary.failed > 0 ? " is-danger" : ""
            }`}
          >
            {summary.failed}
          </span>
          <span className="ta-bill-summary-hint">
            {summary.failed > 0
              ? "needs attention"
              : "all processed cleanly"}
          </span>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="ta-filters ta-bill-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ta-chip${filter === f.id ? " is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Event list ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="ta-card">
          <div className="ta-empty">
            {rows.length === 0
              ? "No billing events yet. Stripe webhooks will appear here once checkout is used."
              : "No events match this filter."}
          </div>
        </div>
      ) : (
        <div className="ta-bill-groups">
          {grouped.map(([day, items]) => (
            <section key={day} className="ta-bill-group">
              <header className="ta-bill-group-head">
                <span className="ta-bill-group-label">{day}</span>
                <span className="ta-bill-group-count">
                  {items.length} {items.length === 1 ? "event" : "events"}
                </span>
              </header>

              <ul className="ta-bill-list">
                {items.map((row) => {
                  const meta = eventMeta(row.event_type);
                  const isOpen = expanded === row.event_id;
                  const email = row.email || null;
                  return (
                    <li
                      key={row.event_id}
                      className={`ta-bill-item is-${meta.category}${
                        isOpen ? " is-open" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="ta-bill-item-head"
                        onClick={() =>
                          setExpanded(isOpen ? null : row.event_id)
                        }
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`ta-bill-icon is-${meta.category}`}
                          aria-hidden="true"
                        >
                          {categoryIcon(meta.category)}
                        </span>

                        <span className="ta-bill-main">
                          <span className="ta-bill-label">{meta.label}</span>
                          <span className="ta-bill-sub">
                            {email ? (
                              <Link
                                href={`/admin/users/${row.user_id}`}
                                className="ta-bill-email"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {email}
                              </Link>
                            ) : row.user_id ? (
                              <span className="ta-bill-email ta-bill-email--muted">
                                {shortId(row.user_id)}
                              </span>
                            ) : (
                              <span className="ta-bill-email ta-bill-email--muted">
                                No user linked
                              </span>
                            )}
                            <span className="ta-bill-dot">·</span>
                            <span className="ta-bill-code">
                              {row.event_type}
                            </span>
                          </span>
                        </span>

                        <span className="ta-bill-end">
                          <span className="ta-bill-when">
                            {relativeTime(row.processed_at)}
                          </span>
                          <span
                            className="ta-bill-chev"
                            aria-hidden="true"
                          >
                            {isOpen ? "▴" : "▾"}
                          </span>
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="ta-bill-payload">
                          <div className="ta-bill-payload-head">
                            <span className="ta-bill-payload-label">
                              Event ID
                            </span>
                            <code className="ta-bill-payload-code">
                              {row.event_id}
                            </code>
                          </div>
                          <div className="ta-bill-payload-head">
                            <span className="ta-bill-payload-label">
                              Processed
                            </span>
                            <span className="ta-bill-payload-value">
                              {row.processed_at
                                ? new Date(row.processed_at).toLocaleString(
                                    "en-GB"
                                  )
                                : "—"}
                            </span>
                          </div>
                          {row.payload ? (
                            <div className="ta-bill-payload-body">
                              <span className="ta-bill-payload-label">
                                Raw payload
                              </span>
                              <pre className="ta-bill-payload-pre">
                                {JSON.stringify(row.payload, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="ta-bill-payload-empty">
                              No payload stored for this event.
                            </p>
                          )}
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