"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen } from "@/components/admin/ui";

export default function AdminBroadcastsPage() {
  const [rows, setRows] = useState([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p>Hello from Tonaura.</p>");
  const [segment, setSegment] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/broadcasts");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.broadcasts || []);
    } catch {
      setError("Could not load broadcasts. Apply the admin_console_v2 migration if needed.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(send) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body_html: bodyHtml, segment, send }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice(
        send
          ? `Sent to ${json.recipient_count ?? 0} recipients.`
          : "Draft saved."
      );
      setSubject("");
      await load();
    } catch (e) {
      setError(e.message || "Could not save broadcast.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="Broadcasts" subtitle="Email segments: all, free, premium, or inactive.">
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      <div className="ta-card" style={{ marginBottom: 16 }}>
        <div className="ta-card-head">
          <h2>Compose</h2>
        </div>
        <label className="ta-muted">Subject</label>
        <input className="ta-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="ta-muted" style={{ display: "block", marginTop: 12 }}>
          Segment
        </label>
        <select className="ta-input" value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="all">All accounts</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="inactive">Inactive / free</option>
        </select>
        <label className="ta-muted" style={{ display: "block", marginTop: 12 }}>
          Body HTML
        </label>
        <textarea className="ta-input" rows={8} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
        <div className="ta-row-actions" style={{ marginTop: 12 }}>
          <button type="button" className="ta-btn ta-btn-ghost" disabled={busy} onClick={() => submit(false)}>
            Save draft
          </button>
          <button type="button" className="ta-btn ta-btn-primary" disabled={busy} onClick={() => submit(true)}>
            {busy ? "Working…" : "Send now"}
          </button>
        </div>
      </div>

      <div className="ta-card">
        <div className="ta-card-head">
          <h2>History</h2>
        </div>
        {rows.length === 0 ? (
          <div className="ta-empty">No broadcasts yet.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Segment</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.subject}</td>
                    <td>{b.segment}</td>
                    <td>
                      <Badge tone={b.status === "sent" ? "ok" : "default"}>{b.status}</Badge>
                    </td>
                    <td>{b.recipient_count}</td>
                    <td>{formatWhen(b.sent_at || b.created_at)}</td>
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
