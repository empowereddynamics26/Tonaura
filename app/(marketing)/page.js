import "./homepage.css";
import Link from "next/link";
import { AmbientPhone } from "@/components/marketing/AmbientPhone";
import { BrandMark } from "@/components/marketing/BrandMark";
import { HeroAmbient } from "@/components/marketing/HeroAmbient";
import { TrustStrip } from "@/components/marketing/TrustStrip";

export const metadata = {
  title: "Tonaura — Solfeggio Tone Therapy",
  description:
    "Pure solfeggio tones in one calm mixer. Practice, Presets, and living Theme Packs.",
  alternates: { canonical: "/" },
};

/**
 * Homepage — migrated from public/index.html.
 *
 * Renders through app/(marketing)/layout.js which provides
 * SiteNav + SiteFooter + CookieModal + PageReveal.
 */

const SESSION_STEPS = [
  {
    num: "01",
    title: "Choose a tone",
    body: "Pick from the classic solfeggio set or blend several into one field.",
  },
  {
    num: "02",
    title: "Shape the mix",
    body: "Balance levels, add a Theme Pack if you want, or load a saved preset.",
  },
  {
    num: "03",
    title: "Stay with it",
    body: "Mark the day in Practice when you showed up. That is the whole streak.",
  },
];

const FREQUENCIES = [
  { hz: 174, name: "ground" },
  { hz: 285, name: "soften" },
  { hz: 396, name: "release" },
  { hz: 417, name: "shift" },
  { hz: 528, name: "return" },
  { hz: 639, name: "connect" },
  { hz: 741, name: "clear" },
  { hz: 852, name: "open" },
  { hz: 963, name: "still" },
];

/**
 * iOS status bar — time, signal, wifi, battery.
 * Rendered once per phone screen.
 */
