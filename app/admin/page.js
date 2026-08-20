"use client";

import { useEffect, useMemo, useState } from "react";

const NAV = [
  { id: "overview", label: "Overview", icon: IconOverview },
  { id: "waitlist", label: "Waitlist", icon: IconWaitlist },
  { id: "contact", label: "Contact", icon: IconContact },
  { id: "premium", label: "Premium", icon: IconPremium },
  { id: "billing", label: "Billing", icon: IconBilling },
];

const CONTACT_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "replied", label: "Replied" },
  { id: "archived", label: "Archived" },
];

const PAGE_META = {
  overview: {
    title: "Overview",
    subtitle: "Accounts, Premium, waitlist, and contact at a glance.",
  },
  waitlist: {
    title: "Waitlist",
    subtitle: "Recent waitlist signups.",
  },
  contact: {
    title: "Contact",
    subtitle: "Inbox messages and status updates.",
  },
  premium: {
    title: "Premium",
    subtitle: "Active Premium unlocks.",
  },
  billing: {
    title: "Billing",
    subtitle: "Recent billing events.",
  },
};

function IconOverview() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconWaitlist() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 7h13M8 12h13M8 17h13" />
      <circle cx="4" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconContact() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconPremium() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m5 9 3.5 9h7L19 9l-3.5 2.5L12 6l-3.5 5.5L5 9z" />
    </svg>
  );
}

function IconBilling() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h4" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.2" />
      <path d="M3.5 18c1.2-2.6 3.2-4 5.5-4s4.3 1.4 5.5 4" />
      <path d="M14 14c1.8.2 3.3 1.2 4.5 4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function shortId(id) {
  if (!id) return "—";
  return `${String(id).slice(0, 8)}…`;
}

