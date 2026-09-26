import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Health & Wellness Disclaimer",
  description:
    "What's traditional belief and what has research behind it in Tonaura stated plainly, the same way we state it in the app.",
  alternates: { canonical: "/wellness-disclaimer" },
};

/**
 * Health & Wellness Disclaimer — migrated from public/wellness-disclaimer.html.
 */

const SECTIONS = [
  { id: "not-medical-device",         number: "1.", label: "Tonaura is not a medical device" },
  { id: "solfeggio-origin",           number: "2.", label: "Where the solfeggio frequencies come from" },
  { id: "entrainment-evidence",       number: "3.", label: "What does have research behind it" },
  { id: "adaptive-mode-disclaimer",   number: "4.", label: "Adaptive Mode" },
  { id: "individual-results",         number: "5.", label: "Individual results vary" },
  { id: "volume-hearing-safety",      number: "6.", label: "Hearing safety" },
  { id: "questions-disclaimer",       number: "7.", label: "Questions" },
];

export default function WellnessDisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Health & Wellness Disclaimer"
      lead="What's traditional belief and what has research behind it in Tonaura, stated plainly."
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
      <section id="not-medical-device">
        <h2><span className="legal-num">1.</span> Tonaura is not a medical device</h2>
        <p>
          Tonaura is a relaxation and wellness tool. It is not intended to diagnose, treat, cure, or
          prevent any disease or medical condition, and it is not a substitute for professional
          medical or mental health care. If you're experiencing a medical or mental health concern,
          please consult a qualified professional.
        </p>
      </section>

      <section id="solfeggio-origin">
        <h2><span className="legal-num">2.</span> Where the solfeggio frequencies come from</h2>
        <p>
          The nine solfeggio frequencies and their associated meanings (easing tension, liberating
          fear, transformation, and so on) come from a modern reconstruction of an older musical
          tuning tradition, popularized from the 1970s onward. These associations are rooted in
          tradition and belief, not in peer-reviewed clinical research. We include them because many
          people find them meaningful and calming not because we're claiming they're clinically
          proven.
        </p>
      </section>

      <section id="entrainment-evidence">
        <h2><span className="legal-num">3.</span> What does have research behind it</h2>
        <p>
          Tonaura's entrainment layer binaural beats and isochronic tones is based on a real,
          measurable phenomenon called auditory brainwave entrainment, which has genuine (if
          still-developing) scientific literature behind it. Even here, though, individual results
          vary, and entrainment research doesn't support specific medical claims. We built this
          feature because the underlying mechanism is real, not to overstate what it can do for you.
        </p>
      </section>

      <section id="adaptive-mode-disclaimer">
        <h2><span className="legal-num">4.</span> Adaptive Mode</h2>
        <p>
          Adaptive Mode's heart-rate-based suggestions are a convenience feature based on general
          wellness principles, not a diagnostic or medical tool. It should never be relied on for any
          health-related decision.
        </p>
      </section>

      <section id="individual-results">
        <h2><span className="legal-num">5.</span> Individual results vary</h2>
        <p>
          Any wellness practice, including sound-based relaxation, affects people differently. What
          feels calming or grounding to one person may not to another. Listen to your own body and
          stop if something doesn't feel right.
        </p>
      </section>

      <section id="volume-hearing-safety">
        <h2><span className="legal-num">6.</span> Hearing safety</h2>
        <p>
          As with any audio content, avoid prolonged listening at high volumes, particularly with
          headphones, which can risk hearing damage over time. This applies especially to the
          binaural entrainment layer, since headphones are required for it to work as intended.
        </p>
      </section>

      <section id="questions-disclaimer">
        <h2><span className="legal-num">7.</span> Questions</h2>
        <p>
          If anything about how a feature works or what it claims to do is unclear, we'd genuinely
          rather you ask than assume:{" "}
          <a className="inline-link" href="mailto:support@tonaura.io">support@tonaura.io</a>.
        </p>
      </section>
    </LegalPage>
  );
}