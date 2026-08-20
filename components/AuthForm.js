"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteNav } from "./SiteNav";

export function AuthForm({ mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";
  const forgot = mode === "forgot";
  const title = signup ? "Create your account" : forgot ? "Reset password" : "Sign in";
  const subtitle = signup
    ? "This is the same account you use in the Tonaura app. Subscribe here, then sign in on your phone."
    : forgot
      ? "We’ll email a reset link. You finish it on this website, then sign in on the app with the new password."
      : "Use the same email as in the app. Premium bought here unlocks there after you sign in.";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    try {
      if (forgot) {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });
        if (err) throw err;
        setNotice("Check your email for the reset link.");
        return;
      }
      if (signup) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=/account` },
        });
        if (err) throw err;
        fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});
        if (!data.session) {
          setNotice("Check your email to confirm this account, then sign in.");
          return;
        }
        window.location.href = "/account";
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") ? next : "/account";
    } catch (err) {
      setError(err.message || "Could not continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteNav />
      <div className="shell">
        <p className="kicker">Tonaura</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <form className="card" onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
          <button type="submit" disabled={loading}>
            {loading ? "Please wait…" : forgot ? "Send reset link" : signup ? "Create account" : "Sign in"}
          </button>
        </form>
        {!forgot ? (
          <button
            className="secondary"
            type="button"
            onClick={async () => {
              setError("");
              const supabase = createClient();
              const { error: err } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
              });
              if (err) setError(err.message);
            }}
          >
            Continue with Google
          </button>
        ) : null}
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
