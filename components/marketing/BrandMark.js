"use client";

export function BrandMark({ size = 300, className = "" }) {
  return (
    <div
      className={`brand-mark ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="brand-mark-glow" />
      <div className="brand-mark-glow brand-mark-glow--teal" />

    <svg
  className="brand-mark-rings"
  viewBox="0 0 400 400"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="markGlow" x1="0" y1="400" x2="0" y2="0">
      <stop offset="0%" stopColor="var(--gold-pale)" />
      <stop offset="100%" stopColor="var(--teal-bright)" />
    </linearGradient>
  </defs>

<circle
  cx="200"
  cy="200"
  r="32"
  stroke="url(#markGlow)"
  strokeWidth="2"
  className="brand-mark-ring brand-mark-ring--0"
  strokeDasharray="140.18 60.88"
  strokeDashoffset="-57.24"
/>
<circle
  cx="200"
  cy="200"
  r="32"
  stroke="url(#markGlow)"
  strokeWidth="2"
  className="brand-mark-ring brand-mark-ring--1"
  strokeDasharray="135.72 65.34"
  strokeDashoffset="-54.45"
/>
<circle
  cx="200"
  cy="200"
  r="32"
  stroke="url(#markGlow)"
  strokeWidth="2"
  className="brand-mark-ring brand-mark-ring--2"
  strokeDasharray="152.19 48.87"
  strokeDashoffset="-53.62"
/>
<circle
  cx="200"
  cy="200"
  r="32"
  stroke="url(#markGlow)"
  strokeWidth="2"
  className="brand-mark-ring brand-mark-ring--3"
  strokeDasharray="140.18 60.88"
  strokeDashoffset="-57.24"
/>
</svg>

      <img
        src="/images/brand/mark.png"
        alt=""
        className="brand-mark-img"
        width={size}
        height={size}
      />
    </div>
  );
}