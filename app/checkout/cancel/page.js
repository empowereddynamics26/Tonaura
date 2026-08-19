import { SiteNav } from "@/components/SiteNav";

export default function CheckoutCancelPage() {
  return (
    <div className="shell">
      <SiteNav extra={<a href="/account">Account</a>} />
      <p className="kicker">Checkout</p>
      <h1>No charge</h1>
      <p>Checkout was cancelled. You can pick a plan again whenever you are ready.</p>
      <a className="btn" href="/account">
        Back to account
      </a>
    </div>
  );
}
