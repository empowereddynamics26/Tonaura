"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen, shortId } from "@/components/admin/ui";

const ROLES = ["user", "support", "admin", "super_admin"];

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(null);
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

  return (
    <AdminShell
      title={user?.email || shortId(id)}
      subtitle="Account detail, Premium, billing, and role."
    >
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin/users">← Accounts</Link>
      </p>
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}
      {!user && !error ? <div className="ta-muted">Loading…</div> : null}

      {user ? (
        <div className="ta-settings-grid">
          <div className="ta-card ta-settings-card">
            <h3>Profile</h3>
            <p>
              <strong>{user.email || "—"}</strong>
              <br />
              <span className="ta-muted">{user.display_name || "No display name"}</span>
              <br />
              <span className="ta-muted">{user.id}</span>
            </p>
            <p className="ta-muted">
              Joined {formatWhen(user.created_at)}
              {user.auth?.last_sign_in_at ? ` · Last sign-in ${formatWhen(user.auth.last_sign_in_at)}` : ""}
            </p>
            {user.stripe_customer_id ? (
              <p className="ta-muted">Stripe: {user.stripe_customer_id}</p>
            ) : null}
          </div>

          <div className="ta-card ta-settings-card">
            <h3>Premium</h3>
            <p>
              {user.premium_active ? (
                <Badge tone="gold">{user.plan_key || "active"}</Badge>
              ) : (
                <Badge>free</Badge>
              )}
            </p>
            <p className="ta-muted">
              Source: {user.premium_source || "—"}
              {user.premium_expires_at ? ` · Expires ${formatWhen(user.premium_expires_at)}` : ""}
            </p>
            <div className="ta-row-actions" style={{ marginTop: 12 }}>
              {user.premium_active ? (
                <button
                  type="button"
                  className="ta-btn ta-btn-danger ta-btn-sm"
                  disabled={!!busy}
                  onClick={() => setPremium("revoke")}
                >
                  {busy === "revoke" ? "…" : "Revoke"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="ta-btn ta-btn-gold ta-btn-sm"
                    disabled={!!busy}
                    onClick={() => setPremium("grant", "monthly")}
                  >
                    {busy === "grant" ? "…" : "Grant monthly"}
                  </button>
                  <button
                    type="button"
                    className="ta-btn ta-btn-ghost ta-btn-sm"
                    disabled={!!busy}
                    onClick={() => setPremium("grant", "yearly")}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    className="ta-btn ta-btn-ghost ta-btn-sm"
                    disabled={!!busy}
                    onClick={() => setPremium("grant", "lifetime")}
                  >
                    Lifetime
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="ta-card ta-settings-card">
            <h3>Role</h3>
            <p className="ta-muted" style={{ marginBottom: 10 }}>
              support can use inbox; admin / super_admin can grant Premium and change settings.
            </p>
            <div className="ta-invite-form">
              <select className="ta-input" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button type="button" className="ta-btn ta-btn-primary" disabled={!!busy} onClick={saveRole}>
                {busy === "role" ? "…" : "Save role"}
              </button>
            </div>
          </div>

          <div className="ta-card ta-settings-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Billing events</h3>
            {(user.billing || []).length === 0 ? (
              <div className="ta-empty">No billing events for this account.</div>
            ) : (
              <div className="ta-table-wrap">
                <table className="ta-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.billing.map((e) => (
                      <tr key={e.event_id}>
                        <td>
                          <Badge tone="teal">{e.event_type}</Badge>
                        </td>
                        <td>{formatWhen(e.processed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
