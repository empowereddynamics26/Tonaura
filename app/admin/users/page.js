"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.users || []);
    } catch {
      setError("Could not load accounts.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (u) =>
        (u.email || "").toLowerCase().includes(needle) ||
        (u.display_name || "").toLowerCase().includes(needle) ||
        (u.id || "").toLowerCase().includes(needle)
    );
  }, [rows, q]);

  async function setPremium(userId, action, planKey = "monthly") {
    setBusy(userId + action);
    setNotice("");
    setError("");
    try {
      const res = await fetch("/api/admin/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action, plan_key: planKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice(action === "grant" ? "Premium granted." : "Premium revoked.");
      await load();
    } catch (e) {
      setError(e.message || "Could not update Premium.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminShell title="Accounts" subtitle="Signed-up profiles and Premium status.">
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}
      <div className="ta-toolbar">
        <input
          className="ta-input"
          placeholder="Search email, name, or id…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="ta-btn ta-btn-ghost ta-btn-sm" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="ta-card">
        {filtered.length === 0 ? (
          <div className="ta-empty">No accounts match.</div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Premium</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/admin/users/${u.id}`}>
                        <strong>{u.email || shortId(u.id)}</strong>
                      </Link>
                      <div className="ta-muted">{u.display_name || shortId(u.id)}</div>
                    </td>
                    <td>
                      <Badge tone={u.role === "user" ? "default" : "teal"}>{u.role || "user"}</Badge>
                    </td>
                    <td>
                      {u.premium_active ? (
                        <Badge tone="gold">{u.plan_key || "active"}</Badge>
                      ) : (
                        <Badge>free</Badge>
                      )}
                    </td>
                    <td>{formatWhen(u.created_at)}</td>
                    <td>
                      <div className="ta-row-actions">
                        <Link className="ta-btn ta-btn-ghost ta-btn-sm" href={`/admin/users/${u.id}`}>
                          Open
                        </Link>
                        {u.premium_active ? (
                          <button
                            type="button"
                            className="ta-btn ta-btn-danger ta-btn-sm"
                            disabled={!!busy}
                            onClick={() => setPremium(u.id, "revoke")}
                          >
                            {busy === u.id + "revoke" ? "…" : "Revoke"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ta-btn ta-btn-gold ta-btn-sm"
                            disabled={!!busy}
                            onClick={() => setPremium(u.id, "grant", "monthly")}
                          >
                            {busy === u.id + "grant" ? "…" : "Grant Premium"}
                          </button>
                        )}
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
