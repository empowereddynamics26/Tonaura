"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AccountsSkeleton } from "@/components/admin/AccountsSkeleton";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";
import "./users.css";

export default function AdminUsersPage() {
  const [rows, setRows] = useState(undefined);
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
      setRows([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (u) =>
        (u.email || "").toLowerCase().includes(needle) ||
        (u.display_name || "").toLowerCase().includes(needle) ||
        (u.id || "").toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const premiumCount = useMemo(
    () => (rows || []).filter((u) => u.premium_active).length,
    [rows]
  );

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

  // ── Loading ────────────────────────────────────────────────────────────
  if (rows === undefined && !error) {
    return (
      <AdminShell
        title="Accounts"
        section="Users & growth"
        subtitle="Every signed-up profile, with Premium status and role."
      >
        <AccountsSkeleton />
      </AdminShell>
    );
  }

  // ── Loaded ─────────────────────────────────────────────────────────────
  return (
    <AdminShell
      title="Accounts"
      section="Users & growth"
      subtitle="Every signed-up profile, with Premium status and role."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="ta-list-toolbar">
        <div className="ta-list-toolbar-left">
          <input
            className="ta-input ta-input--search"
            type="search"
            placeholder="Search email, name, or id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search accounts"
          />
        </div>

        <div className="ta-list-toolbar-right">
          <span className="ta-list-count">
            <strong>{filtered.length}</strong>
            {q ? " matching" : " accounts"}
            {premiumCount > 0 ? (
              <span className="ta-list-count-sub">
                · {premiumCount} Premium
              </span>
            ) : null}
          </span>
          <button
            type="button"
            className="ta-btn ta-btn-ghost ta-btn-sm"
            onClick={load}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="ta-card ta-card--table">
        {filtered.length === 0 ? (
          <div className="ta-empty">
            {q ? "No accounts match your search." : "No accounts yet."}
          </div>
        ) : (
          <div className="ta-table-wrap">
            <table className="ta-table ta-table--users">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Premium</th>
                  <th>Joined</th>
                  <th className="ta-table-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const initial = (u.email || "?")[0].toUpperCase();
                  return (
                    <tr key={u.id}>
                      <td>
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="ta-user-cell"
                        >
                          <span
                            className="ta-user-cell-avatar"
                            aria-hidden="true"
                          >
                            {initial}
                          </span>
                          <span className="ta-user-cell-copy">
                            <span className="ta-user-cell-email">
                              {u.email || shortId(u.id)}
                            </span>
                            <span className="ta-user-cell-name">
                              {u.display_name || "No display name"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <Badge
                          tone={u.role === "user" ? "default" : "teal"}
                        >
                          {u.role || "user"}
                        </Badge>
                      </td>
                      <td>
                        {u.premium_active ? (
                          <Badge tone="gold">
                            {u.plan_key || "active"}
                          </Badge>
                        ) : (
                          <Badge>free</Badge>
                        )}
                      </td>
                      <td className="ta-table-when">
                        {formatWhen(u.created_at)}
                      </td>
                      <td className="ta-table-td-actions">
                        <div className="ta-row-actions">
                          <Link
                            className="ta-btn ta-btn-ghost ta-btn-row"
                            href={`/admin/users/${u.id}`}
                          >
                            Open
                          </Link>
                          {u.premium_active ? (
                            <button
                              type="button"
                              className="ta-btn ta-btn-danger ta-btn-row"
                              disabled={!!busy}
                              onClick={() => setPremium(u.id, "revoke")}
                            >
                              {busy === u.id + "revoke" ? "…" : "Revoke"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ta-btn ta-btn-gold ta-btn-row"
                              disabled={!!busy}
                              onClick={() =>
                                setPremium(u.id, "grant", "monthly")
                              }
                            >
                              {busy === u.id + "grant" ? "…" : "Grant"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}