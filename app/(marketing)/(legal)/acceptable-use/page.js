import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Acceptable Use Policy",
  description:
    "The rules that apply when you use the Tonaura website, mobile applications and related services.",
  alternates: { canonical: "/acceptable-use" },
};

/**
 * Acceptable Use Policy — migrated from public/acceptable-use.html.
 */

const SECTIONS = [
  { id: "our-purpose",               number: "1.", label: "Our purpose" },
  { id: "account-responsibility-aup", number: "2.", label: "You're responsible for your account" },
  { id: "lawful-use",                number: "3.", label: "Lawful use" },
  { id: "prohibited-conduct",        number: "4.", label: "Prohibited conduct" },
  { id: "shared-mixes",              number: "5.", label: "Mix-sharing links" },
  { id: "enforcement-aup",           number: "6.", label: "Enforcement" },
  { id: "reporting-aup",             number: "7.", label: "Reporting a concern" },
];

export default function AcceptableUsePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Acceptable Use Policy"
      lead="The rules that apply when you use the Tonaura website, mobile applications and related services."
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
      <section id="our-purpose">
        <h2><span className="legal-num">1.</span> Our purpose</h2>
        <p>
          Tonaura exists to help people relax, focus, and wind down through sound. This policy exists
          to keep that experience good for everyone.
        </p>
      </section>

      <section id="account-responsibility-aup">
        <h2><span className="legal-num">2.</span> You're responsible for your account</h2>
        <p>
          If you create an account, you're responsible for keeping your credentials secure and for
          activity under your account.
        </p>
      </section>

      <section id="lawful-use">
        <h2><span className="legal-num">3.</span> Lawful use</h2>
        <p>
          You agree to use Tonaura only for lawful purposes and in line with these guidelines.
        </p>
      </section>

      <section id="prohibited-conduct">
        <h2><span className="legal-num">4.</span> Prohibited conduct</h2>
        <ul>
          <li>
            Attempting to reverse-engineer, decompile, or extract Tonaura's audio assets for
            redistribution or resale
          </li>
          <li>
            Using automated tools to abuse the mix-sharing link feature (e.g. spam, scraping)
          </li>
          <li>
            Attempting to bypass subscription/paywall gating through unauthorized means
          </li>
          <li>
            Interfering with the Service's normal operation, including through denial-of-service
            attempts
          </li>
          <li>
            Impersonating any person or entity, or misrepresenting your affiliation
          </li>
        </ul>
      </section>

      <section id="shared-mixes">
        <h2><span className="legal-num">5.</span> Mix-sharing links</h2>
        <p>
          The mix-sharing feature is meant for sharing tone blends with other Tonaura users. Don't
          use it to encode or distribute content unrelated to that purpose.
        </p>
      </section>

      <section id="enforcement-aup">
        <h2><span className="legal-num">6.</span> Enforcement</h2>
        <p>
          We may suspend or terminate access for violations of this policy, at our discretion, with
          or without notice depending on severity.
        </p>
      </section>

      <section id="reporting-aup">
        <h2><span className="legal-num">7.</span> Reporting a concern</h2>
        <p>
          If you believe someone is misusing Tonaura, contact us at{" "}
          <a className="inline-link" href="mailto:support@tonaura.io">support@tonaura.io</a>.
        </p>
      </section>
    </LegalPage>
  );
}