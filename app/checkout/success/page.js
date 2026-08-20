import { SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "You’re in · Tonaura Premium",
  description: "Payment received. Unlock Premium in the Tonaura app with the same account.",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="checkout-scene">
      <div className="checkout-glow checkout-glow-a" aria-hidden="true" />
      <div className="checkout-glow checkout-glow-b" aria-hidden="true" />
      <div className="checkout-ring" aria-hidden="true" />

      <SiteNav extra={<a href="/account">Account</a>} />

      <div className="shell checkout-shell">
        <div className="checkout-hero">
          <p className="kicker checkout-reveal" style={{ animationDelay: "0.05s" }}>
            Premium
          </p>
          <h1 className="checkout-title checkout-reveal" style={{ animationDelay: "0.14s" }}>
            You’re in
          </h1>
          <p className="checkout-lead checkout-reveal" style={{ animationDelay: "0.24s" }}>
            Payment received. Your account is unlocking across website and app — same email, one Premium.
          </p>
        </div>

        <ol className="checkout-steps checkout-reveal" style={{ animationDelay: "0.36s" }}>
          <li>
            <span className="checkout-step-num">1</span>
            <div>
              <strong>Open the Tonaura app</strong>
              <p>Sign in with the same email you used here.</p>
            </div>
          </li>
          <li>
            <span className="checkout-step-num">2</span>
            <div>
              <strong>Tap Refresh Premium</strong>
              <p>Usually ready within a few seconds after payment.</p>
            </div>
          </li>
          <li>
            <span className="checkout-step-num">3</span>
            <div>
              <strong>Listen with everything unlocked</strong>
              <p>All tones, themes, ambience, timers, and presets.</p>
            </div>
          </li>
        </ol>

        <div className="checkout-actions checkout-reveal" style={{ animationDelay: "0.48s" }}>
          <a className="btn" href="/account">
            Back to account
          </a>
          <a className="btn secondary" href="/">
            Return home
          </a>
        </div>

        <p className="checkout-note checkout-reveal" style={{ animationDelay: "0.58s" }}>
          Receipt is from Stripe. Manage or cancel anytime from Account → Manage billing.
        </p>
      </div>
    </div>
  );
}
