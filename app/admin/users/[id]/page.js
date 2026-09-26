"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserDetailSkeleton } from "@/components/admin/UserDetailSkeleton";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";
import "./user-detail.css";

const ROLES = ["user", "support", "admin", "super_admin"];

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [role, setRole] = useState("user");

  async function load() {
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setUser(json.user);
      setRole(json.user?.role || "user");
    } catch (e) {
      setError(e.message || "Could not load user.");
      setUser(null);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function setPremium(action, planKey = "monthly") {
    setBusy(action);
    setNotice("");
    try {
      const res = await fetch("/api/admin/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, action, plan_key: planKey }),
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

  async function saveRole() {
    setBusy("role");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice(`Role set to ${role}.`);
      await load();
    } catch (e) {
      setError(e.message || "Could not update role.");
    } finally {
      setBusy("");
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (user === undefined && !error) {
    return (
      <AdminShell
        title="Account detail"
        section="Users & growth"
        subtitle="Account detail, Premium, billing, and role."
      >
        <UserDetailSkeleton />
      </AdminShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error && !user) {
    return (
      <AdminShell
        title="Account detail"
        section="Users & growth"
        subtitle="Account detail, Premium, billing, and role."
      >
        <Link href="/admin/users" className="ta-back-link">
          <span aria-hidden="true">←</span> All accounts
        </Link>
        <div className="ta-error">{error}</div>
      </AdminShell>
    );
  }

  // ── Loaded ─────────────────────────────────────────────────────────────
  const initial = (user?.email || "?")[0].toUpperCase();
  const premium = !!user?.premium_active;

  return (
    <AdminShell
      title={user?.email || shortId(id)}
      section="Users & growth"
      subtitle="Account detail, Premium, billing, and role."
    >
      {/* ── Back link ──────────────────────────────────────────── */}
      <Link href="/admin/users" className="ta-back-link">
        <span aria-hidden="true">←</span> All accounts
      </Link>

      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {user ? (
        <div className="ta-detail">
          {/* ── Profile header ─────────────────────────────────── */}
          <header className="ta-profile-header">
            <div className="ta-profile-header-main">
              <span className="ta-profile-avatar" aria-hidden="true">
                {initial}
              </span>
              <div className="ta-profile-copy">
                <h1 className="ta-profile-email">
                  {user.email || "—"}
                </h1>
                <p className="ta-profile-name">
                  {user.display_name || "No display name"}
                </p>
              </div>
            </div>

            <div className="ta-profile-meta">
              <div className="ta-profile-meta-item">
                <span className="ta-profile-meta-label">Role</span>
                <Badge tone={user.role === "user" ? "default" : "teal"}>
                  {user.role || "user"}
                </Badge>
              </div>
              <div className="ta-profile-meta-item">
                <span className="ta-profile-meta-label">Premium</span>
                {premium ? (
                  <Badge tone="gold">{user.plan_key || "active"}</Badge>
                ) : (
                  <Badge>free</Badge>
                )}
              </div>
              <div className="ta-profile-meta-item">
                <span className="ta-profile-meta-label">Joined</span>
                <span className="ta-profile-meta-value">
                  {formatWhen(user.created_at)}
                </span>
              </div>
              {user.auth?.last_sign_in_at ? (
                <div className="ta-profile-meta-item">
                  <span className="ta-profile-meta-label">Last sign-in</span>
                  <span className="ta-profile-meta-value">
                    {formatWhen(user.auth.last_sign_in_at)}
                  </span>
                </div>
              ) : null}
            </div>
          </header>

          {/* ── Premium control ────────────────────────────────── */}
          <section className="ta-detail-section">
            <header className="ta-detail-section-head">
              <h2>Premium</h2>
              <p>
                {premium
                  ? "This account has Premium. Revoking removes access immediately."
                  : "This account is on the free plan. Grant Premium to unlock every feature in the app."}
              </p>
            </header>

            <div className="ta-card">
              <div className="ta-detail-info">
                <div className="ta-detail-info-row">
                  <span className="ta-detail-info-label">Status</span>
                  <span className="ta-detail-info-value">
                    {premium ? (
                      <Badge tone="gold">{user.plan_key || "active"}</Badge>
                    ) : (
                      <Badge>free</Badge>
                    )}
                  </span>
                </div>
                {user.premium_source ? (
                  <div className="ta-detail-info-row">
                    <span className="ta-detail-info-label">Source</span>
                    <span className="ta-detail-info-value">
                      {user.premium_source}
                    </span>
                  </div>
                ) : null}
                {user.premium_expires_at ? (
                  <div className="ta-detail-info-row">
                    <span className="ta-detail-info-label">Expires</span>
                    <span className="ta-detail-info-value">
                      {formatWhen(user.premium_expires_at)}
                    </span>
                  </div>
                ) : null}
                {user.stripe_customer_id ? (
                  <div className="ta-detail-info-row">
                    <span className="ta-detail-info-label">Stripe</span>
                    <span className="ta-detail-info-value ta-detail-info-code">
                      {user.stripe_customer_id}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="ta-detail-actions">
                {premium ? (
                  <button
                    type="button"
                    className="ta-btn ta-btn-danger"
                    disabled={!!busy}
                    onClick={() => setPremium("revoke")}
                  >
                    {busy === "revoke" ? "Revoking…" : "Revoke Premium"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ta-btn ta-btn-gold"
                      disabled={!!busy}
                      onClick={() => setPremium("grant", "monthly")}
                    >
                      {busy === "grant" ? "Granting…" : "Grant monthly"}
                    </button>
                    <button
                      type="button"
                      className="ta-btn ta-btn-ghost"
                      disabled={!!busy}
                      onClick={() => setPremium("grant", "yearly")}
                    >
                      Grant yearly
                    </button>
                    <button
                      type="button"
                      className="ta-btn ta-btn-ghost"
                      disabled={!!busy}
                      onClick={() => setPremium("grant", "lifetime")}
                    >
                      Grant lifetime
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ── Role control ───────────────────────────────────── */}
          <section className="ta-detail-section">
            <header className="ta-detail-section-head">
              <h2>Role &amp; access</h2>
              <p>
                <strong>Support</strong> can use the contact inbox.{" "}
                <strong>Admin</strong> can grant Premium and manage users.{" "}
                <strong>Super admin</strong> can change platform settings.
              </p>
            </header>

            <div className="ta-card">
              <div className="ta-detail-role-row">
                <div className="ta-field">
                  <label className="ta-field-label" htmlFor="role-select">
                    Assigned role
                  </label>
                  <select
                    id="role-select"
                    className="ta-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="ta-btn ta-btn-gold"
                  disabled={!!busy || role === user.role}
                  onClick={saveRole}
                >
                  {busy === "role" ? "Saving…" : "Save role"}
                </button>
              </div>
            </div>
          </section>

          {/* ── Billing events ─────────────────────────────────── */}
          <section className="ta-detail-section">
            <header className="ta-detail-section-head">
              <h2>Billing history</h2>
              <p>Every Stripe event recorded for this account.</p>
            </header>

            <div className="ta-card ta-card--table">
              {(user.billing || []).length === 0 ? (
                <div className="ta-empty">
                  No billing events for this account yet.
                </div>
              ) : (
                <div className="ta-table-wrap">
                  <table className="ta-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th className="ta-table-th-right">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.billing.map((e) => (
                        <tr key={e.event_id}>
                          <td>
                            <Badge tone="teal">{e.event_type}</Badge>
                          </td>
                          <td className="ta-table-when ta-table-td-right">
                            {formatWhen(e.processed_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}