import Link from "next/link";
import "./about.css";
export const metadata = {
  title: "About",
  description:
    "Tonaura's mission honest about tradition and evidence, private by default, and built by Empowered Dynamics FZ-LLC.",
  alternates: { canonical: "/about" },
};

/**
 * About — fully redesigned in Phase 4.
 *
 * Structure:
 *   1. Hero — editorial, serif headline, staggered load
 *   2. Three chapters — Why, How, Where (label + heading + body)
 *   3. "Refuse" — a lit moment, centered, with faint concentric rings
 *   4. Three commitments — Honest, Private, Considered (horizontal band)
 *   5. Trust + closing CTA — full-bleed band with diamond divider
 */

const INTRO_CHAPTERS = [
  {
    label: "Why",
    heading: "A gap between awe and evidence.",
    body: "People looking for tone work deserve something quieter than a feed and more honest than a miracle claim. We built Tonaura as a field you enter not a dashboard you manage.",
  },
  {
    label: "How",
    heading: "Tradition named. Research named. Neither sold as the other.",
    body: "Solfeggio practice sits beside entrainment underlays. Each layer earns its place. If something is cultural tradition, we say so. If something draws on auditory research, we say that too.",
  },
  {
    label: "Where",
    heading: "On your device. Offline by default.",
    body: "No ads. No account required to begin. Nothing collected unless you choose to sign in. The mix lives with you not on a server that needs you back tomorrow.",
  },
];

const COMMITMENTS = [
  {
    label: "Honest",
    body: "Tradition and evidence, named as what they are. Never blurred together to sound more impressive.",
  },
  {
    label: "Private",
    body: "Offline by default. No account required. No ads. Nothing collected unless you choose to sign in.",
  },
  {
    label: "Considered",
    body: "The entrainment layer, adaptive suggestions, the practice streak each earns its place.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <header className="about-hero" id="top">
        <p className="about-hero-eyebrow">Our mission</p>
        <h1 className="about-hero-headline">
          Built to help you
          <br />
          be still, on purpose.
        </h1>
        <p className="about-hero-lede">
          The solfeggio and entrainment worlds rarely talk to each other. Mystical apps ignore
          the research; research-driven apps ignore what people actually search for. Tonaura
          holds both clearly labeled, never blurred.
        </p>
        <span className="about-hero-rule" aria-hidden="true" />
      </header>

      {/* Intro chapters — Why, How, Where */}
      <section className="about-chapters">
        {INTRO_CHAPTERS.map((chapter) => (
          <article className="about-chapter reveal" key={chapter.label}>
            <p className="about-chapter-label">{chapter.label}</p>
            <div className="about-chapter-body">
              <h2 className="about-chapter-heading">{chapter.heading}</h2>
              <p className="about-chapter-copy">{chapter.body}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Refuse — the lit moment */}
      <section className="about-refuse">
        <div className="about-refuse-rings" aria-hidden="true">
          <span className="about-refuse-ring about-refuse-ring--1" />
          <span className="about-refuse-ring about-refuse-ring--2" />
          <span className="about-refuse-ring about-refuse-ring--3" />
        </div>
        <div className="about-refuse-inner reveal">
          <p className="about-refuse-eyebrow">Refuse</p>
          <h2 className="about-refuse-headline">
            Three lines
            <br />
            we do not cross.
          </h2>
        </div>
      </section>

      {/* The three commitments */}
      <section className="about-commitments">
        {COMMITMENTS.map((c) => (
          <article className="about-commitment reveal" key={c.label}>
            <p className="about-commitment-label">
              <span className="about-commitment-dot" aria-hidden="true" />
              {c.label}
            </p>
            <p className="about-commitment-body">{c.body}</p>
          </article>
        ))}
      </section>

      {/* Trust + closing CTA */}
      <section className="about-closing">
        <span className="about-closing-diamond" aria-hidden="true" />
        <ul className="about-closing-list">
          <li>No ads</li>
          <li>No account required</li>
          <li>Works fully offline</li>
        </ul>
        <p className="about-closing-note">
          Same email on the website and in the app.
        </p>
        <Link className="about-closing-link" href="/signup">
          Create an account
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}