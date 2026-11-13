import "./homepage.css";
import Link from "next/link";
import { BrandMark } from "@/components/marketing/BrandMark";
import { HeroAmbient } from "@/components/marketing/HeroAmbient";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { ToneStory } from "@/components/marketing/story/ToneStory";
import { ToneMixer } from "@/components/marketing/story/ToneMixer";
import { ThemeStory } from "@/components/marketing/story/ThemeStory";
import { AppFan } from "@/components/marketing/story/AppFan";
import { StoryChrome } from "@/components/marketing/story/StoryChrome";
import { HeroListenButton, HeroTilt } from "@/components/marketing/story/HeroBits";
import "./story.css";

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
      {/* Hero */}
      <header className="hero hero--solo" id="top">
        <HeroAmbient />
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-content">
          <HeroTilt>
          <div className="hero-mark-wrap">
  <BrandMark size={190} />

  {/* Rings emit from the mark's exact center — no hardcoded offsets */}
      <svg
        className="hero-waves-svg"
        viewBox="-1000 -1000 2000 2000"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroWaveGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(212, 169, 94, 0.9)" />
            <stop offset="50%" stopColor="rgba(184, 134, 90, 0.75)" />
            <stop offset="100%" stopColor="rgba(79, 179, 169, 0.7)" />
          </linearGradient>
        </defs>
        {[0, 1].map((i) => (
          <circle
            key={i}
            cx="0"
            cy="0"
           r="32"      
            fill="none"
            stroke="url(#heroWaveGradient)"
            className={`hero-wave hero-wave--${i}`}
          />
        ))}
      </svg>
    </div>
          </HeroTilt>
          <p className="hero-eyebrow">Solfeggio Tone Therapy</p>
          <h1 className="hero-headline">
            Nine solfeggio tones.
            <br />
            One place to be still.
          </h1>
          <p className="hero-sub">
            A calm solfeggio mixer with Practice, Presets, and living Theme Packs offline by
            default, honest about what it is.
          </p>
          <div className="hero-cta">
            <Link className="btn btn--primary btn--large" href="/signup">
              Create account
            </Link>
            <HeroListenButton />
          </div>
        </div>
      </header>

      <ToneStory />
      <ToneMixer />
      <ThemeStory />
      <AppFan />
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

  <div className="pricing-grid reveal">
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
  </div>
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