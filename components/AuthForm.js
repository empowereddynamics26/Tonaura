"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

function oauthHelp(provider, message) {
  const raw = String(message || "");
  if (/not enabled|unsupported provider|validation_failed/i.test(raw)) {
    return "Google sign-in is not enabled yet. In Supabase, go to Authentication → Providers → Google and paste your OAuth credentials.";
  }
  return raw || "Google sign-in failed. Try again or use email.";
}

export function AuthForm({ mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const signup = mode === "signup";
  const forgot = mode === "forgot";

  const eyebrow = forgot ? "Password reset" : signup ? "Welcome" : "Welcome back";
  const title = signup ? "Create your account" : forgot ? "Reset password" : "Sign in";
  const subtitle = signup
    ? "One account for the website and the app. Subscribe here, sign in there."
    : forgot
      ? "We'll email you a reset link. Finish it here, then sign in on the app."
      : "Use the same email as in the app. Premium bought here unlocks there after you sign in.";

  /* ---- URL-driven messages (cancelled / error from OAuth callback) ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      setNotice("Sign-in was cancelled.");
      return;
    }
    const fromUrl = params.get("error");
    if (fromUrl) setError(decodeURIComponent(fromUrl.replace(/\+/g, " ")));
  }, []);

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
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });
      if (err) throw err;
      if (!data?.url) throw new Error("Google sign-in is not available.");

      try {
        const probe = await fetch(data.url, {
          method: "GET",
          redirect: "manual",
          mode: "cors",
        });
        if (probe.type !== "opaque" && probe.status >= 400) {
          const body = await probe.text();
          if (/not enabled|unsupported provider|validation_failed/i.test(body)) {
            throw new Error(body);
          }
        }
      } catch (probeErr) {
        if (
          /not enabled|unsupported provider|validation_failed/i.test(
            String(probeErr?.message || "")
          )
        ) {
          throw probeErr;
        }
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(oauthHelp(provider, err?.message));
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
    <div className="auth-card">
      <div className="auth-card-head">
        <span className="auth-card-diamond" aria-hidden="true" />
        <img
          className="auth-card-mark"
          src="/images/brand/mark.png"
          alt=""
          width="64"
          height="64"
        />
        <p className="auth-card-eyebrow">{eyebrow}</p>
        <h1 className="auth-card-title">{title}</h1>
        <p className="auth-card-subtitle">{subtitle}</p>
      </div>

      {!forgot ? (
        <>
          <div className="auth-oauth">
            <button
              type="button"
              className="auth-oauth-btn"
              disabled={busy}
              onClick={() => startOAuth("google")}
            >
              <span className="auth-oauth-icon" aria-hidden="true">
                <GoogleIcon />
              </span>
              {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
          <div className="auth-oauth-divider">or use email</div>
        </>
      ) : null}

      <form className="auth-form" onSubmit={onSubmit}>
        <div
          className={`auth-field${focused === "email" ? " is-focused" : ""}${
            email ? " has-value" : ""
          }`}
        >
          <label className="auth-field-label" htmlFor="email">
            Email address
          </label>
          <input
            className="auth-field-input"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
          />
          <span className="auth-field-underline" aria-hidden="true" />
        </div>

        {!forgot ? (
          <div
            className={`auth-field${focused === "password" ? " is-focused" : ""}${
              password ? " has-value" : ""
            }`}
          >
            <label className="auth-field-label" htmlFor="password">
              Password
            </label>
            <input
              className="auth-field-input"
              id="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
            />
            <span className="auth-field-underline" aria-hidden="true" />
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary btn--large auth-submit"
          disabled={busy}
        >
          {loading
            ? "Please wait…"
            : forgot
              ? "Send reset link"
              : signup
                ? "Create account"
                : "Sign in"}
        </button>

        {!forgot && !signup ? (
          <button
            type="button"
            className="auth-magic"
            disabled={busy}
            onClick={sendMagicLink}
          >
            {magicLoading ? "Sending link…" : "Email me a sign-in link instead"}
          </button>
        ) : null}

        {error ? (
          <p className="auth-notice auth-notice--error">{error}</p>
        ) : null}
        {notice ? (
          <p className="auth-notice auth-notice--ok">{notice}</p>
        ) : null}
      </form>

      <div className="auth-aside">
        {forgot ? (
          <p className="auth-aside-line">
            <Link href="/login">Back to sign in</Link>
          </p>
        ) : signup ? (
          <p className="auth-aside-line">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        ) : (
          <>
            <p className="auth-aside-line">
              New here? <Link href="/signup">Create an account</Link>
            </p>
            <p className="auth-aside-line">
              <Link href="/forgot-password">Forgot password?</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}