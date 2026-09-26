import Link from "next/link";
import "./support.css";

export const metadata = {
  title: "Support",
  description:
    "Get help with Tonaura getting started, billing, privacy, and how to reach us.",
  alternates: { canonical: "/support" },
};

/**
 * Support — first migration + Phase 4 redesign.
 *
 * Structure:
 *   1. Editorial hero — serif headline, staggered load, primary CTA
 *   2. Card grid — 6 topics, each with a small icon
 *   3. Closing — a quiet line linking to /contact
 */

const CARDS = [
  {
    title: "Getting started",
    body: "New to Tonaura? Learn what each tone does, how the entrainment layer works, and how to build your first mix.",
    href: "/#inside",
    cta: "See what's inside",
    icon: "compass",
  },
  {
    title: "Subscriptions & billing",
    body: "Managing your plan, restoring purchases on a new device, or requesting a refund.",
    href: "/billing",
    cta: "Billing policy",
    icon: "card",
  },
  {
    title: "Privacy & your data",
    body: "What Tonaura collects (very little), and your options if you've signed in.",
    href: "/privacy",
    cta: "Privacy policy",
    icon: "shield",
  },
  {
    title: "The science, honestly",
    body: "What's traditional belief versus what has research behind it stated plainly.",
    href: "/wellness-disclaimer",
    cta: "Read the disclaimer",
    icon: "atom",
  },
  {
    title: "Report a problem",
    body: "Found a bug, or something not working as expected? Let us know.",
    href: "/contact",
    cta: "Contact us",
    icon: "flag",
  },
  {
    title: "Service status",
    body: "See measurable uptime for the website and sign-in. Systems we cannot measure show Status Unavailable.",
    href: "/status",
    cta: "Open status page",
    icon: "pulse",
  },
];

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="16 8 14 14 8 16 10 10 16 8" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
        </svg>
      );
    case "atom":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M4 21V4" />
          <path d="M4 4h12l-1 3 1 3H4" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...common}>
          <path d="M3 12h4l2-5 4 10 2-5h6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SupportPage() {
  return (
    <>
      <header className="support-hero" id="top">
        <p className="support-hero-eyebrow">We&rsquo;re here to help</p>
        <h1 className="support-hero-headline">
          Get the help
          <br />
          you need.
        </h1>
        <p className="support-hero-lede">
          Find answers below, or reach out directly we typically reply within one business
          day.
        </p>
        <Link className="btn btn--primary btn--large support-hero-cta" href="/contact">
          Contact us
        </Link>
        <span className="support-hero-rule" aria-hidden="true" />
      </header>

      <section className="support-cards-grid">
        {CARDS.map((card) => (
          <article className="support-topic reveal" key={card.title}>
            <span className="support-topic-icon" aria-hidden="true">
              <Icon name={card.icon} />
            </span>
            <h3 className="support-topic-title">{card.title}</h3>
            <p className="support-topic-body">{card.body}</p>
            <Link className="support-topic-link" href={card.href}>
              {card.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>

      <section className="support-closing">
        <p className="support-closing-line">Still not sure?</p>
        <Link className="support-closing-link" href="/contact">
          Contact us
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}