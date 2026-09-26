import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Cookie Policy",
  description:
    "How Tonaura uses cookies and similar technologies on our website, and how to manage your preferences.",
  alternates: { canonical: "/cookies" },
};

/**
 * Cookie Policy — migrated from public/cookies.html.
 */

const SECTIONS = [
  { id: "what-are-cookies",    number: "1.", label: "What are cookies?" },
  { id: "how-we-use-cookies",  number: "2.", label: "How Tonaura uses cookies" },
  { id: "types-of-cookies",    number: "3.", label: "Types of cookies we use" },
  { id: "third-party-cookies", number: "4.", label: "Third-party cookies" },
  { id: "managing-cookies",    number: "5.", label: "Managing your preferences" },
  { id: "contact-cookies",     number: "6.", label: "Contact us" },
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      lead="How Tonaura uses cookies and similar technologies on our website, and how to manage your preferences."
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
      <section id="what-are-cookies">
        <h2><span className="legal-num">1.</span> What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the
          site function and, where you consent, help us understand how the site is used.
        </p>
      </section>

      <section id="how-we-use-cookies">
        <h2><span className="legal-num">2.</span> How Tonaura uses cookies</h2>
        <p>
          Our website (tonaura.com) uses cookies to remember your preferences (like a cookie-consent
          choice) and, only with consent, for privacy-focused analytics. The Tonaura mobile app does
          not use cookies it's a native app, not a web page.
        </p>
      </section>

      <section id="types-of-cookies">
        <h2><span className="legal-num">3.</span> Types of cookies we use</h2>
        <ul>
          <li>
            <strong>Essential</strong>  required for the site to function (e.g. remembering your
            cookie preference). Cannot be disabled.
          </li>
          <li>
            <strong>Analytics</strong>  optional, helps us understand aggregate site usage. Only
            active with your consent.
          </li>
        </ul>
      </section>

      <section id="third-party-cookies">
        <h2><span className="legal-num">4.</span> Third-party cookies</h2>
        <p>
          If you consent to analytics, we may use a privacy-focused analytics provider that sets its
          own cookies. We don't use advertising cookies of any kind Tonaura doesn't carry ads.
        </p>
      </section>

      <section id="managing-cookies">
        <h2><span className="legal-num">5.</span> Managing your preferences</h2>
        <p>
          You can change your cookie preferences at any time using the “Cookie Preferences” link in
          the site footer, or through your browser settings.
        </p>
      </section>

      <section id="contact-cookies">
        <h2><span className="legal-num">6.</span> Contact us</h2>
        <p>
          Questions about this policy:{" "}
          <a className="inline-link" href="mailto:privacy@tonaura.io">privacy@tonaura.io</a>
        </p>
      </section>
    </LegalPage>
  );
}