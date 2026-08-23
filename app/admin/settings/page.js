"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  const [viewer, setViewer] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteErr, setInviteErr] = useState("");
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
    <AdminShell title="Settings" subtitle="Invites, platform copy, and how Premium syncs.">
      <div className="ta-settings-grid">
        <div className="ta-card ta-settings-card">
          <h3>Signed-in admin</h3>
          <p>
            {viewer?.email || "—"}
            <br />
            <span className="ta-muted">
              {viewer?.role || "admin"} · {viewer?.id}
            </span>
          </p>
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Admin access</h3>
          <p>
            Roles: <strong>support</strong>, <strong>admin</strong>, <strong>super_admin</strong>, or emails in{" "}
            <strong>ADMIN_EMAILS</strong>. Website and app admin share the same APIs and audit log.
          </p>
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Invite staff</h3>
          <form onSubmit={sendInvite} className="ta-invite-form">
            <input
              className="ta-input"
              type="email"
              required
              placeholder="colleague@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select className="ta-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="support">support</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <button type="submit" className="ta-btn ta-btn-primary" disabled={inviteBusy}>
              {inviteBusy ? "Sending…" : "Send invite"}
            </button>
          </form>
          {inviteErr ? (
            <p className="ta-error" style={{ marginTop: 10 }}>
              {inviteErr}
            </p>
          ) : null}
          {inviteMsg ? (
            <p className="ta-ok" style={{ marginTop: 10 }}>
              {inviteMsg}
            </p>
          ) : null}
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Platform settings</h3>
          {settings ? (
            <form onSubmit={saveSettings}>
              <label className="ta-muted">Maintenance message</label>
              <textarea
                className="ta-input"
                rows={3}
                value={settings.maintenance_message || ""}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
              />
              <label className="ta-muted" style={{ display: "block", marginTop: 10 }}>
                Support email
              </label>
              <input
                className="ta-input"
                value={settings.support_email || ""}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              />
              <label className="ta-muted" style={{ display: "block", marginTop: 10 }}>
                From name
              </label>
              <input
                className="ta-input"
                value={settings.from_name || ""}
                onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
              />
              <button type="submit" className="ta-btn ta-btn-primary" style={{ marginTop: 12 }} disabled={settingsBusy}>
                {settingsBusy ? "Saving…" : "Save"}
              </button>
              {settingsErr ? <p className="ta-error">{settingsErr}</p> : null}
              {settingsMsg ? <p className="ta-ok">{settingsMsg}</p> : null}
            </form>
          ) : (
            <p className="ta-muted">Loading… (run migration if this stays empty)</p>
          )}
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Premium + app sync</h3>
          <p>
            Stripe and manual grants write <strong>entitlement_cache</strong>. The app and website admin both call{" "}
            <code>/api/admin/*</code> with the same Bearer token, so changes appear on both consoles after refresh.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
