/**
 * HeroAmbient — everything atmospheric behind the hero content.
 *
 * Layer 1: waveform strip along the bottom edge.
 *
 * The strip's gradient is painted once on a wide track that slides with a
 * transform (see .waveform-strip-track in homepage.css), so the drift runs
 * on the compositor instead of re-painting every frame.
 *
 * The expanding rings have moved into <BrandMark />'s wrapper
 * so they emit from the mark's exact center.
 *
 * Static markup — no client JS needed.
 */
export function HeroAmbient() {
  return (
    <div className="hero-ambient" aria-hidden="true">
      <div className="waveform-strip">
        <div className="waveform-strip-track">
          <div className="waveform-strip-line" />
          <div className="waveform-strip-glow" />
        </div>
      </div>
    </div>
  );
}
