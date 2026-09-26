import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Data Processing Addendum",
  description:
    "This DPA forms part of the Tonaura Terms of Service for customers who require one for procurement, vendor risk, or data protection compliance purposes.",
  alternates: { canonical: "/dpa" },
};

/**
 * Data Processing Addendum — migrated from public/dpa.html.
 */

const SECTIONS = [
  { id: "definitions-dpa",             number: "1.", label: "Definitions" },
  { id: "scope-dpa",                   number: "2.", label: "Scope" },
  { id: "roles-dpa",                   number: "3.", label: "Roles" },
  { id: "nature-purpose-dpa",          number: "4.", label: "Nature and purpose of processing" },
  { id: "subprocessors-dpa",           number: "5.", label: "Sub-processors" },
  { id: "security-dpa",                number: "6.", label: "Security measures" },
  { id: "international-transfers-dpa", number: "7.", label: "International transfers" },
  { id: "assistance-dpa",              number: "8.", label: "Assistance with data subject requests" },
  { id: "contact-dpa",                 number: "9.", label: "Contact us" },
];

export default function DpaPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Data Processing Addendum"
      lead="This DPA forms part of the Tonaura Terms of Service for customers who require one for procurement, vendor risk, or data protection compliance purposes."
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
      <section id="definitions-dpa">
        <h2><span className="legal-num">1.</span> Definitions</h2>
        <p>
          “Personal Data”, “Processing”, “Controller”, and “Processor” have the meanings given in
          applicable data protection law (including the GDPR, where relevant).
        </p>
      </section>

      <section id="scope-dpa">
        <h2><span className="legal-num">2.</span> Scope</h2>
        <p>
          This addendum applies to Personal Data processed by Tonaura on behalf of a user who has
          created an account, strictly limited to what's described in our{" "}
          <Link className="inline-link" href="/privacy">Privacy Policy</Link>: sign-in identifiers,
          synced presets, streak data, and subscription entitlement status.
        </p>
      </section>

      <section id="roles-dpa">
        <h2><span className="legal-num">3.</span> Roles</h2>
        <p>
          For signed-in users, Tonaura (via Empowered Dynamics FZ-LLC) acts as the data Processor,
          and the individual user is the Controller of their own personal data. For account-free
          (guest) use, no data is processed by us at all.
        </p>
      </section>

      <section id="nature-purpose-dpa">
        <h2><span className="legal-num">4.</span> Nature and purpose of processing</h2>
        <p>
          Processing is limited to enabling cross-device sync of presets and streak, and restoring
          subscription entitlement on a new device.
        </p>
      </section>

      <section id="subprocessors-dpa">
        <h2><span className="legal-num">5.</span> Sub-processors</h2>
        <p>
          We use the following categories of sub-processor: authentication (Supabase) and payment
          processing (Stripe). Each is bound by its own data protection terms.
        </p>
      </section>

      <section id="security-dpa">
        <h2><span className="legal-num">6.</span> Security measures</h2>
        <p>
          Encryption in transit and at rest, access controls, and minimal data collection by design 
          we only store what's strictly necessary for sync and entitlement.
        </p>
      </section>

      <section id="international-transfers-dpa">
        <h2><span className="legal-num">7.</span> International transfers</h2>
        <p>
          Data may be processed outside your country of residence by our sub-processors. Appropriate
          safeguards are used where required by law.
        </p>
      </section>

      <section id="assistance-dpa">
        <h2><span className="legal-num">8.</span> Assistance with data subject requests</h2>
        <p>
          We'll assist users in exercising their rights under applicable law, including access,
          correction, deletion, and portability requests.
        </p>
      </section>

      <section id="contact-dpa">
        <h2><span className="legal-num">9.</span> Contact us</h2>
        <p>
          For DPA-related inquiries:{" "}
          <a className="inline-link" href="mailto:privacy@tonaura.io">privacy@tonaura.io</a>
        </p>
      </section>
    </LegalPage>
  );
}