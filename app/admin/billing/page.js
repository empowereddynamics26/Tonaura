"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";

export default function AdminBillingPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <AdminShell title="Billing events" subtitle="Stripe webhook processing log.">
      {error ? <div className="ta-error">{error}</div> : null}
      <div className="ta-card">
        {rows.length === 0 ? (
          <div className="ta-empty">No billing events yet.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Processed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.event_id}>
                    <td>
                      <strong>{shortId(row.event_id)}</strong>
                    </td>
                    <td>
                      <Badge tone="teal">{row.event_type}</Badge>
                    </td>
                    <td>{shortId(row.user_id)}</td>
                    <td>{formatWhen(row.processed_at)}</td>
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
