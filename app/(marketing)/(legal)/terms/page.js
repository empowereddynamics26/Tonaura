import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your access to and use of the Tonaura website, mobile applications and related services.",
  alternates: { canonical: "/terms" },
};

/**
 * Terms of Service — migrated from public/terms.html.
 * Content is identical; markup is now JSX; shell comes from <LegalPage>.
 */

const SECTIONS = [
  { id: "about-tonaura",           number: "1.",  label: "About Tonaura" },
  { id: "eligibility",             number: "2.",  label: "Eligibility" },
  { id: "guest-and-accounts",      number: "3.",  label: "Guest use and accounts" },
  { id: "your-content",            number: "4.",  label: "Your content" },
  { id: "subscription-plans-terms", number: "5.", label: "Subscription plans" },
  { id: "payments-terms",          number: "6.",  label: "Payments" },
  { id: "cancellation-terms",      number: "7.",  label: "Cancellation" },
  { id: "acceptable-use-terms",    number: "8.",  label: "Acceptable use" },
  { id: "no-medical-claims",       number: "9.",  label: "No medical claims" },
  { id: "availability-terms",      number: "10.", label: "Availability" },
  { id: "intellectual-property",   number: "11.", label: "Intellectual property" },
  { id: "third-party-terms",       number: "12.", label: "Third-party services" },
  { id: "privacy-terms",           number: "13.", label: "Privacy" },
  { id: "changes-service",         number: "14.", label: "Changes to the Service" },
  { id: "suspension-termination-terms", number: "15.", label: "Suspension and termination" },
  { id: "disclaimers-terms",       number: "16.", label: "Disclaimers" },
  { id: "limitation-of-liability-terms", number: "17.", label: "Limitation of liability" },
  { id: "governing-law-terms",     number: "18.", label: "Governing law" },
  { id: "changes-terms",           number: "19.", label: "Changes to these Terms" },
  { id: "contact-terms",           number: "20.", label: "Contact us" },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      lead="The terms that govern your access to and use of the Tonaura website, mobile applications and related services."
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
      <section id="about-tonaura">
        <h2><span className="legal-num">1.</span> About Tonaura</h2>
        <p>
          Tonaura is a solfeggio tone mixer and sound-therapy app operated by{" "}
          <a className="inline-link" href="https://empowerdynamics.co" target="_blank" rel="noopener">
            Empowered Dynamics FZ-LLC
          </a>{" "}
          (“Tonaura”, “we”, “our”, or “us”). These Terms of Service (“Terms”) govern your use of the
          Tonaura website, mobile applications, and related services (together, the “Service”).
        </p>
        <p>
          By downloading, installing, or using Tonaura, you agree to these Terms. If you don't agree,
          please don't use the Service.
        </p>
      </section>

      <section id="eligibility">
        <h2><span className="legal-num">2.</span> Eligibility</h2>
        <p>
          You must be at least 16 years old to use Tonaura. By using the Service, you confirm that you
          meet this requirement.
        </p>
      </section>

      <section id="guest-and-accounts">
        <h2><span className="legal-num">3.</span> Guest use and accounts</h2>
        <p>
          Tonaura works fully without an account all core features, your active mix, saved presets,
          and your practice streak are stored locally on your device by default.
        </p>
        <p>
          Creating an account is optional and exists solely to sync presets and your streak across
          devices, and to simplify subscription restoration. If you create an account, you're
          responsible for keeping your credentials secure and for all activity under your account.
        </p>
      </section>

      <section id="your-content">
        <h2><span className="legal-num">4.</span> Your content</h2>
        <p>
          Custom presets you create and name remain yours. You grant us the limited right to store and
          sync this content (if you're signed in) solely to provide the Service. We don't claim
          ownership of your presets or their names.
        </p>
      </section>

      <section id="subscription-plans-terms">
        <h2><span className="legal-num">5.</span> Subscription plans</h2>
        <p>
          Tonaura offers a free tier and a paid Premium tier (monthly, yearly, or lifetime). Premium
          unlocks all tones, the entrainment layer, every look and Theme Pack,
          unlimited saved presets, and the full-length sleep timer. Current pricing is shown in the
          app and on our <Link className="inline-link" href="/#pricing">pricing page</Link>.
        </p>
      </section>

      <section id="payments-terms">
        <h2><span className="legal-num">6.</span> Payments</h2>
        <p>
          Premium can be bought on tonaura.com, billed through Stripe, or in the Tonaura Android app,
          billed through Google Play. Both are linked to your Tonaura account and are subject to our{" "}
          <Link className="inline-link" href="/billing">Subscription &amp; Billing Policy</Link>.
          Google Play purchases are also subject to Google Play&rsquo;s terms.
        </p>
      </section>

      <section id="cancellation-terms">
        <h2><span className="legal-num">7.</span> Cancellation</h2>
        <p>
          You can cancel a subscription at any time: website subscriptions from your Tonaura account
          page, and Google Play subscriptions in the Google Play Store. Cancelling stops
          future renewals; it doesn't retroactively refund the current billing period except where
          required by law.
        </p>
      </section>

      <section id="acceptable-use-terms">
        <h2><span className="legal-num">8.</span> Acceptable use</h2>
        <p>
          Don't use Tonaura to violate any law, infringe anyone's rights, interfere with the Service's
          operation, attempt to reverse-engineer or extract the audio assets for redistribution, or
          misuse the mix-sharing feature to distribute unrelated or harmful content via crafted links.
          See our full <Link className="inline-link" href="/acceptable-use">Acceptable Use Policy</Link>.
        </p>
      </section>

      <section id="no-medical-claims">
        <h2><span className="legal-num">9.</span> No medical claims</h2>
        <p>
          Tonaura is a wellness and relaxation tool, not a medical device, and makes no claim to
          diagnose, treat, cure, or prevent any condition. See our{" "}
          <Link className="inline-link" href="/wellness-disclaimer">Health &amp; Wellness Disclaimer</Link>{" "}
          for the full explanation of what's traditional belief versus what has research behind it.
        </p>
      </section>

      <section id="availability-terms">
        <h2><span className="legal-num">10.</span> Availability</h2>
        <p>
          Tonaura is designed to work fully offline once installed. We don't guarantee the Service
          will always be available, error-free, or uninterrupted for example, sign-in and
          cross-device sync require an internet connection and depend on third-party infrastructure.
        </p>
      </section>

      <section id="intellectual-property">
        <h2><span className="legal-num">11.</span> Intellectual property</h2>
        <p>
          Tonaura's name, logo, audio assets, and app design are owned by Empowered Dynamics FZ-LLC or
          its licensors. You may not copy, modify, or redistribute them outside of normal use of the
          app.
        </p>
      </section>

      <section id="third-party-terms">
        <h2><span className="legal-num">12.</span> Third-party services</h2>
        <p>
          Tonaura relies on third-party providers including Supabase for sign-in and Stripe for web
          purchases. Your use of those features is also subject to those providers' own terms.
        </p>
      </section>

      <section id="privacy-terms">
        <h2><span className="legal-num">13.</span> Privacy</h2>
        <p>
          Our <Link className="inline-link" href="/privacy">Privacy Policy</Link> explains what we
          collect (very little, by design) and how it's used.
        </p>
      </section>

      <section id="changes-service">
        <h2><span className="legal-num">14.</span> Changes to the Service</h2>
        <p>
          We may add, change, or remove features over time, including which tones, looks, or Theme
          Packs are free versus Premium. We'll do our best to communicate significant changes in
          advance.
        </p>
      </section>

      <section id="suspension-termination-terms">
        <h2><span className="legal-num">15.</span> Suspension and termination</h2>
        <p>
          We may suspend or terminate accounts that violate these Terms. You can stop using Tonaura
          and delete your account at any time from account settings.
        </p>
      </section>

      <section id="disclaimers-terms">
        <h2><span className="legal-num">16.</span> Disclaimers</h2>
        <p>
          The Service is provided “as is” without warranties of any kind, to the extent permitted by
          law.
        </p>
      </section>

      <section id="limitation-of-liability-terms">
        <h2><span className="legal-num">17.</span> Limitation of liability</h2>
        <p>
          To the extent permitted by law, Empowered Dynamics FZ-LLC isn't liable for indirect,
          incidental, or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section id="governing-law-terms">
        <h2><span className="legal-num">18.</span> Governing law</h2>
        <p>
          These Terms are governed by the laws applicable in Ras Al Khaimah, United Arab Emirates,
          without regard to conflict-of-law principles, except where local consumer protection law
          requires otherwise.
        </p>
      </section>

      <section id="changes-terms">
        <h2><span className="legal-num">19.</span> Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Significant changes will be communicated
          through the app or website.
        </p>
      </section>

      <section id="contact-terms">
        <h2><span className="legal-num">20.</span> Contact us</h2>
        <p>
          <a className="inline-link" href="https://empowerdynamics.co" target="_blank" rel="noopener">
            Empowered Dynamics FZ-LLC
          </a>
          <br />
          Email: <a className="inline-link" href="mailto:legal@tonaura.io">legal@tonaura.io</a>
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