import Link from "next/link";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import "../checkout.css";

export const metadata = {
  title: "Checkout cancelled — Tonaura",
  description: "No charge was made. You can subscribe whenever you are ready.",
};

export default function CheckoutCancelPage() {
  return (
    <>
      <SiteNav />
      <div className="checkout-shell checkout-shell--quiet">
        <div className="checkout-inner">
          <span className="checkout-diamond checkout-diamond--quiet" aria-hidden="true" />
          <p className="checkout-eyebrow">Checkout</p>
          <h1 className="checkout-headline">No charge</h1>
          <p className="checkout-lede">
            You left before paying. Your free plan is unchanged come back whenever you
            want Premium.
          </p>

          <div className="checkout-actions">
            <Link className="btn btn--primary btn--large" href="/account">
              Choose a plan
            </Link>
            <Link className="btn btn--ghost btn--large" href="/">
              <span className="btn-dot" />
              Return home
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}