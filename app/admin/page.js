"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";

function Stat({ label, value, hint }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
      {hint ? <span className="admin-stat-hint">{hint}</span> : null}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setError("");
    const res = await fetch("/api/admin/overview");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Forbidden");
      setData(null);
      return;
    }
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const planChips = useMemo(() => {
    if (!data?.stats?.planBreakdown) return [];
    return Object.entries(data.stats.planBreakdown);
  }, [data]);

  return (
    <div className="admin-scene">
      <div className="shell admin-shell">
        <SiteNav extra={<a href="/account">Account</a>} />
        <p className="kicker">Internal</p>
        <div className="admin-header">
          <h1>Admin</h1>
          <button type="button" className="secondary admin-refresh" onClick={load}>
            Refresh
          </button>
        </div>
        <p className="admin-sub">
          Waitlist, contact, accounts, and Premium. Only admin accounts can open this page.
          {data?.viewer?.email ? ` Signed in as ${data.viewer.email}.` : ""}
        </p>

        {error ? (
          <p className="error">
            {error}. Sign in with an admin account, or set ADMIN_EMAILS on Vercel and reload.
          </p>
        ) : null}

        {!data && !error ? <p>Loading…</p> : null}

        {data ? (
          <>
            <div className="admin-stats">
              <Stat label="Accounts" value={data.stats.accounts} hint={`+${data.stats.accountsWeek} this week`} />
              <Stat label="Premium" value={data.stats.premiumActive} hint="Active unlocks" />
              <Stat label="Waitlist" value={data.stats.waitlist} hint={`+${data.stats.waitlistWeek} this week`} />
              <Stat label="Contact" value={data.stats.contact} hint={`${data.stats.contactNew} new`} />
            </div>

            {planChips.length ? (
              <div className="admin-chips">
                {planChips.map(([key, count]) => (
                  <span key={key} className="admin-chip">
                    {key}: {count}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="admin-tabs" role="tablist">
              {[
                ["overview", "Overview"],
                ["waitlist", "Waitlist"],
                ["contact", "Contact"],
                ["premium", "Premium"],
                ["billing", "Billing"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={tab === id ? "admin-tab is-active" : "admin-tab"}
                  onClick={() => setTab(id)}
                >
                  {label}
                  {id === "contact" && data.stats.contactNew ? (
                    <span className="admin-badge">{data.stats.contactNew}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <div className="admin-panel">
                <h2>Snapshot</h2>
                <p className="muted">
                  {data.stats.accountsMonth} new accounts in 30 days · {data.stats.premiumActive} Premium active ·{" "}
                  {data.stats.contactNew} unread messages
                </p>
                <h3>Latest waitlist</h3>
                <AdminTable
                  columns={["Email", "Source", "When"]}
                  rows={(data.waitlist || []).slice(0, 8).map((row) => [
                    row.email,
                    row.source || "—",
                    new Date(row.created_at).toLocaleString(),
                  ])}
                />
                <h3>Latest contact</h3>
                <AdminTable
                  columns={["From", "Topic", "Status"]}
                  rows={(data.messages || []).slice(0, 8).map((row) => [
                    `${row.name} · ${row.email}`,
                    row.topic,
                    row.status,
                  ])}
                />
              </div>
            ) : null}

            {tab === "waitlist" ? (
              <div className="admin-panel">
                <h2>Waitlist</h2>
                <AdminTable
                  columns={["Email", "Source", "When"]}
                  rows={(data.waitlist || []).map((row) => [
                    row.email,
                    row.source || "—",
                    new Date(row.created_at).toLocaleString(),
                  ])}
                />
              </div>
            ) : null}

            {tab === "contact" ? (
              <div className="admin-panel">
                <h2>Contact</h2>
                <div className="admin-message-list">
                  {(data.messages || []).map((row) => (
                    <article key={row.id} className="admin-message">
                      <header>
                        <div>
                          <strong>{row.name}</strong>
                          <div className="muted">{row.email}</div>
                        </div>
                        <div className="admin-message-meta">
                          <span className="admin-chip">{row.topic}</span>
                          <span className="muted">{new Date(row.created_at).toLocaleString()}</span>
                        </div>
                      </header>
                      <p>{row.message}</p>
                      <label>
                        Status
                        <select
                          value={row.status}
                          disabled={busyId === row.id}
                          onChange={(e) => setStatus(row.id, e.target.value)}
                        >
                          <option value="new">new</option>
                          <option value="read">read</option>
                          <option value="replied">replied</option>
                          <option value="archived">archived</option>
                        </select>
                      </label>
                    </article>
                  ))}
                  {!data.messages?.length ? <p className="muted">No messages yet.</p> : null}
                </div>
              </div>
            ) : null}

            {tab === "premium" ? (
              <div className="admin-panel">
                <h2>Active Premium</h2>
                <AdminTable
                  columns={["User", "Plan", "Source", "Expires", "Updated"]}
                  rows={(data.premium || []).map((row) => [
                    row.user_id?.slice(0, 8) + "…",
                    row.plan_key || "—",
                    row.source || "—",
                    row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—",
                    row.updated_at ? new Date(row.updated_at).toLocaleString() : "—",
                  ])}
                />
              </div>
            ) : null}

            {tab === "billing" ? (
              <div className="admin-panel">
                <h2>Recent billing events</h2>
                <AdminTable
                  columns={["Type", "User", "When"]}
                  rows={(data.recentBilling || []).map((row) => [
                    row.event_type,
                    row.user_id ? row.user_id.slice(0, 8) + "…" : "—",
                    row.processed_at ? new Date(row.processed_at).toLocaleString() : "—",
                  ])}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function AdminTable({ columns, rows }) {
  if (!rows?.length) return <p className="muted">Nothing here yet.</p>;
  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
