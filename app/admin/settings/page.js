"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  const [viewer, setViewer] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteErr, setInviteErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (res.ok) setViewer(json.viewer || null);
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
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Invite failed.");
      setInviteMsg(json.emailed ? "Invite email sent." : "Invite created (email may be skipped if SMTP is unset).");
      setInviteEmail("");
    } catch (err) {
      setInviteErr(err.message || "Could not send invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  return (
    <AdminShell title="Settings" subtitle="Admin access and how Premium is managed.">
      <div className="ta-settings-grid">
        <div className="ta-card ta-settings-card">
          <h3>Signed-in admin</h3>
          <p>
            {viewer?.email || "—"}
            <br />
            <span className="ta-muted">{viewer?.id}</span>
          </p>
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Admin access</h3>
          <p>
            Accounts with <strong>profiles.role = admin</strong>, or emails listed in the{" "}
            <strong>ADMIN_EMAILS</strong> env var on Vercel, can open this console. Email matches are
            auto-promoted to the admin role on first successful API call.
          </p>
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Invite an admin</h3>
          <p style={{ marginBottom: 12 }}>
            Sends a branded Tonaura invite email and grants the admin role when they accept.
          </p>
          <form onSubmit={sendInvite} className="ta-invite-form">
            <input
              className="ta-input"
              type="email"
              required
              placeholder="colleague@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button type="submit" className="ta-btn ta-btn-primary" disabled={inviteBusy}>
              {inviteBusy ? "Sending…" : "Send invite"}
            </button>
          </form>
          {inviteErr ? <p className="ta-error" style={{ marginTop: 10 }}>{inviteErr}</p> : null}
          {inviteMsg ? <p className="ta-ok" style={{ marginTop: 10 }}>{inviteMsg}</p> : null}
        </div>
        <div className="ta-card ta-settings-card">
          <h3>Premium source of truth</h3>
          <p>
            Website Stripe checkout writes <strong>entitlement_cache</strong>. The Tonaura app unlocks
            when the same account signs in and refreshes Premium. Manual grant/revoke from Accounts
            sets <code>source = manual</code>.
          </p>
        </div>
        <div className="ta-card ta-settings-card">
          <h3>App admin</h3>
          <p>
            The mobile app Admin panel uses the same APIs with a Bearer token. Open Account → Open
            admin panel when your profile role is admin.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
