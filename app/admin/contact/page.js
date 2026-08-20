"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen } from "@/components/admin/ui";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "replied", label: "Replied" },
  { id: "archived", label: "Archived" },
];

function toneFor(status) {
  if (status === "new") return "warn";
  if (status === "replied") return "ok";
  if (status === "archived") return "default";
  return "teal";
}

export default function AdminContactPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.messages || []);
    } catch {
      setError("Could not load inbox.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  async function setStatus(id, status) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      await load();
    } catch {
      setError("Could not update status.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminShell title="Contact inbox" subtitle="Website contact form messages.">
      {error ? <div className="ta-error">{error}</div> : null}
      <div className="ta-toolbar">
        <div className="ta-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ta-chip ${filter === f.id ? "is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ta-card">
        {visible.length === 0 ? (
          <div className="ta-empty">No messages in this view.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>When</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.name || "—"}</strong>
                      <div className="ta-muted">{m.email}</div>
                      <div className="ta-muted">{m.topic || "General"}</div>
                    </td>
                    <td>
                      <div className="ta-message">{m.message}</div>
                    </td>
                    <td>
                      <Badge tone={toneFor(m.status)}>{m.status}</Badge>
                    </td>
                    <td>{formatWhen(m.created_at)}</td>
                    <td>
                      <div className="ta-row-actions">
                        {["read", "replied", "archived"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="ta-btn ta-btn-ghost ta-btn-sm"
                            disabled={busy === m.id || m.status === s}
                            onClick={() => setStatus(m.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
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
