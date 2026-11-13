import "./homepage.css";
import Link from "next/link";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { ToneMixer } from "@/components/marketing/story/ToneMixer";
import { Descent } from "@/components/marketing/story/Descent";
import { AppFan } from "@/components/marketing/story/AppFan";
import { HowSteps } from "@/components/marketing/story/HowSteps";
import { QuoteReveal } from "@/components/marketing/story/QuoteReveal";
import { CardTilt } from "@/components/marketing/story/CardTilt";
import { StoryChrome } from "@/components/marketing/story/StoryChrome";
import "./story.css";
import "./descent.css";

export const metadata = {
  title: "Tonaura — Solfeggio Tone Therapy",
  description:
    "Pure solfeggio tones in one calm mixer. Practice, Presets, and living Theme Packs.",
  alternates: { canonical: "/" },
};

/**
 * Homepage — hero, then the pinned tone story, a playable mixer, Theme Packs,
 * the app screens, honesty, pricing and sign-up.
 * Renders through app/(marketing)/layout.js (nav, footer, cookies, reveal).
 */

export default function HomePage() {
  return (
    <>
      <StoryChrome />
      <Descent />
      <HowSteps />
      <ToneMixer />
      <AppFan />
      <QuoteReveal />
      <TrustStrip />

      {/* Honest grid */}
      <section className="honest" id="honest">
        <div className="honest-grid">
          <div className="honest-block honest-block--tradition reveal">
            <p className="honest-eyebrow">
              <span className="honest-dot honest-dot--gold" aria-hidden="true" />
              Tradition
            </p>
            <h2 className="honest-heading">Rooted in solfeggio practice.</h2>
            <p className="honest-body">
              Frequencies people have used for focus, rest, and release presented
              plainly, without mystique for sale.
            </p>
          </div>

          <div className="honest-ornament" aria-hidden="true">
            <span className="honest-ornament-line" />
            <span className="honest-diamond" />
            <span className="honest-ornament-line" />
          </div>

          <div className="honest-block honest-block--honesty reveal delay-1">
            <p className="honest-eyebrow">
              <span className="honest-dot honest-dot--teal" aria-hidden="true" />
              Honesty
            </p>
            <h2 className="honest-heading">Not a medical device.</h2>
            <p className="honest-body">
              Tonaura is wellness software. It does not diagnose, treat, or replace care
              from a clinician.
            </p>
          </div>
        </div>
      </section>

    {/* Pricing */}
<section className="pricing" id="pricing">
  <div className="pricing-head reveal">
    <p className="eyebrow">Pricing</p>
    <h2 className="pricing-headline">
      Start free.
      <br />
      Go deeper when ready.
    </h2>
  </div>

  <CardTilt className="pricing-grid reveal">
    {/* Free */}
    <div className="price-card price-card--free">
      <header className="price-card-head">
        <p className="price-card-tag">
          <span className="price-card-tag-dot" aria-hidden="true" />
          Free
        </p>
        <h3 className="price-card-name">The field, quietly</h3>
        <p className="price-card-amount">
          <span className="price-card-currency">£</span>
          <span className="price-card-number">0</span>
        </p>
        <p className="price-card-cadence">forever</p>
      </header>

      <ul className="price-card-features">
        <li>Essential frequencies</li>
        <li>Winter Theme Pack</li>
        <li>Practice streak</li>
      </ul>

      <Link className="btn btn--ghost price-card-cta" href="/signup">
        <span>Create account</span>
        <span className="price-card-cta-arrow" aria-hidden="true">→</span>
      </Link>
    </div>

    {/* Monthly */}
    <div className="price-card price-card--premium">
      <span className="price-card-halo" aria-hidden="true" />

      <header className="price-card-head">
        <p className="price-card-tag">
          <span className="price-card-tag-dot" aria-hidden="true" />
          Monthly
        </p>
        <h3 className="price-card-name">Full field</h3>
        <p className="price-card-amount">
          <span className="price-card-currency">£</span>
          <span className="price-card-number">3.99</span>
        </p>
        <p className="price-card-cadence">per month</p>
      </header>

      <ul className="price-card-features">
        <li>Every solfeggio tone</li>
        <li>All Theme Packs</li>
        <li>Unlimited presets</li>
      </ul>

      <Link className="btn btn--primary price-card-cta" href="/account">
        <span>Subscribe monthly</span>
        <span className="price-card-cta-arrow" aria-hidden="true">→</span>
      </Link>
    </div>

    {/* Yearly — best value */}
    <div className="price-card price-card--premium price-card--featured">
      <span className="price-card-halo" aria-hidden="true" />

      <header className="price-card-head">
        <p className="price-card-tag">
          <span className="price-card-tag-dot" aria-hidden="true" />
          Best value
        </p>
        <h3 className="price-card-name">Full field · Yearly</h3>
        <p className="price-card-amount">
          <span className="price-card-currency">£</span>
          <span className="price-card-number">24.99</span>
        </p>
        <p className="price-card-cadence">per year · saves 48%</p>
      </header>

      <ul className="price-card-features">
        <li>Every solfeggio tone</li>
        <li>All Theme Packs</li>
        <li>Unlimited presets</li>
      </ul>

      <Link className="btn btn--primary price-card-cta" href="/account">
        <span>Subscribe yearly</span>
        <span className="price-card-cta-arrow" aria-hidden="true">→</span>
      </Link>
    </div>

    {/* Lifetime */}
    <div className="price-card price-card--premium">
      <span className="price-card-halo" aria-hidden="true" />

      <header className="price-card-head">
        <p className="price-card-tag">
          <span className="price-card-tag-dot" aria-hidden="true" />
          Lifetime
        </p>
        <h3 className="price-card-name">Full field · Once</h3>
        <p className="price-card-amount">
          <span className="price-card-currency">£</span>
          <span className="price-card-number">39.99</span>
        </p>
        <p className="price-card-cadence">once · yours forever</p>
      </header>

      <ul className="price-card-features">
        <li>Every solfeggio tone</li>
        <li>All Theme Packs</li>
        <li>Unlimited presets</li>
      </ul>

      <Link className="btn btn--primary price-card-cta" href="/account">
        <span>Subscribe once</span>
        <span className="price-card-cta-arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  </CardTilt>
</section>

      {/* Get started */}
      <section className="early" id="start">
        <div className="early-panel reveal">
          <span className="early-ring" aria-hidden="true" />
          <span className="early-glow" aria-hidden="true" />

          <div className="early-inner">
            <p className="early-eyebrow">Get started</p>
            <h2 className="early-headline">
              Create your account
              <br />
              and open the field.
            </h2>
            <p className="early-note">
              Same email on the website and in the app. Premium bought here unlocks there
              after you sign in.
            </p>
            <div className="early-cta">
              <Link className="btn btn--primary btn--large" href="/signup">
                Create account
              </Link>
              <Link className="btn btn--ghost btn--large" href="/login">
                <span className="btn-dot" />
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}