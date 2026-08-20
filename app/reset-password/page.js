"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteNav } from "@/components/SiteNav";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      window.location.href = "/account";
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteNav />
      <div className="shell">
        <p className="kicker">Account</p>
        <h1>Choose a new password</h1>
        <form className="card" onSubmit={onSubmit}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </>
  );
}
