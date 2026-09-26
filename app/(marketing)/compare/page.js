import Link from "next/link";
import "./compare.css";

export const metadata = {
  title: "Compare",
  description:
    "An honest comparison of Tonaura with myNoise, Endel, Brain.fm, and typical solfeggio apps where each wins, and where it doesn't.",
  alternates: { canonical: "/compare" },
};

const TABLE_ROWS = [
  {
    label: "Solfeggio tones",
    tonaura: "All 9, plus a bonus deepener",
    mynoise: "Yes, single-slider only",
    endel: "None",
    brainfm: "None",
  },
  {
    label: "Real entrainment (binaural/isochronic)",
    tonaura: "Yes, layered under the tones",
    mynoise: "No",
    endel: "Proprietary, undisclosed method",
    brainfm: "Yes, peer-reviewed research",
  },
  {
    label: "Adaptive to your body",
    tonaura: "Heart-rate suggestions (Premium)",
    mynoise: "No",
    endel: "Yes heart rate, weather, time",
    brainfm: "No",
  },
  {
    label: "Ads",
    tonaura: "None, on either tier",
    mynoise: "Donation-supported",
    endel: "None",
    brainfm: "None",
  },
  {
    label: "Works fully offline",
    tonaura: "Yes",
    mynoise: "No browser only",
    endel: "Partial",
    brainfm: "Partial",
  },
  {
    label: "Price",
    tonaura: "Free tier + £3.99/mo or £39.99 once",
    mynoise: "Free / donation",
    endel: "Subscription only",
    brainfm: "$99.99/yr",
  },
];

const COMPETITORS = [
  {
    name: "myNoise",
    sub: "The long-standing free / donation web tool",
    win: "Free, no account, refreshingly honest in its own way no false claims, just sliders.",
    gap: "Browser-only, so playback stops when your phone locks or the tab loses focus. No real personalization, no entrainment layer, and the interface hasn't meaningfully changed in over a decade.",
  },
  {
    name: "Endel",
    sub: "AI-adaptive soundscapes, Apple Watch App of the Year",
    win: "Genuinely impressive real-time adaptation to your heart rate, the weather, and time of day. The best wearable integration in this category, full stop.",
    gap: "No solfeggio content at all adaptation happens to generic ambient soundscapes, not to tones with any tradition or meaning behind them. Android support lags noticeably behind iOS.",
  },
  {
    name: "Brain.fm",
    sub: "Science-forward functional music",
    win: "Actual peer-reviewed research behind its entrainment method, and a huge, never-repeating track library. If clinical rigor is what you want, this is the most credible option here.",
    gap: "$99.99/year, no solfeggio angle whatsoever, and the experience feels clinical rather than like a ritual there's no warmth to it.",
  },
  {
    name: "Static solfeggio apps",
    sub: "The many cheap / free solfeggio players on both stores",
    win: "Cheap or free, chakra-framed, easy to find, plenty of downloads.",
    gap: "Static tones only, no real entrainment, dated interfaces, and at least one leading example has been flagged in its own store reviews for sharing user data with third parties.",
  },
];

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <header className="compare-hero" id="top">
        <p className="compare-hero-eyebrow">Honest comparison</p>
        <h1 className="compare-hero-headline">How Tonaura compares</h1>
        <p className="compare-hero-lede">
          We&rsquo;re not going to pretend we&rsquo;re the best at everything that&rsquo;s not
          how you actually pick the right app. Here&rsquo;s where each option in this category
          genuinely wins, and where it doesn&rsquo;t.
        </p>
        <span className="compare-hero-rule" aria-hidden="true" />
      </header>

      {/* Table */}
      <section className="compare-table-section">
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th className="you">Tonaura</th>
                <th>myNoise</th>
                <th>Endel</th>
                <th>Brain.fm</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className="you">{row.tonaura}</td>
                  <td>{row.mynoise}</td>
                  <td>{row.endel}</td>
                  <td>{row.brainfm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closer read */}
      <section className="closer" aria-labelledby="closer-heading">
        <header className="closer-head reveal">
          <p className="closer-eyebrow">Deeper read</p>
          <h2 className="closer-headline" id="closer-heading">
            A closer look at each one
          </h2>
          <p className="closer-lede">
            Same honesty principle as everywhere else on this site: what&rsquo;s genuinely good
            about the alternative, stated plainly, not buried.
          </p>
        </header>

        <div className="closer-list">
          {COMPETITORS.map((c) => (
            <article className="closer-item reveal" key={c.name}>
              <div className="closer-identity">
                <h3>{c.name}</h3>
                <p>{c.sub}</p>
              </div>
              <div className="closer-sides">
                <div className="closer-side win">
                  <span className="closer-label">Where it wins</span>
                  <p>{c.win}</p>
                </div>
                <div className="closer-side gap">
                  <span className="closer-label">Where it doesn&rsquo;t</span>
                  <p>{c.gap}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Verdict */}
      <section className="compare-verdict reveal">
        <p className="compare-verdict-line">
          If real entrainment research matters most to you, Brain.fm is the more rigorous
          choice. If wearable integration is what you&rsquo;re after, Endel does it best. If you
          specifically want solfeggio tones done honestly, with a real entrainment layer
          underneath, and without your data going anywhere that&rsquo;s the gap Tonaura was
          built to fill.
        </p>
        <Link className="compare-verdict-cta" href="/#pricing">
          See Tonaura&rsquo;s pricing
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}