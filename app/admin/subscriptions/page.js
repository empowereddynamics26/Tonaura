"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

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

  async function revoke(userId) {
    setBusy(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "revoke" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      await load();
    } catch {
      setError("Could not revoke Premium.");
    } finally {
      setBusy("");
    }
  }

  const plans = Object.entries(stats?.planBreakdown || {});

  return (
    <AdminShell title="Premium" subtitle="Active entitlements unlocked in the app.">
      {error ? <div className="ta-error">{error}</div> : null}
      {stats ? (
        <div className="ta-card" style={{ marginBottom: 12 }}>
          <div className="ta-card-head">
            <h2>Active plan mix</h2>
            <span>{stats.premiumActive} total active</span>
          </div>
          <div className="ta-plan-pills">
            {plans.length === 0 ? (
              <div className="ta-empty">No active plans.</div>
            ) : (
              plans.map(([key, count]) => (
                <div className="ta-plan-pill" key={key}>
                  <b>{count}</b>
                  <span>{key}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
      <div className="ta-card">
        {rows.length === 0 ? (
          <div className="ta-empty">No active Premium rows.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Source</th>
                  <th>Env</th>
                  <th>Expires</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.user_id}>
                    <td>{shortId(row.user_id)}</td>
                    <td>
                      <Badge tone="gold">{row.plan_key || "premium"}</Badge>
                    </td>
                    <td>{row.source || "—"}</td>
                    <td>{row.environment || "—"}</td>
                    <td>{row.expires_at ? formatWhen(row.expires_at) : "—"}</td>
                    <td>{formatWhen(row.updated_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="ta-btn ta-btn-danger ta-btn-sm"
                        disabled={busy === row.user_id}
                        onClick={() => revoke(row.user_id)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
