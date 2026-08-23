"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, StatTile, formatWhen, shortId } from "@/components/admin/ui";

function gbp(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
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

  const stats = data?.stats;
  const plans = Object.entries(stats?.planBreakdown || {});
  const flags = data?.flags || {};

  return (
    <AdminShell title="Dashboard" subtitle="Revenue, accounts, Premium, and contact at a glance.">
      {error ? <div className="ta-error">{error}</div> : null}
      {!data && !error ? <div className="ta-muted">Loading overview…</div> : null}

      {stats ? (
        <>
          {flags.maintenance_mode ? (
            <div className="ta-error" style={{ marginBottom: 16 }}>
              Maintenance mode is on.{" "}
              <Link href="/admin/flags">Manage flags</Link>
            </div>
          ) : null}

          <div className="ta-stats">
            <StatTile
              label="Est. MRR"
              value={gbp(stats.mrr)}
              hint={`ARR ${gbp(stats.arr)} · ${stats.lifetimeCount || 0} lifetime`}
              tint="gold"
              href="/admin/subscriptions"
              icon="£"
            />
            <StatTile
              label="Accounts"
              value={String(stats.accounts)}
              hint={`+${stats.accountsWeek} this week`}
              tint="slate"
              href="/admin/users"
              icon="👥"
            />
            <StatTile
              label="Premium active"
              value={String(stats.premiumActive)}
              hint={`${stats.accountsMonth} signups / 30d`}
              tint="gold"
              href="/admin/subscriptions"
              icon="✦"
            />
            <StatTile
              label="Contact"
              value={String(stats.contact)}
              hint={`${stats.contactNew} new`}
              tint="ok"
              href="/admin/contact"
              icon="✉"
            />
          </div>

          <div className="ta-grid-2">
            <div className="ta-card">
              <div className="ta-card-head">
                <h2>Plan mix</h2>
                <span>Active Premium</span>
              </div>
              {plans.length === 0 ? (
                <div className="ta-empty">No active Premium plans.</div>
              ) : (
                <div className="ta-plan-pills">
                  {plans.map(([key, count]) => (
                    <div className="ta-plan-pill" key={key}>
                      <b>{count}</b>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ta-card">
              <div className="ta-card-head">
                <h2>New contact</h2>
                <Link href="/admin/contact">Inbox</Link>
              </div>
              {(data.messages || []).filter((m) => m.status === "new").slice(0, 6).length === 0 ? (
                <div className="ta-empty">No new messages.</div>
              ) : (
                <ul className="ta-list">
                  {(data.messages || [])
                    .filter((m) => m.status === "new")
                    .slice(0, 6)
                    .map((m) => (
                      <li key={m.id}>
                        <strong>{m.name || m.email}</strong>
                        <span className="ta-muted"> · {formatWhen(m.created_at)}</span>
                        <div className="ta-muted">{(m.message || "").slice(0, 80)}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="ta-card" style={{ marginTop: 16 }}>
            <div className="ta-card-head">
              <h2>Recent billing</h2>
              <Link href="/admin/billing">All events</Link>
            </div>
            {(data.recentBilling || []).slice(0, 8).length === 0 ? (
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
                    {(data.recentBilling || []).slice(0, 8).map((e) => (
                      <tr key={e.event_id}>
                        <td>
                          <Badge tone="teal">{e.event_type}</Badge>
                        </td>
                        <td>
                          <Link href={`/admin/users/${e.user_id}`}>{shortId(e.user_id)}</Link>
                        </td>
                        <td>{formatWhen(e.processed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
