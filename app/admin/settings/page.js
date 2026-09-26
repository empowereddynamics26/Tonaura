"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import "./settings.css";

export default function AdminSettingsPage() {
  const [viewer, setViewer] = useState(null);

  /* ---- Invite form ---- */
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteErr, setInviteErr] = useState("");

  /* ---- Platform settings ---- */
  const [settings, setSettings] = useState(null);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsErr, setSettingsErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [ov, st] = await Promise.all([
          fetch("/api/admin/overview").then((r) => r.json()),
          fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({})),
        ]);
        if (ov.viewer) setViewer(ov.viewer);
        if (st.settings) setSettings(st.settings);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function sendInvite(e) {
    e.preventDefault();
    setInviteBusy(true);
    setInviteMsg("");
    setInviteErr("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Invite failed.");
      setInviteMsg(
        json.emailed
          ? `Invite email sent (${json.role || inviteRole}).`
          : "Invite created (email may be skipped if SMTP is unset)."
      );
      setInviteEmail("");
    } catch (err) {
      setInviteErr(err.message || "Could not send invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSettingsBusy(true);
    setSettingsMsg("");
    setSettingsErr("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_message: settings?.maintenance_message,
          support_email: settings?.support_email,
          from_name: settings?.from_name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSettings(json.settings);
      setSettingsMsg("Platform settings saved.");
    } catch (err) {
      setSettingsErr(err.message || "Could not save.");
    } finally {
      setSettingsBusy(false);
    }
  }

  return (
    <AdminShell
      title="Settings"
      section="Administration"
      subtitle="Manage admin access, platform copy, and how Premium syncs."
    >
      {/* ── Admin access ─────────────────────────────────────────── */}
      <section className="ta-section">
        <header className="ta-section-head">
          <h2 className="ta-section-title">Admin access</h2>
          <p className="ta-section-desc">
            Who can open this console, and what they can do once inside.
          </p>
        </header>

        <div className="ta-section-grid">
          <div className="ta-card">
            <h3 className="ta-card-title">Signed-in admin</h3>
            <div className="ta-identity">
              <span className="ta-identity-avatar" aria-hidden="true">
                {(viewer?.email || "A").slice(0, 1).toUpperCase()}
              </span>
              <div className="ta-identity-copy">
                <span className="ta-identity-email">
                  {viewer?.email || "—"}
                </span>
                <span className="ta-identity-role">
                  {viewer?.role || "admin"}
                </span>
              </div>
            </div>
            {viewer?.id ? (
              <p className="ta-card-meta">
                ID <code>{viewer.id}</code>
              </p>
            ) : null}
          </div>

          <div className="ta-card">
            <h3 className="ta-card-title">Invite staff</h3>
            <p className="ta-card-help">
              They&rsquo;ll receive an email with a sign-in link. Role can be
              changed later.
            </p>

            <form className="ta-form" onSubmit={sendInvite}>
              <div className="ta-field">
                <label className="ta-field-label" htmlFor="invite-email">
                  Email address
                </label>
                <input
                  id="invite-email"
                  className="ta-input"
                  type="email"
                  required
                  placeholder="colleague@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="ta-field">
                <label className="ta-field-label" htmlFor="invite-role">
                  Role
                </label>
                <select
                  id="invite-role"
                  className="ta-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="support">support — inbox access</option>
                  <option value="admin">admin — full console</option>
                  <option value="super_admin">super_admin — full + settings</option>
                </select>
              </div>

              <div className="ta-form-actions">
                <button
                  type="submit"
                  className="ta-btn ta-btn-gold"
                  disabled={inviteBusy}
                >
                  {inviteBusy ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>

            {inviteErr ? (
              <p className="ta-notice ta-notice--error">{inviteErr}</p>
            ) : null}
            {inviteMsg ? (
              <p className="ta-notice ta-notice--ok">{inviteMsg}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Platform copy ────────────────────────────────────────── */}
      <section className="ta-section">
        <header className="ta-section-head">
          <h2 className="ta-section-title">Platform copy</h2>
          <p className="ta-section-desc">
            Message shown during maintenance, and the sender details used
            in outbound email.
          </p>
        </header>

        <div className="ta-card">
          {settings ? (
            <form className="ta-form" onSubmit={saveSettings}>
              <div className="ta-field">
                <label className="ta-field-label" htmlFor="maintenance-message">
                  Maintenance message
                </label>
                <textarea
                  id="maintenance-message"
                  className="ta-input ta-textarea"
                  rows={3}
                  placeholder="Tonaura is under maintenance. Back shortly."
                  value={settings.maintenance_message || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance_message: e.target.value,
                    })
                  }
                />
                <p className="ta-field-hint">
                  Shown to visitors when maintenance mode is on.
                </p>
              </div>

              <div className="ta-field-row">
                <div className="ta-field">
                  <label className="ta-field-label" htmlFor="support-email">
                    Support email
                  </label>
                  <input
                    id="support-email"
                    className="ta-input"
                    type="email"
                    value={settings.support_email || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        support_email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="ta-field">
                  <label className="ta-field-label" htmlFor="from-name">
                    From name
                  </label>
                  <input
                    id="from-name"
                    className="ta-input"
                    value={settings.from_name || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, from_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="ta-form-actions">
                <button
                  type="submit"
                  className="ta-btn ta-btn-gold"
                  disabled={settingsBusy}
                >
                  {settingsBusy ? "Saving…" : "Save changes"}
                </button>
              </div>

              {settingsErr ? (
                <p className="ta-notice ta-notice--error">{settingsErr}</p>
              ) : null}
              {settingsMsg ? (
                <p className="ta-notice ta-notice--ok">{settingsMsg}</p>
              ) : null}
            </form>
          ) : (
            <p className="ta-card-help">
              Loading platform settings… If this stays empty, run the admin
              console migration.
            </p>
          )}
        </div>
      </section>

      {/* ── Reference ────────────────────────────────────────────── */}
      <section className="ta-section">
        <header className="ta-section-head">
          <h2 className="ta-section-title">Reference</h2>
          <p className="ta-section-desc">
            How the admin system works. Nothing on this page needs to be
            changed here.
          </p>
        </header>

        <div className="ta-section-grid">
          <div className="ta-card">
            <h3 className="ta-card-title">Roles &amp; access</h3>
            <p className="ta-card-body">
              <strong>support</strong> can use the inbox.{" "}
              <strong>admin</strong> can grant Premium, manage users, and
              see revenue. <strong>super_admin</strong> can also change
              platform settings and feature flags.
            </p>
            <p className="ta-card-body">
              Access can also be granted by listing an email in{" "}
              <code>ADMIN_EMAILS</code>.
            </p>
          </div>

          <div className="ta-card">
            <h3 className="ta-card-title">Premium &amp; app sync</h3>
            <p className="ta-card-body">
              Stripe webhooks and manual grants write to{" "}
              <code>entitlement_cache</code>. The app reads that table after
              sign-in and unlocks Premium for the matching email.
            </p>
            <p className="ta-card-body">
              Changes made here appear on both the website and the app after
              a refresh.
            </p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}