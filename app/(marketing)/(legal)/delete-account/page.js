import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Delete your Tonaura account",
  description: "How to delete your Tonaura account and what happens to your data.",
  alternates: { canonical: "/delete-account" },
};

const SECTIONS = [
  { id: "in-app-delete",   number: "1.", label: "Delete in the Tonaura app" },
  { id: "web-delete",      number: "2.", label: "Delete on tonaura.com" },
  { id: "email-delete",    number: "3.", label: "Ask us by email" },
  { id: "what-is-deleted", number: "4.", label: "What is deleted" },
  { id: "what-is-kept",    number: "5.", label: "What is kept" },
  { id: "subscriptions",   number: "6.", label: "Subscriptions" },
];

export default function DeleteAccountPage() {
  return (
    <LegalPage
      eyebrow="Account"
      title="Delete your Tonaura account"
      lead="Tonaura by Empowered Dynamics FZ-LLC. You can delete your account and its data at any time."
      tocSections={SECTIONS}
    >
      <section id="in-app-delete">
        <h2><span className="legal-num">1.</span> Delete in the Tonaura app</h2>
        <ol>
          <li>Open Tonaura and tap the account icon to open <strong>Account</strong>.</li>
          <li>Scroll down and tap <strong>Delete account</strong>.</li>
          <li>Confirm. You are signed out and your account is deleted straight away.</li>
        </ol>
      </section>

      <section id="web-delete">
        <h2><span className="legal-num">2.</span> Delete on tonaura.com</h2>
        <ol>
          <li>Sign in at <Link className="inline-link" href="/login">tonaura.com/login</Link>.</li>
          <li>Open your <Link className="inline-link" href="/account">account page</Link>.</li>
          <li>Choose <strong>Delete account</strong> and confirm.</li>
        </ol>
      </section>

      <section id="email-delete">
        <h2><span className="legal-num">3.</span> Ask us by email</h2>
        <p>
          If you can't sign in, email{" "}
          <a className="inline-link" href="mailto:privacy@tonaura.io">privacy@tonaura.io</a> from the
          address on your account and ask us to delete it. We'll confirm once it's done.
        </p>
      </section>

      <section id="what-is-deleted">
        <h2><span className="legal-num">4.</span> What is deleted</h2>
        <p>Deleting your account permanently removes:</p>
        <ul>
          <li>your account (name, email address and sign-in details)</li>
          <li>your synced presets and practice history</li>
          <li>your Premium status records held by Tonaura</li>
        </ul>
        <p>
          Mixes and settings stored only on your device stay on that device until you uninstall the
          app.
        </p>
      </section>

      <section id="what-is-kept">
        <h2><span className="legal-num">5.</span> What is kept</h2>
        <p>
          We keep only what we are legally required to keep, such as records of payments for tax
          and accounting, for as long as the law requires. Payment records held by Stripe or Google
          Play, and purchase records held by RevenueCat for verifying Google Play purchases, are kept
          by those providers under their own retention policies.
        </p>
      </section>

      <section id="subscriptions">
        <h2><span className="legal-num">6.</span> Subscriptions</h2>
        <p>
          Deleting your account cancels a website (Stripe) subscription. It does{" "}
          <strong>not</strong> cancel a Google Play subscription: cancel that first in the Google Play
          Store under Payments &amp; subscriptions › Subscriptions. See our{" "}
          <Link className="inline-link" href="/billing">Subscription &amp; Billing Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
