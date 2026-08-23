"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen } from "@/components/admin/ui";

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/flags");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setFlags(json.flags || []);
    } catch {
      setError("Could not load flags. Apply the admin_console_v2 migration if needed.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(key, enabled) {
    setBusy(key);
    setError("");
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      await load();
    } catch (e) {
      setError(e.message || "Could not update flag.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminShell
      title="Feature flags"
      subtitle="Maintenance, block signups, pause checkouts, and other kill switches."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      <div className="ta-card">
        {flags.length === 0 ? (
          <div className="ta-empty">No flags yet.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f) => (
                  <tr key={f.key}>
                    <td>
                      <strong>{f.label || f.key}</strong>
                      <div className="ta-muted">{f.description}</div>
                      <div className="ta-muted">{f.key}</div>
                    </td>
                    <td>
                      <Badge tone={f.enabled ? "warn" : "ok"}>{f.enabled ? "on" : "off"}</Badge>
                    </td>
                    <td>{formatWhen(f.updated_at)}</td>
                    <td>
                      <button
                        type="button"
                        className={`ta-btn ta-btn-sm ${f.enabled ? "ta-btn-danger" : "ta-btn-gold"}`}
                        disabled={busy === f.key}
                        onClick={() => toggle(f.key, !f.enabled)}
                      >
                        {busy === f.key ? "…" : f.enabled ? "Turn off" : "Turn on"}
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
