"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { premiumFromSources } from "@/lib/premiumAccess";

const PLANS = [
  { key: "monthly", label: "Monthly", price: "£3.99/mo" },
  { key: "yearly", label: "Yearly", price: "£24.99/yr" },
  { key: "lifetime", label: "Lifetime", price: "£39.99 once" },
];

export default function AccountPage() {
  const [user, setUser] = useState(undefined);
  const [entitlement, setEntitlement] = useState(null);
  const [storeEntitlements, setStoreEntitlements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    setUser(data.user || null);
    if (!data.user) return;
    const [entRes, storeRes, profRes] = await Promise.all([
      supabase.from("entitlement_cache").select("*").eq("user_id", data.user.id).maybeSingle(),
      supabase
        .from("store_entitlements")
        .select("is_active,plan_key,expires_at,store")
        .eq("user_id", data.user.id),
      supabase.from("profiles").select("role,display_name").eq("id", data.user.id).maybeSingle(),
    ]);
    setEntitlement(entRes.data);
    setStoreEntitlements(storeRes.error ? [] : storeRes.data || []);
    setProfile(profRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function checkout(priceKey) {
    setError("");
    setLoading(priceKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      window.location.href = json.url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  }

  async function portal() {
    setError("");
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not open billing");
      window.location.href = json.url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function deleteAccount() {
    if (!window.confirm("Delete this Tonaura account? Cancel an active subscription first if you do not want it to renew.")) return;
    setLoading("delete");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not delete");
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  }

  if (user === undefined) {
    return (
      <>
        <SiteNav />
        <div className="shell">
          <p>Loading…</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteNav />
        <div className="shell">
          <p className="kicker">Account</p>
          <h1>Sign in to subscribe</h1>
          <p>Premium is sold here, then unlocked in the app when you sign in with this same email.</p>
          <a className="btn" href="/login">
            Sign in
          </a>
          <a className="btn secondary" href="/signup">
            Create account
          </a>
        </div>
      </>
    );
  }

  const access = premiumFromSources(entitlement, storeEntitlements);
  const premium = access.active;
  const sourceLabel = access.source === "PLAY_STORE" ? "Google Play" : access.source;

  return (
    <>
      <SiteNav extra={<a href="/">Home</a>} />
      <div className="shell">
        <p className="kicker">{premium ? "Premium" : "Free plan"}</p>
        <h1>{user.email}</h1>
        <p>
          This is the account the Tonaura app uses. After you subscribe, open the app, sign in with this email, and tap
          Refresh Premium.
        </p>
        <div className="card">
          {premium ? (
            <>
              <p className="ok">
                Premium is on{access.planKey ? ` · ${access.planKey}` : ""}
                {sourceLabel ? ` · ${sourceLabel}` : ""}
                {access.expiresAt ? ` · renews/ends ${new Date(access.expiresAt).toLocaleDateString()}` : ""}
              </p>
              {access.kind === "stripe" ? (
                <button className="secondary" type="button" onClick={portal} disabled={loading === "portal"}>
                  Manage billing
                </button>
              ) : null}
            </>
          ) : (
            <>
              <p>Choose a plan. You will pay on Stripe, then the app unlocks for this account.</p>
              {PLANS.map((p) => (
                <div className="plan" key={p.key}>
                  <div>
                    <strong>{p.label}</strong>
                    <div className="muted">{p.price}</div>
                  </div>
                  <button type="button" onClick={() => checkout(p.key)} disabled={!!loading}>
                    {loading === p.key ? "Opening…" : "Subscribe"}
                  </button>
                </div>
              ))}
            </>
          )}
          {error ? <p className="error">{error}</p> : null}
        </div>
        {profile?.role === "admin" ? (
          <a className="btn secondary" href="/admin" style={{ marginTop: 12 }}>
            Open admin panel
          </a>
        ) : null}
        <button className="secondary" type="button" onClick={signOut}>
          Sign out
        </button>
        <button className="ghost" type="button" onClick={deleteAccount} disabled={loading === "delete"}>
          Delete account
        </button>
        <p className="muted">
          UK customers: digital content supplied immediately may affect the 14-day cooling-off right. See the{" "}
          <a href="/billing.html">Billing Policy</a>.
        </p>
      </div>
    </>
  );
}
