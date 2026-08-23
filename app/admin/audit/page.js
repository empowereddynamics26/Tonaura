"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";

export default function AdminAuditPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/audit");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setEvents(json.events || []);
      } catch {
        setError("Could not load audit log. Apply the admin_console_v2 migration if needed.");
      }
    })();
  }, []);

  return (
    <AdminShell title="Audit log" subtitle="Admin actions across website and app (shared APIs).">
      {error ? <div className="ta-error">{error}</div> : null}
      <div className="ta-card">
        {events.length === 0 && !error ? (
          <div className="ta-empty">No audit events yet.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{formatWhen(e.created_at)}</td>
                    <td>{e.actor_email || shortId(e.actor_id) || "—"}</td>
                    <td>
                      <Badge tone="teal">{e.action}</Badge>
                    </td>
                    <td className="ta-muted">
                      {e.target_type || "—"} {e.target_id ? `· ${shortId(e.target_id)}` : ""}
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
