"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  const [viewer, setViewer] = useState(null);

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
