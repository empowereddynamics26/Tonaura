import Link from "next/link";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import "../checkout.css";

export const metadata = {
  title: "You're in — Tonaura Premium",
  description:
    "Payment received. Unlock Premium in the Tonaura app with the same account.",
};

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteNav />
      <div className="checkout-shell">
        <span className="checkout-glow" aria-hidden="true" />
        <div className="checkout-inner">
          <span className="checkout-diamond" aria-hidden="true" />
          <p className="checkout-eyebrow">Premium</p>
          <h1 className="checkout-headline">You&rsquo;re in</h1>
          <p className="checkout-lede">
            Payment received. Your account is unlocking across website and app same
            email, one Premium.
          </p>

          <ol className="checkout-steps">
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
                <p>All tones, looks, Theme Packs, timers, and presets.</p>
              </div>
            </li>
          </ol>

          <div className="checkout-actions">
            <Link className="btn btn--primary btn--large" href="/account">
              Back to account
            </Link>
            <Link className="btn btn--ghost btn--large" href="/">
              <span className="btn-dot" />
              Return home
            </Link>
          </div>

          <p className="checkout-note">
            Receipt is from Stripe. Manage or cancel anytime from Account → Manage billing.
          </p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}