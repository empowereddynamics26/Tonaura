"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/ui/LoadingState";
import "./settings.css";

export default function AccountSettingsPage() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Focus tracking for the floating-label pattern
  const [focused, setFocused] = useState("");

  // Auto-dismiss success notices after 4 seconds.
useEffect(() => {
  if (!profileNotice) return;
  const t = setTimeout(() => setProfileNotice(""), 4000);
  return () => clearTimeout(t);
}, [profileNotice]);

useEffect(() => {
  if (!passwordNotice) return;
  const t = setTimeout(() => setPasswordNotice(""), 4000);
  return () => clearTimeout(t);
}, [passwordNotice]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    setUser(data.user || null);
    if (!data.user) return;

    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .maybeSingle();

    setProfile(prof);
    const name = prof?.display_name || "";
    setDisplayName(name);
    setInitialDisplayName(name);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileNotice("");

    const trimmed = displayName.trim();

    if (trimmed.length > 80) {
      setProfileError("Display name must be 80 characters or fewer.");
      return;
    }

    if (trimmed === initialDisplayName) {
      setProfileNotice("No changes to save.");
      return;
    }

    setProfileSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("profiles")
        .update({ display_name: trimmed || null })
        .eq("id", user.id);

      if (err) throw err;

      setInitialDisplayName(trimmed);
      setProfileNotice("Display name saved.");
    } catch (err) {
      setProfileError(err.message || "Could not save.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;

      // Fire the security-alert email — same call as /reset-password.
      const email = user?.email;
      if (email) {
        fetch("/api/auth/security-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            email,
            eventLabel: "Password changed",
            detail: "Your password was updated from the account settings page.",
          }),
        }).catch(() => {});
      }

      setPassword("");
      setPasswordConfirm("");
      setPasswordNotice("Password updated.");
    } catch (err) {
      setPasswordError(err.message || "Could not update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  /* ---------- Loading ---------- */
if (user === undefined) {
  return <LoadingState label="One moment" size="lg" />;
}

  /* ---------- Signed out ---------- */
  if (!user) {
    return (
      <div className="settings-shell">
        <div className="settings-signedout">
          <span className="settings-diamond" aria-hidden="true" />
          <p className="settings-eyebrow">Account settings</p>
          <h1 className="settings-title">Sign in to continue</h1>
          <p className="settings-lede">
            Settings live inside your Tonaura account.
          </p>
          <div className="settings-signedout-actions">
            <Link className="btn btn--primary btn--large" href="/login">
              Sign in
            </Link>
            <Link className="btn btn--ghost btn--large" href="/signup">
              <span className="btn-dot" />
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Signed in ---------- */
  const profileDirty = displayName.trim() !== initialDisplayName;

  return (
    <div className="settings-shell">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="settings-header">
        <Link className="settings-back" href="/account">
          <span aria-hidden="true">←</span> Back to account
        </Link>
        <h1 className="settings-title">Account settings</h1>
        <p className="settings-lede">
          Your name in the app, and your password. Nothing else changes here.
        </p>
      </header>

      {/* ── Profile ─────────────────────────────────────────── */}
      <section className="settings-section">
        <p className="settings-section-label">Profile</p>

        <form className="settings-form" onSubmit={saveProfile}>
          <div
            className={`settings-field${
              focused === "displayName" ? " is-focused" : ""
            }${displayName ? " has-value" : ""}`}
          >
            <label className="settings-field-label" htmlFor="displayName">
              Display name
            </label>
            <input
              className="settings-field-input"
              id="displayName"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={() => setFocused("displayName")}
              onBlur={() => setFocused("")}
            />
            <span className="settings-field-underline" aria-hidden="true" />
          </div>

        <p className="settings-hint">
  At least 6 characters. Choose something you don&rsquo;t use elsewhere.
</p>

          <div className="settings-form-actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={profileSaving || !profileDirty}
            >
              {profileSaving ? "Saving…" : "Save changes"}
            </button>
          </div>

          {profileError ? (
            <p className="settings-notice settings-notice--error">
              {profileError}
            </p>
          ) : null}
          {profileNotice ? (
            <p className="settings-notice settings-notice--ok">
              {profileNotice}
            </p>
          ) : null}
        </form>
      </section>

      {/* ── Password ────────────────────────────────────────── */}
      <section className="settings-section">
        <p className="settings-section-label">Password</p>

        <form className="settings-form" onSubmit={savePassword}>
          <div
            className={`settings-field${
              focused === "password" ? " is-focused" : ""
            }${password ? " has-value" : ""}`}
          >
            <label className="settings-field-label" htmlFor="password">
              New password
            </label>
            <input
              className="settings-field-input"
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
            />
            <span className="settings-field-underline" aria-hidden="true" />
          </div>

          <div
            className={`settings-field${
              focused === "passwordConfirm" ? " is-focused" : ""
            }${passwordConfirm ? " has-value" : ""}`}
          >
            <label className="settings-field-label" htmlFor="passwordConfirm">
              Confirm new password
            </label>
            <input
              className="settings-field-input"
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onFocus={() => setFocused("passwordConfirm")}
              onBlur={() => setFocused("")}
            />
            <span className="settings-field-underline" aria-hidden="true" />
          </div>

          <p className="settings-hint">
            At least 6 characters. We&rsquo;ll email you a security alert when
            it&rsquo;s changed.
          </p>

          <div className="settings-form-actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={passwordSaving || !password || !passwordConfirm}
            >
              {passwordSaving ? "Updating…" : "Update password"}
            </button>
          </div>

          {passwordError ? (
            <p className="settings-notice settings-notice--error">
              {passwordError}
            </p>
          ) : null}
          {passwordNotice ? (
            <p className="settings-notice settings-notice--ok">
              {passwordNotice}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}