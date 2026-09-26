"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  /* No session → no password to reset. Send them to request a link. */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (alive && !session) {
          window.location.replace("/forgot-password");
        }
      } catch {
        // Silent
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      const email = userData?.user?.email;
      if (email) {
        fetch("/api/auth/security-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            email,
            eventLabel: "Password changed",
            detail: "Your password was updated from the website reset flow.",
          }),
        }).catch(() => {});
      }
      window.location.href = "/account";
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <img
          className="auth-card-mark"
          src="/images/brand/mark.png"
          alt=""
          width="56"
          height="56"
        />
        <p className="auth-card-eyebrow">Account</p>
        <h1 className="auth-card-title">Choose a new password</h1>
        <p className="auth-card-subtitle">
          Something you&rsquo;ll remember. At least 6 characters.
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <div
          className={`auth-field${focused === "password" ? " is-focused" : ""}${
            password ? " has-value" : ""
          }`}
        >
          <label className="auth-field-label" htmlFor="password">
            New password
          </label>
          <input
            className="auth-field-input"
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused("")}
          />
          <span className="auth-field-underline" aria-hidden="true" />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--large auth-submit"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save password"}
        </button>

        {error ? (
          <p className="auth-notice auth-notice--error">{error}</p>
        ) : null}
      </form>

      <div className="auth-aside">
        <p className="auth-aside-line">
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}