"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { WelcomeTransition } from "@/components/account/WelcomeTransition";
import { LoadingState } from "@/components/ui/LoadingState";
import "./account.css";

const PLANS = [
  { key: "monthly", label: "Monthly", price: "£3.99", cadence: "/ month" },
  {
    key: "yearly",
    label: "Yearly",
    price: "£24.99",
    cadence: "/ year",
    badge: "6 months free",
  },
  { key: "lifetime", label: "Lifetime", price: "£39.99", cadence: "once" },
];
export default function AccountPage() {
  const [user, setUser] = useState(undefined);
  const [entitlement, setEntitlement] = useState(null);
  // Google Play Premium (written by the RevenueCat webhook). Separate from the
  // Stripe-owned entitlement_cache; Premium is on if either is active.
  const [storeEntitlements, setStoreEntitlements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(null);
  
  

async function load() {
  const supabase = createClient();

  // Ensure the session has fully hydrated from cookies before any query.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setUser(null);
    return;
  }

  const { data } = await supabase.auth.getUser();
  setUser(data.user || null);
  if (!data.user) return;

const [{ data: ent, error: entErr }, { data: prof, error: profErr }, { data: storeRows }] = await Promise.all([
  supabase.from("entitlement_cache").select("*").eq("user_id", data.user.id).maybeSingle(),
  supabase.from("profiles").select("role, display_name").eq("id", data.user.id).maybeSingle(),
  // Missing table / no rows is fine — treated as no store purchases.
  supabase.from("store_entitlements").select("*").eq("user_id", data.user.id),
]);

if (entErr || profErr) {
  console.error("Account data fetch failed:", { entErr, profErr });
  // Don't show an error to the user — just fall through with null data.
  // The page renders as "Free plan" state, which is a safe default.
}

setEntitlement(ent || null);
setStoreEntitlements(Array.isArray(storeRows) ? storeRows : []);
setProfile(prof || null);
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
  // Clear the welcome flag so the transition greets the next sign-in.
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("tonaura_welcomed");
  }
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/";
}

  async function deleteAccount() {
    if (
      !window.confirm(
        "Delete this Tonaura account? Cancel any active subscription first if you don't want it to renew. Website subscriptions are cancelled here; Google Play subscriptions must be cancelled in the Google Play Store."
      )
    )
      return;
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

  /* ---------- Loading ---------- */
if (user === undefined) {
  return <LoadingState label="One moment" size="lg" />;
}

  /* ---------- Signed out ---------- */
  if (!user) {
    return (
      <div className="account-shell">
        <div className="account-signedout">
          <span className="account-diamond" aria-hidden="true" />
          <p className="account-eyebrow">Account</p>
          <h1 className="account-headline">Sign in to subscribe</h1>
          <p className="account-lede">
            Premium is sold here, then unlocked in the app when you sign in
            with this same email.
          </p>
          <div className="account-signedout-actions">
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
  const isLive = (row) =>
    !!(row && row.is_active) &&
    !(row.expires_at && Date.parse(row.expires_at) < Date.now());
  const webPremium = isLive(entitlement);
  const playRow = storeEntitlements.find((r) => r.store === "PLAY_STORE" && isLive(r)) || null;
  const premium = webPremium || !!playRow;
  // Which record to describe in the header: Stripe first, else Google Play.
  const shown = webPremium ? entitlement : playRow;

  const initial =
    user.email?.[0]?.toUpperCase() ||
    user.user_metadata?.full_name?.[0]?.toUpperCase() ||
    "·";

  const displayName = profile?.display_name || null;

  const planLabel = premium
    ? shown?.plan_key
      ? shown.plan_key.charAt(0).toUpperCase() + shown.plan_key.slice(1)
      : "Premium"
    : "Free plan";
  const renewsOrEnds =
    shown?.expires_at && !webPremium && playRow && playRow.will_renew === false
      ? "Ends"
      : "Renews";

  return (
    <>
      <WelcomeTransition ready={!!entitlement || !!profile} user={user} />

      <div className="account-shell">
        {/* ── Profile header ────────────────────────────────────── */}
        <header className="account-header">
          <div className="account-header-top">
            <span className="account-avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="account-header-copy">
              <h1 className="account-greeting">
                {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
              </h1>
              <p className="account-subline">
                Signed in as <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="account-status">
            <span
              className={`account-status-chip${
                premium ? " account-status-chip--premium" : ""
              }`}
            >
              <span className="account-status-dot" aria-hidden="true" />
              {planLabel}
            </span>
            {premium && shown?.expires_at ? (
              <span className="account-status-meta">
                {renewsOrEnds}{" "}
                {new Date(shown.expires_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ) : null}
          </div>
        </header>

        {/* ── Plan ──────────────────────────────────────────────── */}
        <section className="account-section">
          <p className="account-section-label">Plan</p>

          {premium ? (
            <div className="account-plan-state">
              <div className="account-plan-state-copy">
                <p className="account-plan-state-title">Premium is on</p>
                <p className="account-plan-state-body">
                  {webPremium
                    ? "Billed on this website through Stripe. The app unlocks for this account when you sign in."
                    : "Bought through Google Play in the Tonaura Android app. Manage or cancel it in the Google Play Store."}
                  {webPremium && playRow
                    ? " You also have a Google Play purchase on this account; manage that in the Google Play Store."
                    : ""}
                </p>
              </div>
              {webPremium ? (
           <button
  type="button"
  className="btn btn--primary"
  onClick={portal}
  disabled={loading === "portal"}
>
  {loading === "portal" ? "Opening…" : "Manage billing"}
</button>
              ) : playRow?.expires_at ? (
                <a
                  className="btn btn--primary"
                  href="https://play.google.com/store/account/subscriptions?package=io.tonaura.app"
                  target="_blank"
                  rel="noopener"
                >
                  Manage in Google Play
                </a>
              ) : null}
            </div>
          ) : (
            <>
              <p className="account-plan-state-lede">
                You&rsquo;re on Free. Subscribe once here — the app unlocks
                for this email.
              </p>
              <ul className="account-plan-list">
                {PLANS.map((p) => (
                  <li className="account-plan-row" key={p.key}>
                 <div className="account-plan-row-copy">
  <div className="account-plan-row-title">
    <span className="account-plan-row-name">{p.label}</span>
    {p.badge ? (
      <span className="account-plan-row-badge">{p.badge}</span>
    ) : null}
  </div>
  <span className="account-plan-row-price">
    {p.price}{" "}
    <span className="account-plan-row-cadence">
      {p.cadence}
    </span>
  </span>
</div>
                    <button
                      type="button"
                      className="account-plan-row-cta"
                      onClick={() => checkout(p.key)}
                      disabled={!!loading}
                    >
                      {loading === p.key ? "Opening…" : "Subscribe"}
                      <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* ── Support ───────────────────────────────────────────── */}
        <section className="account-section">
          <p className="account-section-label">Support</p>
          <ul className="account-link-list">
            <li>
              <Link className="account-link-row" href="/contact">
                <span>Contact us</span>
                <span className="account-link-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="account-link-row" href="/support">
                <span>Help centre</span>
                <span className="account-link-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* ── Account ───────────────────────────────────────────── */}
        <section className="account-section">
          <p className="account-section-label">Account</p>
          <ul className="account-link-list">
            {profile?.role === "admin" ? (
              <li>
                <Link className="account-link-row" href="/admin">
                  <span>Open admin panel</span>
                  <span className="account-link-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ) : null}
            <li>
  <Link className="account-link-row" href="/account/settings">
    <span>Settings</span>
    <span className="account-link-arrow" aria-hidden="true">
      →
    </span>
  </Link>
</li>
            <li>
              <button
                type="button"
                className="account-link-row"
                onClick={signOut}
              >
                <span>Sign out</span>
                <span className="account-link-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="account-link-row account-link-row--danger"
                onClick={deleteAccount}
                disabled={loading === "delete"}
              >
                <span>
                  {loading === "delete" ? "Deleting…" : "Delete account"}
                  <span className="account-link-hint">
                    Removes your Tonaura account and data. Active
                    subscriptions must be cancelled first.
                  </span>
                </span>
                <span className="account-link-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          </ul>
        </section>

        {error ? <p className="account-error">{error}</p> : null}

        <p className="account-footnote">
          UK customers: digital content supplied immediately may affect the
          14-day cooling-off right. See the{" "}
          <Link href="/billing">Billing Policy</Link>.
        </p>
      </div>
    </>
  );
}