import { SiteNav } from "@/components/SiteNav";

export default function CheckoutSuccessPage() {
  return (
    <div className="shell">
      <SiteNav extra={<a href="/account">Account</a>} />
      <p className="kicker">Premium</p>
      <h1>You’re in</h1>
      <p>
        Stripe has the payment. Open the Tonaura app, sign in with the same email, and tap Refresh Premium if it is not
        unlocked yet. Webhooks usually catch up within a few seconds.
      </p>
      <a className="btn" href="/account">
        Back to account
      </a>
    </div>
  );
}