function PhoneStatusBar() {
  return (
    <div className="phone-status-bar" aria-hidden="true">
      <span className="phone-status-time">9:41</span>
      <span className="phone-status-icons">
        {/* Signal bars */}
        <svg width="19" height="11" viewBox="0 0 19 11" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.6" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" />
        </svg>
        {/* Wi-Fi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 10.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Zm0-4.2c1 0 1.9.4 2.6 1l1.1-1.1A6.4 6.4 0 0 0 8 4.5a6.4 6.4 0 0 0-3.7 1.7l1.1 1.1c.7-.6 1.6-1 2.6-1Zm0-3.2c1.7 0 3.3.7 4.5 1.8L13.6 4A9 9 0 0 0 8 1.6 9 9 0 0 0 2.4 4l1.1 1.1A7 7 0 0 1 8 3.1Z" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor" />
          <path d="M23.5 4v4a1.5 1.5 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}



/**
 * Physical side buttons — Action, volume, power.
 * Live inside .phone-frame, outside .phone-screen.
 */
function PhoneSideButtons() {
  return (
    <>
      <span className="phone-btn-action" aria-hidden="true" />
      <span className="phone-btn-vol-up" aria-hidden="true" />
      <span className="phone-btn-vol-down" aria-hidden="true" />
      <span className="phone-btn-power" aria-hidden="true" />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <header className="hero hero--solo" id="top">
        <HeroAmbient />
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-content">
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
            <a className="btn btn--ghost btn--large" href="#tones">
              <span className="btn-dot" />
              Hear the tones
            </a>
          </div>
        </div>
      </header>

      {/* Field story */}
      <section className="field" id="field">
        <div className="field-grid">
          <div className="field-copy reveal">
            <p className="eyebrow">The field</p>
            <h2 className="field-headline">
              Sound that holds a room,
              <br />
              not a feed.
            </h2>
            <p className="field-lede">
              Layer pure tones, keep a quiet practice streak, and let Theme Packs carry the
              night without noise, streaks of clutter, or a dashboard of distractions.
            </p>
          </div>

          <div className="field-mark" aria-hidden="true">
            <div className="field-mark-inner">
              <img
                src="/images/brand/mark.png"
                alt=""
                className="field-mark-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Session — the ritual */}
      <section className="session" id="how">
        <div className="session-head reveal">
          <p className="eyebrow">A session</p>
          <h2 className="session-headline">
            Three moves.
            <br />
            Then you listen.
          </h2>
        </div>
        <ol className="ritual">
          {SESSION_STEPS.map((step, i) => (
            <li
              key={step.num}
              className={`ritual-step reveal${i > 0 ? ` delay-${i}` : ""}`}
            >
              <span className="ritual-num" aria-hidden="true">
                {step.num}
              </span>
              <div className="ritual-body">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Frequency cards */}
      <section className="tones" id="tones">
        <div className="tones-inner">
          <div className="tones-head reveal">
            <p className="eyebrow">The nine</p>
            <h2>Frequencies you will meet.</h2>
            <p className="lede">Named plainly. Used as sound not sold as medicine.</p>
          </div>
          <ul className="tone-cards" aria-label="Solfeggio frequencies">
            {FREQUENCIES.map((tone, i) => (
              <li
                key={tone.hz}
                className={`tone-card reveal delay-${Math.min(i % 6, 5) + 1}`}
                tabIndex={0}
              >
                <div className="tone-card-inner">
                  <span className="tone-card-hz">{tone.hz}</span>
                  <span className="tone-card-unit">Hz</span>
                  <span className="tone-card-name">{tone.name}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="tones-cta reveal">
            <a href="/signup" className="tones-cta-link">
              Hear the tones
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip />

      {/* What's inside */}
      <section className="inside-wrap" id="inside">
        <div className="story-inner reveal">
          <p className="eyebrow">What&rsquo;s inside</p>
          <h2>
            Built to be used,
            <br />
            not browsed.
          </h2>
          <p className="lede">
            Four views of the app mixer, practice, presets, and living Theme Packs.
          </p>
        </div>
        <div className="showcase-pad">
          <div className="showcase-shelf">
            <div className="showcase-shelf-glow" aria-hidden="true" />
            <div className="showcase-3d">
              {/* Phone 1 — Mixer */}
              <article className="phone-3d phone-3d--1 reveal">
                <div className="phone-3d-inner">
                  <div className="phone-frame">
                    <PhoneSideButtons />
                    <div className="phone-screen">
                      <PhoneStatusBar />
                     
                      <img
                        src="/images/app/mixer.webp?v=6"
                        width="720"
                        height="1280"
                        alt="Tonaura mixer"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
                <div className="phone-3d-reflection" aria-hidden="true">
                  <img
                    src="/images/app/mixer.webp?v=6"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="phone-3d-caption">
                  <h3>The mixer</h3>
                  <p>Ten pure tones in one breathing view.</p>
                </div>
              </article>

              {/* Phone 2 — Practice */}
              <article className="phone-3d phone-3d--2 reveal delay-1">
                <div className="phone-3d-inner">
                  <div className="phone-frame">
                    <PhoneSideButtons />
                    <div className="phone-screen">
                      <PhoneStatusBar />
                    
                      <img
                        src="/images/app/practice.webp?v=6"
                        width="720"
                        height="1280"
                        alt="Tonaura practice streak"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
                <div className="phone-3d-reflection" aria-hidden="true">
                  <img
                    src="/images/app/practice.webp?v=6"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="phone-3d-caption">
                  <h3>Practice</h3>
                  <p>A streak for showing up.</p>
                </div>
              </article>

              {/* Phone 3 — Presets */}
              <article className="phone-3d phone-3d--3 reveal delay-2">
                <div className="phone-3d-inner">
                  <div className="phone-frame">
                    <PhoneSideButtons />
                    <div className="phone-screen">
                      <PhoneStatusBar />
                    
                      <img
                        src="/images/app/presets.webp?v=6"
                        width="720"
                        height="1280"
                        alt="Tonaura presets"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
                <div className="phone-3d-reflection" aria-hidden="true">
                  <img
                    src="/images/app/presets.webp?v=6"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="phone-3d-caption">
                  <h3>Presets</h3>
                  <p>Deep sleep, focus, morning reset.</p>
                </div>
              </article>

              {/* Phone 4 — Theme Packs (AmbientPhone) */}
              <article className="phone-3d phone-3d--4 reveal delay-3">
                <div className="phone-3d-inner">
                  <div className="phone-frame">
                    <PhoneSideButtons />
                    <div className="phone-screen">
                      <PhoneStatusBar />
                    
                      <AmbientPhone />
                    </div>
                  </div>
                </div>
                <div className="phone-3d-reflection" aria-hidden="true">
                  <img
                    src="/images/app/ambients/winter.webp?v=6"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="phone-3d-caption">
                  <h3>Theme Packs</h3>
                  <p>
                    Winter free Autumn, Summer, Rain, and Night sky with Premium.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Interlude — a breath */}
      <section className="interlude" aria-label="Interlude">
        <div className="interlude-rings" aria-hidden="true">
          <span className="interlude-ring interlude-ring--1" />
          <span className="interlude-ring interlude-ring--2" />
          <span className="interlude-ring interlude-ring--3" />
        </div>
        <div className="interlude-inner reveal">
          <p className="interlude-line">
            Sound that asks nothing of&nbsp;you.
          </p>
          <p className="interlude-attribution"> A Listener, London</p>
        </div>
      </section>

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