import { SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "Checkout cancelled · Tonaura",
  description: "No charge was made. You can subscribe whenever you are ready.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="checkout-scene checkout-scene-quiet">
      <div className="checkout-glow checkout-glow-a" aria-hidden="true" />

      <div className="shell checkout-shell">
        <SiteNav extra={<a href="/account">Account</a>} />

        <div className="checkout-hero">
          <p className="kicker checkout-reveal">Checkout</p>
          <h1 className="checkout-title checkout-reveal" style={{ animationDelay: "0.12s" }}>
            No charge
          </h1>
          <p className="checkout-lead checkout-reveal" style={{ animationDelay: "0.22s" }}>
            You left before paying. Your free plan is unchanged — come back whenever you want Premium.
          </p>
        </div>

        <div className="checkout-actions checkout-reveal" style={{ animationDelay: "0.34s" }}>
          <a className="btn" href="/account">
            Choose a plan
          </a>
          <a className="btn secondary" href="/">
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}
