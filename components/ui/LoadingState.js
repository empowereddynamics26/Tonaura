"use client";

import "./LoadingState.css";

/**
 * LoadingState — the Tonaura wave.
 *
 * A horizontal frequency wave that travels continuously — a signal
 * moving through a cable. Rendered as an SVG so the curve stays
 * crisp at any size. Two waves overlap: a primary in the gold→teal
 * brand gradient, and a fainter ghost behind it for depth.
 *
 * By default the loading state covers the entire viewport, hiding
 * nav and footer. Pass `inline` to render it inside a container
 * (a card, a form section) instead.
 *
 * Props:
 *   label   string   — the caption (default: "One moment")
 *   size    "sm" | "md" | "lg" — controls wave width and caption size
 *   inline  boolean  — render inline rather than as a full overlay
 */
export function LoadingState({
  label = "One moment",
  size = "md",
  inline = false,
}) {
  return (
    <div
      className={`loading-state loading-state--${size}${
        inline ? " loading-state--inline" : " loading-state--overlay"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-state-wave" aria-hidden="true">
        <svg
          className="loading-state-wave-svg"
          viewBox="0 0 400 80"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary wave gradient — gold at left, teal at right,
                matching the mark's ring gradient. */}
            <linearGradient id="loadingWaveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(212, 169, 94, 0)" />
              <stop offset="15%" stopColor="rgba(212, 169, 94, 0.55)" />
              <stop offset="50%" stopColor="rgba(212, 169, 94, 0.95)" />
              <stop offset="85%" stopColor="rgba(79, 179, 169, 0.75)" />
              <stop offset="100%" stopColor="rgba(79, 179, 169, 0)" />
            </linearGradient>

            {/* Ghost wave gradient — softer, cooler, for the layer behind */}
            <linearGradient id="loadingWaveGhostGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(79, 179, 169, 0)" />
              <stop offset="50%" stopColor="rgba(79, 179, 169, 0.35)" />
              <stop offset="100%" stopColor="rgba(212, 169, 94, 0)" />
            </linearGradient>
          </defs>

          {/* Ghost wave — sits behind, slightly offset, softer */}
          <path
            className="loading-wave loading-wave--ghost"
            d="M 0,40 Q 50,20 100,40 T 200,40 T 300,40 T 400,40"
            fill="none"
            stroke="url(#loadingWaveGhostGradient)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Primary wave — the main signal */}
          <path
            className="loading-wave loading-wave--primary"
            d="M 0,40 Q 50,20 100,40 T 200,40 T 300,40 T 400,40"
            fill="none"
            stroke="url(#loadingWaveGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {label ? (
        <span className="loading-state-label">{label}</span>
      ) : null}
    </div>
  );
}