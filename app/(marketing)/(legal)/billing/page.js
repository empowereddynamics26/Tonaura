import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Subscription & Billing Policy",
  description:
    "How paid subscriptions, billing, renewals, cancellations, upgrades and refunds work for Tonaura.",
  alternates: { canonical: "/billing" },
};

/**
 * Subscription & Billing Policy — migrated from public/billing.html.
 */

const SECTIONS = [
  { id: "subscription-plans-billing", number: "1.",  label: "Subscription plans" },
  { id: "purchasing-billing",         number: "2.",  label: "Purchasing a subscription" },
  { id: "billing-billing",            number: "3.",  label: "Billing" },
  { id: "auto-renewal-billing",       number: "4.",  label: "Automatic renewal" },
  { id: "free-trial-billing",         number: "5.",  label: "Free trial" },
  { id: "cancellation-billing",       number: "6.",  label: "Cancellation" },
  { id: "refunds-billing",            number: "7.",  label: "Refunds" },
  { id: "price-changes-billing",      number: "8.",  label: "Price changes" },
  { id: "cross-device-billing",       number: "9.",  label: "Restoring purchases on a new device" },
  { id: "contact-billing",            number: "10.", label: "Contact us" },
];

export default function BillingPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Subscription & Billing Policy"
      lead="How paid subscriptions, billing, renewals, cancellations, upgrades and refunds work for Tonaura."
      meta={
        <>
          <span>Effective date: 16 August 2026</span>
          <span>
            <a
              className="inline-link"
              href="https://empowerdynamics.co"
              target="_blank"
              rel="noopener"
            >
              Empowered Dynamics FZ-LLC
            </a>
          </span>
        </>
      }
      tocSections={SECTIONS}
    >
      <section id="subscription-plans-billing">
        <h2><span className="legal-num">1.</span> Subscription plans</h2>
        <p>
          Tonaura Premium is available monthly, yearly, or as a one-time lifetime purchase. A 7-day
          free trial is offered on subscriptions for new Premium users. Current pricing is shown in
          the app and on our <Link className="inline-link" href="/#pricing">pricing page</Link>.
        </p>
      </section>

      <section id="purchasing-billing">
        <h2><span className="legal-num">2.</span> Purchasing a subscription</h2>
        <p>
          Subscriptions and lifetime access are purchased on tonaura.com via Stripe. The Tonaura app
          uses the same signed-in account and does not sell Premium inside the App Store or Google
          Play.
        </p>
      </section>

      <section id="billing-billing">
        <h2><span className="legal-num">3.</span> Billing</h2>
        <p>
          Web purchases via Stripe are billed by Tonaura/Empowered Dynamics FZ-LLC. The app does not
          take payment for Premium.
        </p>
      </section>

      <section id="auto-renewal-billing">
        <h2><span className="legal-num">4.</span> Automatic renewal</h2>
        <p>
          Monthly and yearly subscriptions renew automatically unless cancelled before the end of the
          current period, in line with Stripe subscription behaviour. Cancel from your Tonaura
          account page.
        </p>
      </section>

      <section id="free-trial-billing">
        <h2><span className="legal-num">5.</span> Free trial</h2>
        <p>
          If Stripe shows a free trial on a plan, it converts into a paid subscription unless
          cancelled before it ends. Cancel from your Tonaura account page. The app does not start its
          own trial.
        </p>
      </section>

      <section id="cancellation-billing">
        <h2><span className="legal-num">6.</span> Cancellation</h2>
        <p>
          Cancel anytime from your Tonaura account page (Manage billing). Cancelling stops future
          renewals but does not end access before the current paid period ends.
        </p>
      </section>

      <section id="refunds-billing">
        <h2><span className="legal-num">7.</span> Refunds</h2>
        <p>
          For Stripe purchases, contact{" "}
          <a className="inline-link" href="mailto:billing@tonaura.io">billing@tonaura.io</a> and we'll
          review the request. There are no App Store or Google Play Premium purchases in the current
          product.
        </p>
      </section>

      <section id="price-changes-billing">
        <h2><span className="legal-num">8.</span> Price changes</h2>
        <p>
          If we change subscription pricing, existing subscribers will be notified in advance in
          accordance with Stripe requirements before any change takes effect on their subscription.
        </p>
      </section>

      <section id="cross-device-billing">
        <h2><span className="legal-num">9.</span> Restoring purchases on a new device</h2>
        <p>
          If you're signed in with the same account, Premium syncs to the app automatically. If it
          does not, use Refresh Premium in the app Account screen.
        </p>
      </section>

      <section id="contact-billing">
        <h2><span className="legal-num">10.</span> Contact us</h2>
        <p>
          Billing questions:{" "}
          <a className="inline-link" href="mailto:billing@tonaura.io">billing@tonaura.io</a>
        </p>
      </section>
    </LegalPage>
  );
}