function formatWhen(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function statusClass(status) {
  const key = String(status || "").toLowerCase();
  if (key === "new") return "admin-badge admin-badge--new";
  if (key === "read") return "admin-badge admin-badge--read";
  if (key === "replied") return "admin-badge admin-badge--replied";
  if (key === "archived") return "admin-badge admin-badge--archived";
  return "admin-badge";
}

function planClass(plan) {
  const key = String(plan || "").toLowerCase();
  if (key.includes("year") || key.includes("annual")) return "admin-badge admin-badge--gold";
  if (key.includes("month")) return "admin-badge admin-badge--teal";
  return "admin-badge admin-badge--muted";
}

function StatTile({ label, value, hint, icon: Icon, tint }) {
  return (
    <div className="admin-stat">
      <div className={`admin-stat-icon ${tint || ""}`}>
        <Icon />
      </div>
      <div className="admin-stat-copy">
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
        {hint ? <div className="admin-stat-hint">{hint}</div> : null}
      </div>
    </div>
  );
}

function AdminTable({ columns, rows }) {
  if (!rows?.length) return <p className="admin-empty">Nothing here yet.</p>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
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

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [busyId, setBusyId] = useState(null);
  const [contactFilter, setContactFilter] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Forbidden");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Could not load admin data.");
      setData(null);
    } finally {
      setLoading(false);
    }
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

  const filteredMessages = useMemo(() => {
    const list = data?.messages || [];
    if (contactFilter === "all") return list;
    return list.filter((row) => row.status === contactFilter);
  }, [data, contactFilter]);

  const meta = PAGE_META[tab] || PAGE_META.overview;
  const viewerEmail = data?.viewer?.email || "";

  function goTab(id) {
    setTab(id);
    setMobileNavOpen(false);
  }

  return (
    <div className="admin-app">
      {mobileNavOpen ? (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside className={`admin-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true">
            T
          </div>
          <div className="admin-brand-copy">
            <div className="admin-brand-name">Tonaura</div>
            <div className="admin-brand-sub">Admin Console</div>
          </div>
          <button
            type="button"
            className="admin-icon-btn admin-sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <IconClose />
          </button>
        </div>

        <nav className="admin-side-nav" aria-label="Admin sections">
          <div className="admin-nav-section-label">Console</div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? "admin-nav-item is-active" : "admin-nav-item"}
                onClick={() => goTab(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
                {item.id === "contact" && data?.stats?.contactNew ? (
                  <span className="admin-nav-count">{data.stats.contactNew}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main-col">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-btn admin-menu-btn"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <IconMenu />
            </button>
            <div className="admin-topbar-titles">
              <h1>{meta.title}</h1>
              <p>{meta.subtitle}</p>
            </div>
          </div>
          <div className="admin-topbar-right">
            {viewerEmail ? (
              <div className="admin-viewer" title={viewerEmail}>
                <span className="admin-viewer-avatar" aria-hidden="true">
                  {viewerEmail.slice(0, 1).toUpperCase()}
                </span>
                <span className="admin-viewer-email">{viewerEmail}</span>
              </div>
            ) : null}
            <button type="button" className="admin-btn admin-btn--ghost" onClick={load}>
              Refresh
            </button>
            <a className="admin-btn admin-btn--ghost" href="/account">
              Account
            </a>
          </div>
        </header>

        <nav className="admin-mobile-tabs" aria-label="Admin sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "admin-mobile-tab is-active" : "admin-mobile-tab"}
              onClick={() => goTab(item.id)}
            >
              {item.label}
              {item.id === "contact" && data?.stats?.contactNew ? (
                <span className="admin-nav-count">{data.stats.contactNew}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <main className="admin-content">
          {error ? (
            <div className="admin-alert admin-alert--error">
              {error}. Sign in with an admin account, or set ADMIN_EMAILS on Vercel and reload.
            </div>
          ) : null}

          {loading && !data && !error ? <p className="admin-empty">Loading…</p> : null}

          {data ? (
            <>
              {(tab === "overview" || tab === "premium") && (
                <div className="admin-stats">
                  <StatTile
                    label="Accounts"
                    value={data.stats.accounts}
                    hint={`+${data.stats.accountsWeek} this week`}
                    icon={IconUsers}
                    tint="admin-stat-icon--teal"
                  />
                  <StatTile
                    label="Premium"
                    value={data.stats.premiumActive}
                    hint="Active unlocks"
                    icon={IconPremium}
                    tint="admin-stat-icon--gold"
                  />
                  <StatTile
                    label="Waitlist"
                    value={data.stats.waitlist}
                    hint={`+${data.stats.waitlistWeek} this week`}
                    icon={IconWaitlist}
                    tint="admin-stat-icon--cream"
                  />
                  <StatTile
                    label="Contact"
                    value={data.stats.contact}
                    hint={`${data.stats.contactNew} new`}
                    icon={IconContact}
                    tint="admin-stat-icon--teal"
                  />
                </div>
              )}

              {tab === "overview" ? (
                <section className="admin-panel">
                  {planChips.length ? (
                    <div className="admin-chips">
                      {planChips.map(([key, count]) => (
                        <span key={key} className="admin-chip">
                          {key}: {count}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="admin-lead">
                    {data.stats.accountsMonth} new accounts in 30 days · {data.stats.premiumActive} Premium active ·{" "}
                    {data.stats.contactNew} unread messages
                  </p>

                  <h2 className="admin-section-title">Latest waitlist</h2>
                  <AdminTable
                    columns={["Email", "Source", "When"]}
                    rows={(data.waitlist || []).slice(0, 8).map((row) => [
                      row.email,
                      row.source || "—",
                      formatWhen(row.created_at),
                    ])}
                  />

                  <h2 className="admin-section-title">Latest contact</h2>
                  <AdminTable
                    columns={["From", "Topic", "Status"]}
                    rows={(data.messages || []).slice(0, 8).map((row) => [
                      `${row.name} · ${row.email}`,
                      row.topic,
                      <span key={row.id} className={statusClass(row.status)}>
                        {row.status}
                      </span>,
                    ])}
                  />
                </section>
              ) : null}

              {tab === "waitlist" ? (
                <section className="admin-panel">
                  <AdminTable
                    columns={["Email", "Source", "When"]}
                    rows={(data.waitlist || []).map((row) => [
                      row.email,
                      row.source || "—",
                      formatWhen(row.created_at),
                    ])}
                  />
                </section>
              ) : null}

              {tab === "contact" ? (
                <section className="admin-panel">
                  <div className="admin-filter-chips" role="tablist" aria-label="Contact status">
                    {CONTACT_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={contactFilter === f.id}
                        className={
                          contactFilter === f.id
                            ? "admin-filter-chip is-active"
                            : "admin-filter-chip"
                        }
                        onClick={() => setContactFilter(f.id)}
                      >
                        {f.label}
                        {f.id === "new" && data.stats.contactNew ? (
                          <span className="admin-nav-count">{data.stats.contactNew}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="admin-message-list">
                    {filteredMessages.map((row) => (
                      <article key={row.id} className="admin-message">
                        <header>
                          <div>
                            <strong>{row.name}</strong>
                            <div className="admin-message-email">{row.email}</div>
                          </div>
                          <div className="admin-message-meta">
                            <span className="admin-chip">{row.topic}</span>
                            <span className={statusClass(row.status)}>{row.status}</span>
                            <span className="admin-message-when">{formatWhen(row.created_at)}</span>
                          </div>
                        </header>
                        <p>{row.message}</p>
                        <label className="admin-message-status">
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
                    {!filteredMessages.length ? (
                      <p className="admin-empty">No messages in this filter.</p>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {tab === "premium" ? (
                <section className="admin-panel">
                  {planChips.length ? (
                    <div className="admin-chips">
                      {planChips.map(([key, count]) => (
                        <span key={key} className="admin-chip">
                          {key}: {count}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <AdminTable
                    columns={["User", "Plan", "Source", "Expires", "Updated"]}
                    rows={(data.premium || []).map((row) => [
                      shortId(row.user_id),
                      <span key={`${row.user_id}-plan`} className={planClass(row.plan_key)}>
                        {row.plan_key || "—"}
                      </span>,
                      row.source || "—",
                      formatDate(row.expires_at),
                      formatWhen(row.updated_at),
                    ])}
                  />
                </section>
              ) : null}

              {tab === "billing" ? (
                <section className="admin-panel">
                  <AdminTable
                    columns={["Type", "User", "When"]}
                    rows={(data.recentBilling || []).map((row) => [
                      <span key={row.event_id || row.event_type} className="admin-badge admin-badge--muted">
                        {row.event_type}
                      </span>,
                      shortId(row.user_id),
                      formatWhen(row.processed_at),
                    ])}
                  />
                </section>
              ) : null}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
