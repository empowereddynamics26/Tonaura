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
  { id: "subscription-plans-billing", number: "1.",  label: "Plans and prices" },
  { id: "purchasing-billing",         number: "2.",  label: "Where you can buy Premium" },
  { id: "billing-billing",            number: "3.",  label: "Who bills you" },
  { id: "auto-renewal-billing",       number: "4.",  label: "Automatic renewal" },
  { id: "free-trial-billing",         number: "5.",  label: "Free trials" },
  { id: "cancellation-billing",       number: "6.",  label: "Managing and cancelling" },
  { id: "refunds-billing",            number: "7.",  label: "Refunds" },
  { id: "price-changes-billing",      number: "8.",  label: "Price changes" },
  { id: "cross-device-billing",       number: "9.",  label: "One account, every device" },
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
          <span>Effective date: 7 October 2026</span>
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
        <h2><span className="legal-num">1.</span> Plans and prices</h2>
        <p>
          Tonaura Premium is available as a monthly subscription (£3.99 per month), a yearly
          subscription (£24.99 per year) or a one-time lifetime purchase (£39.99). Prices are in
          pounds sterling and include VAT where applicable. Google Play may show the equivalent
          price in your local currency. Current pricing is also shown on our{" "}
          <Link className="inline-link" href="/#pricing">pricing page</Link>.
        </p>
      </section>

      <section id="purchasing-billing">
        <h2><span className="legal-num">2.</span> Where you can buy Premium</h2>
        <p>There are two ways to buy Premium. Both unlock the same Premium features on the same Tonaura account.</p>
        <ul>
          <li>
            <strong>On tonaura.com</strong>, paid by card through Stripe.
          </li>
          <li>
            <strong>In the Tonaura Android app</strong>, paid through Google Play billing. You need
            to be signed in to your Tonaura account to buy in the app, so the purchase is linked to
            that account.
          </li>
        </ul>
        <p>
          You only need one. If you already have Premium from one route, you don&rsquo;t need to
          buy it again through the other.
        </p>
      </section>

      <section id="billing-billing">
        <h2><span className="legal-num">3.</span> Who bills you</h2>
        <p>
          Website purchases are billed by Empowered Dynamics FZ-LLC through Stripe. Purchases made
          in the Android app are billed by Google Play under Google Play&rsquo;s terms, using the
          payment method on your Google account.
        </p>
      </section>

      <section id="auto-renewal-billing">
        <h2><span className="legal-num">4.</span> Automatic renewal</h2>
        <p>
          Monthly and yearly subscriptions renew automatically at the end of each period until you
          cancel. Lifetime is a single payment and does not renew.
        </p>
      </section>

      <section id="free-trial-billing">
        <h2><span className="legal-num">5.</span> Free trials</h2>
        <p>
          Tonaura Premium does not currently include a free trial. You&rsquo;re charged when you
          subscribe. If we offer a trial in future, its length and terms will be shown clearly
          before you subscribe.
        </p>
      </section>

      <section id="cancellation-billing">
        <h2><span className="legal-num">6.</span> Managing and cancelling</h2>
        <p>Manage or cancel a subscription where you bought it:</p>
        <ul>
          <li>
            <strong>Website (Stripe):</strong> sign in at tonaura.com, open your account page and
            choose Manage billing.
          </li>
          <li>
            <strong>Google Play:</strong> open the Google Play Store, tap your profile, then
            Payments &amp; subscriptions › Subscriptions › Tonaura. The Tonaura app&rsquo;s Account
            screen also links there. Cancel at least 24 hours before the renewal date to avoid the
            next charge.
          </li>
        </ul>
        <p>
          Cancelling stops future renewals. You keep Premium until the end of the period you&rsquo;ve
          already paid for. Deleting your Tonaura account does not cancel a Google Play
          subscription, so cancel it in Google Play first.
        </p>
      </section>

      <section id="refunds-billing">
        <h2><span className="legal-num">7.</span> Refunds</h2>
        <p>
          <strong>Website (Stripe) purchases:</strong> email{" "}
          <a className="inline-link" href="mailto:billing@tonaura.io">billing@tonaura.io</a> with the
          email address on your account and we&rsquo;ll review your request. This doesn&rsquo;t
          affect your statutory rights.
        </p>
        <p>
          <strong>Google Play purchases:</strong> refunds are handled by Google under Google
          Play&rsquo;s refund policies. You can request one from your Google Play order history or
          through Google Play&rsquo;s help centre. If you need help, contact us and we&rsquo;ll do
          what we can, but we can&rsquo;t issue refunds for Google Play purchases ourselves.
        </p>
        <p>If a purchase is refunded, Premium from that purchase ends.</p>
      </section>

      <section id="price-changes-billing">
        <h2><span className="legal-num">8.</span> Price changes</h2>
        <p>
          If we change subscription prices, existing subscribers will be told in advance, before the
          change applies to their subscription. Google Play subscribers are also notified by Google
          Play in line with its price-change rules.
        </p>
      </section>

      <section id="cross-device-billing">
        <h2><span className="legal-num">9.</span> Restoring purchases on a new device</h2>
        <p>
          Premium belongs to your Tonaura account, not to one device. Sign in with the same account
          on a new phone or after reinstalling and Premium comes back automatically. If it
          doesn&rsquo;t, open the app&rsquo;s Account screen and tap Restore purchases. On Android,
          this also re-checks Google Play purchases made with the Google account on that device.
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