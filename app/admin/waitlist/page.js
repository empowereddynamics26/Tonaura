"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatWhen } from "@/components/admin/ui";

export default function AdminWaitlistPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setRows(json.waitlist || []);
      } catch {
        setError("Could not load waitlist.");
      }
    })();
  }, []);

  return (
    <AdminShell title="Waitlist" subtitle="Early-access emails from the website.">
      {error ? <div className="ta-error">{error}</div> : null}
      <div className="ta-card">
        {rows.length === 0 ? (
          <div className="ta-empty">Waitlist is empty.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.email}</strong>
                    </td>
                    <td>{row.source || "—"}</td>
                    <td>{formatWhen(row.created_at)}</td>
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
