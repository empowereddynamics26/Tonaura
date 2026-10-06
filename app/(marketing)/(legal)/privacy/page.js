import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Tonaura collects, uses, protects and shares your information and the rights you have over it.",
  alternates: { canonical: "/privacy" },
};

/**
 * Privacy Policy — migrated from public/privacy.html.
 */

const SECTIONS = [
  { id: "introduction",                number: "1.",  label: "Introduction" },
  { id: "information-we-collect",      number: "2.",  label: "Information we collect" },
  { id: "information-we-do-not-collect", number: "3.", label: "Information we do not collect" },
  { id: "adaptive-mode-privacy",       number: "4.",  label: "Suggestions" },
  { id: "how-we-use",                  number: "5.",  label: "How we use your information" },
  { id: "encryption-security-privacy", number: "6.",  label: "Encryption and security" },
  { id: "cookies-privacy",             number: "7.",  label: "Cookies" },
  { id: "payments-privacy",            number: "8.",  label: "Payments" },
  { id: "third-party-privacy",         number: "9.",  label: "Third-party services" },
  { id: "data-sharing-privacy",        number: "10.", label: "Data sharing" },
  { id: "data-retention-privacy",      number: "11.", label: "Data retention" },
  { id: "your-rights-privacy",         number: "12.", label: "Your rights" },
  { id: "childrens-privacy",           number: "13.", label: "Children's privacy" },
  { id: "changes-privacy",             number: "14.", label: "Changes to this policy" },
  { id: "contact-privacy",             number: "15.", label: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lead="How Tonaura collects, uses, protects and shares your information and the rights you have over it."
      meta={
        <>
          <span>Effective date: [PUBLICATION DATE — set when this goes live]</span>
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
      <section id="introduction">
        <h2><span className="legal-num">1.</span> Introduction</h2>
        <p>
          Welcome to Tonaura. Tonaura is operated by{" "}
          <a className="inline-link" href="https://empowerdynamics.co" target="_blank" rel="noopener">
            Empowered Dynamics FZ-LLC
          </a>{" "}
          (“Tonaura”, “we”, “our”, or “us”).
        </p>
        <p>
          Tonaura was built with a specific promise: it works fully offline, and by default nothing
          about your listening leaves your device. This policy explains exactly what we collect (very
          little), why, and what your options are.
        </p>
        <p>By using Tonaura, you agree to this Privacy Policy.</p>
      </section>

      <section id="information-we-collect">
        <h2><span className="legal-num">2.</span> Information we collect</h2>
        <p>
          If you never sign in, we don't collect anything your mix, presets, and practice streak
          live only in local storage on your device.
        </p>
        <p>
          <strong>If you choose to sign in</strong> (Apple, Google, or email entirely optional), we
          store:
        </p>
        <ul>
          <li>Name and email address (or the minimal identifier your sign-in provider gives us)</li>
          <li>Your saved presets and practice streak, so they can sync across your devices</li>
          <li>Subscription/entitlement status, to restore Premium access on a new device</li>
        </ul>
        <p>
          <strong>Website information</strong>  when you visit tonaura.com, we may collect IP address,
          browser type, and pages visited, only if you consent to analytics cookies. See our{" "}
          <Link className="inline-link" href="/cookies">Cookie Policy</Link>.
        </p>
      </section>

      <section id="information-we-do-not-collect">
        <h2><span className="legal-num">3.</span> Information we do not collect</h2>
        <p>Tonaura does not collect:</p>
        <ul>
          <li>Analytics or usage tracking inside the app itself</li>
          <li>Microphone or camera data</li>
          <li>Precise GPS location</li>
          <li>Advertising identifiers we don't show ads, on either the free or paid tier</li>
          <li>Health or heart-rate data</li>
        </ul>
      </section>

      <section id="adaptive-mode-privacy">
        <h2><span className="legal-num">4.</span> Suggestions</h2>
        <p>
          Suggestions is an optional Premium feature that proposes a blend based on the time of day
          and your recent listening on this device. It works entirely on your device, does not use
          health or heart-rate data, and sends nothing to our servers. You can turn it off at any
          time in Account settings.
        </p>
      </section>

      <section id="how-we-use">
        <h2><span className="legal-num">5.</span> How we use your information</h2>
        <p>
          If you're signed in, we use your information to sync presets and streak across devices,
          restore your subscription on a new device, and provide customer support if you contact us.
          That's the complete list we don't use it for advertising or sell it to anyone.
        </p>
      </section>

      <section id="encryption-security-privacy">
        <h2><span className="legal-num">6.</span> Encryption and security</h2>
        <p>
          Where we do store account data, we use industry-standard safeguards including encryption in
          transit and at rest, and secure authentication through our sign-in provider. No internet
          service can guarantee absolute security, but we design for the smallest possible footprint
          precisely to limit what could ever be at risk.
        </p>
      </section>

      <section id="cookies-privacy">
        <h2><span className="legal-num">7.</span> Cookies</h2>
        <p>
          Our website uses cookies only where necessary for functionality, and optionally for
          privacy-focused analytics if you consent. See our{" "}
          <Link className="inline-link" href="/cookies">Cookie Policy</Link> for full details and how to
          manage preferences.
        </p>
      </section>

      <section id="payments-privacy">
        <h2><span className="legal-num">8.</span> Payments</h2>
        <p>
          Premium can be bought on tonaura.com, where payment is processed by Stripe, or in the
          Tonaura Android app, where payment is processed by Google Play. Tonaura never sees or
          stores your full payment card details; these are handled by Stripe or Google under their
          own privacy policies. For in-app purchases, we receive a purchase record (product, purchase
          and expiry dates, and an order identifier) so we can unlock and restore Premium for your
          account.
        </p>
      </section>

      <section id="third-party-privacy">
        <h2><span className="legal-num">9.</span> Third-party services</h2>
        <p>
          Tonaura relies on: <strong>Supabase</strong> for optional sign-in and account data;{" "}
          <strong>Stripe</strong> for web purchases; <strong>Google Play</strong> for in-app purchases
          on Android; and <strong>RevenueCat</strong>, which verifies Google Play purchases and keeps
          Premium status in sync. RevenueCat receives your Tonaura account ID and your Google Play
          purchase records, but not your name, email address or card details. Each provider processes
          information only as necessary to provide its service, under its own privacy policy.
        </p>
      </section>

      <section id="data-sharing-privacy">
        <h2><span className="legal-num">10.</span> Data sharing</h2>
        <p>
          We do not sell your personal information. We only share it with the service providers listed
          above, when required by law, or during a business transfer.
        </p>
      </section>

      <section id="data-retention-privacy">
        <h2><span className="legal-num">11.</span> Data retention</h2>
        <p>
          If you delete your account, we delete your synced presets, streak, and account information
          within a reasonable period, except where we're legally required to retain certain records.
        </p>
      </section>

      <section id="your-rights-privacy">
        <h2><span className="legal-num">12.</span> Your rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, delete, or export your
          information, and to object to certain processing. Contact us using the details below to
          exercise these rights.
        </p>
      </section>

      <section id="childrens-privacy">
        <h2><span className="legal-num">13.</span> Children's privacy</h2>
        <p>
          Tonaura is not intended for children under 16. We do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section id="changes-privacy">
        <h2><span className="legal-num">14.</span> Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Significant changes will be communicated
          through the app or website.
        </p>
      </section>

      <section id="contact-privacy">
        <h2><span className="legal-num">15.</span> Contact us</h2>
        <p>
          <a className="inline-link" href="https://empowerdynamics.co" target="_blank" rel="noopener">
            Empowered Dynamics FZ-LLC
          </a>
          <br />
          Email: <a className="inline-link" href="mailto:privacy@tonaura.io">privacy@tonaura.io</a>
          <br />
          Website:{" "}
          <a className="inline-link" href="https://tonaura.com" target="_blank" rel="noopener">
            https://tonaura.com
          </a>
        </p>
      </section>
    </LegalPage>
  );
}