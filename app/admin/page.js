"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, StatTile, formatWhen, shortId } from "@/components/admin/ui";

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

  return (
    <AdminShell title="Dashboard" subtitle="Accounts, Premium, and contact at a glance.">
      {error ? <div className="ta-error">{error}</div> : null}
      {!data && !error ? <div className="ta-muted">Loading overview…</div> : null}

      {stats ? (
        <>
          <div className="ta-stats">
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
            <StatTile
              label="Billing events"
              value={String((data.recentBilling || []).length)}
              hint="Recent log"
              tint="slate"
              href="/admin/billing"
              icon="◫"
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
                <div className="ta-table-wrap">
                  <table className="ta-table">
                    <tbody>
                      {(data.messages || [])
                        .filter((m) => m.status === "new")
                        .slice(0, 6)
                        .map((m) => (
                          <tr key={m.id}>
                            <td>
                              <strong>{m.name || m.email}</strong>
                              <div className="ta-muted">{m.topic || "General"}</div>
                            </td>
                            <td>
                              <Badge tone="warn">new</Badge>
                            </td>
                            <td>{formatWhen(m.created_at)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="ta-card" style={{ marginTop: 12 }}>
            <div className="ta-card-head">
              <h2>Recent Premium</h2>
              <Link href="/admin/subscriptions">Manage</Link>
            </div>
            {(data.premium || []).length === 0 ? (
              <div className="ta-empty">No active entitlements in the latest window.</div>
            ) : (
              <div className="ta-table-wrap">
                <table className="ta-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Source</th>
                      <th>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.premium || []).slice(0, 8).map((row) => (
                      <tr key={row.user_id}>
                        <td>{shortId(row.user_id)}</td>
                        <td>
                          <Badge tone="gold">{row.plan_key || "premium"}</Badge>
                        </td>
                        <td>{row.source || "—"}</td>
                        <td>{row.expires_at ? formatWhen(row.expires_at) : "—"}</td>
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
