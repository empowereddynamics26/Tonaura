"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardSkeleton } from "@/components/admin/DashboardSkeleton";
import { Badge, StatTile, formatWhen, shortId, gbp } from "@/components/admin/ui";
import "./dashboard.css";

export default function AdminDashboardPage() {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        if (alive) setData(json);
      } catch {
        if (alive) setError("Could not load dashboard.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────
  if (data === undefined && !error) {
    return (
      <AdminShell
        title="Dashboard"
        subtitle="Revenue, accounts, Premium, and contact at a glance."
      >
        <DashboardSkeleton />
      </AdminShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AdminShell
        title="Dashboard"
        subtitle="Revenue, accounts, Premium, and contact at a glance."
      >
        <div className="ta-error">{error}</div>
      </AdminShell>
    );
  }

  // ── Loaded ─────────────────────────────────────────────────────────────
  const stats = data.stats;
  const plans = Object.entries(stats?.planBreakdown || {});
  const flags = data.flags || {};
  const newMessages = (data.messages || []).filter((m) => m.status === "new");
  const recentBilling = (data.recentBilling || []).slice(0, 8);

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Revenue, accounts, Premium, and contact at a glance."
    >
      <div className="ta-dashboard">
        {flags.maintenance_mode ? (
          <div className="ta-banner ta-banner--warn">
            <span>Maintenance mode is on.</span>
            <Link href="/admin/flags" className="ta-banner-link">
              Manage flags
            </Link>
          </div>
        ) : null}

        {/* Primary stat — MRR as the hero */}
        <StatTile
          variant="hero"
          label="Estimated MRR"
          value={gbp(stats.mrr)}
          hint={`ARR ${gbp(stats.arr)} · ${stats.lifetimeCount || 0} lifetime purchases`}
          tone="gold"
          href="/admin/subscriptions"
          icon="pound"
        />

        {/* Secondary stats — three across */}
        <div className="ta-stats">
          <StatTile
            label="Accounts"
            value={String(stats.accounts)}
            hint={`+${stats.accountsWeek} in the last 7 days`}
            tone="slate"
            href="/admin/users"
            icon="users"
          />
          <StatTile
            label="Premium active"
            value={String(stats.premiumActive)}
            hint={`${stats.accountsMonth} signups / 30 days`}
            tone="gold"
            href="/admin/subscriptions"
            icon="sparkle"
          />
          <StatTile
            label="Contact"
            value={String(stats.contact)}
            hint={`${stats.contactNew} new`}
            tone="ok"
            href="/admin/contact"
            icon="mail"
          />
        </div>

        {/* Two-column middle */}
        <div className="ta-grid-2">
          <div className="ta-card">
            <div className="ta-card-head">
              <div>
                <h2>Plan mix</h2>
                <p className="ta-card-sub">Active Premium by plan</p>
              </div>
            </div>

            {plans.length === 0 ? (
              <div className="ta-empty">No active Premium plans.</div>
            ) : (
              <ul className="ta-plan-list">
                {plans.map(([key, count]) => (
                  <li className="ta-plan-list-item" key={key}>
                    <span className="ta-plan-list-count">{count}</span>
                    <span className="ta-plan-list-name">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="ta-plan-list-bar" aria-hidden="true">
                      <span
                        className="ta-plan-list-bar-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (Number(count) /
                              Math.max(
                                1,
                                plans.reduce((a, [, c]) => a + Number(c), 0)
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ta-card">
            <div className="ta-card-head">
              <div>
                <h2>New contact</h2>
                <p className="ta-card-sub">
                  {newMessages.length === 0
                    ? "Nothing waiting"
                    : `${newMessages.length} ${
                        newMessages.length === 1 ? "message" : "messages"
                      } waiting`}
                </p>
              </div>
              <Link href="/admin/contact" className="ta-card-link">
                Inbox
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {newMessages.length === 0 ? (
              <div className="ta-empty">No new messages.</div>
            ) : (
              <ul className="ta-msg-list">
                {newMessages.slice(0, 6).map((m) => (
                  <li key={m.id} className="ta-msg-item">
                    <div className="ta-msg-head">
                      <strong>{m.name || m.email}</strong>
                      <span className="ta-msg-when">
                        {formatWhen(m.created_at)}
                      </span>
                    </div>
                    <p className="ta-msg-body">
                      {(m.message || "").slice(0, 100)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent billing */}
        <div className="ta-card ta-card--feature">
          <div className="ta-card-head">
            <div>
              <h2>Recent billing</h2>
              <p className="ta-card-sub">Latest Stripe events</p>
            </div>
            <Link href="/admin/billing" className="ta-card-link">
              All events
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {recentBilling.length === 0 ? (
            <div className="ta-empty">No billing events yet.</div>
          ) : (
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>User</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBilling.map((e) => (
                    <tr key={e.event_id}>
                      <td>
                        <Badge tone="teal">{e.event_type}</Badge>
                      </td>
                      <td>
                        <Link href={`/admin/users/${e.user_id}`}>
                          {shortId(e.user_id)}
                        </Link>
                      </td>
                      <td className="ta-table-when">
                        {formatWhen(e.processed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}