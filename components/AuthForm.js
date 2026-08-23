"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteNav } from "./SiteNav";
import { safeRedirectPath } from "@/lib/security";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.2 5.2C39 36.9 44 32 44 24c0-1.3-.1-2.7-.4-3.9z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 15 2.94 10.53 4.7 7.48c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function AuthForm({ mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const signup = mode === "signup";
  const forgot = mode === "forgot";
  const title = signup ? "Create your account" : forgot ? "Reset password" : "Sign in";
  const subtitle = signup
    ? "This is the same account you use in the Tonaura app. Subscribe here, then sign in on your phone."
    : forgot
      ? "We’ll email a reset link. Finish it on this website, then sign in on the app with the new password."
      : "Use the same email as in the app. Premium bought here unlocks there after you sign in.";

  function redirectNext() {
    const params = new URLSearchParams(window.location.search);
    return safeRedirectPath(params.get("next"), "/account");
  }

  async function startOAuth(provider) {
    setError("");
    setNotice("");
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const next = redirectNext();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(
        err.message ||
          (provider === "apple"
            ? "Apple sign-in needs the Apple provider enabled in Supabase."
            : "Google sign-in needs the Google provider enabled in Supabase.")
      );
      setOauthLoading(null);
    }
  }

  async function sendMagicLink() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setMagicLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), next: redirectNext() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not send sign-in link.");
      setNotice("Check your email for a sign-in link.");
    } catch (err) {
      setError(err.message || "Could not send sign-in link.");
    } finally {
      setMagicLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (forgot) {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Could not send reset link.");
        setNotice("If that email has an account, a reset link is on its way.");
        return;
      }
      if (signup) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Could not create account.");
        setNotice(
          json.needsConfirmation
            ? "Check your email to confirm this account, then sign in."
            : "Account created. You can sign in now."
        );
        return;
      }
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) throw err;
      window.location.href = redirectNext();
    } catch (err) {
      setError(err.message || "Could not continue.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || !!oauthLoading || magicLoading;

  return (
    <>
      <SiteNav />
      <div className="shell">
        <p className="kicker">Tonaura</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {!forgot ? (
          <div className="oauth-stack">
            <button
              type="button"
              className="oauth-btn oauth-google"
              disabled={busy}
              onClick={() => startOAuth("google")}
            >
              <GoogleIcon />
              {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
            <button
              type="button"
              className="oauth-btn oauth-apple"
              disabled={busy}
              onClick={() => startOAuth("apple")}
            >
              <AppleIcon />
              {oauthLoading === "apple" ? "Redirecting…" : "Continue with Apple"}
            </button>
            <div className="oauth-divider" role="separator">
              <span>or use email</span>
            </div>
          </div>
        ) : null}

        <form className="card" onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!forgot && (
            <>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          {error ? <p className="error">{error}</p> : null}
          {notice ? <p className="ok">{notice}</p> : null}
          <button type="submit" disabled={busy}>
            {loading ? "Please wait…" : forgot ? "Send reset link" : signup ? "Create account" : "Sign in"}
          </button>
          {!forgot && !signup ? (
            <button
              type="button"
              className="oauth-btn"
              style={{ marginTop: 12, width: "100%" }}
              disabled={busy}
              onClick={sendMagicLink}
            >
              {magicLoading ? "Sending link…" : "Email me a sign-in link"}
            </button>
          ) : null}
        </form>

        {forgot ? (
          <p>
            <a href="/login">Back to sign in</a>
          </p>
        ) : signup ? (
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        ) : (
          <p>
            New here? <a href="/signup">Create an account</a>
            <br />
            <a href="/forgot-password">Forgot password?</a>
          </p>
        )}
      </div>
    </>
  );
}
