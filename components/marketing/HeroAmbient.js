"use client";

/**
 * HeroAmbient — everything atmospheric behind the hero content.
 *
 * Layer 1: waveform strip along the bottom edge.
 *
 * The expanding rings have moved into <BrandMark />'s wrapper
 * so they emit from the mark's exact center.
 */
export function HeroAmbient() {
  return (
    <div className="hero-ambient" aria-hidden="true">
      <div className="waveform-strip">
        <div className="waveform-strip-line" />
      </div>
    </div>
  );
}