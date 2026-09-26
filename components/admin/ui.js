"use client";

import Link from "next/link";

/* ==========================================================================
   ICONS — inline SVG, stroke-based, matching the sidebar
   ========================================================================== */

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "pound":
      return (
        <svg {...common}>
          <path d="M18 7c0-2.2-1.8-4-4-4h-3a4 4 0 0 0-4 4v8a4 4 0 0 1-2 3.5h11" />
          <path d="M7 12h8" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "trend-up":
      return (
        <svg {...common}>
          <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
          <path d="M16 7h6v6" />
        </svg>
      );
    case "trend-down":
      return (
        <svg {...common}>
          <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
          <path d="M16 17h6v-6" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="m5 9 3.5 9h7L19 9l-3.5 2.5L12 6l-3.5 5.5L5 9z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export { Icon };

/* ==========================================================================
   STAT TILE
   Two variants:
     variant="hero"    — bigger number, accent border, used once at the top
     variant="default" — compact, three across
   ========================================================================== */

export function StatTile({
  label,
  value,
  hint,
  trend,           // "up" | "down" | null — small indicator next to the value
  tone = "gold",   // "gold" | "teal" | "slate" | "ok"
  variant = "default",
  href,
  icon,
}) {
  const body = (
    <>
      <div className="ta-stat-head">
        <span className={`ta-stat-icon ${tone}`} aria-hidden="true">
          <Icon name={icon} size={variant === "hero" ? 20 : 16} />
        </span>
        <span className="ta-stat-label">{label}</span>
      </div>

      <div className="ta-stat-body">
        <div className={`ta-stat-value ta-stat-value--${variant}`}>{value}</div>
        {trend ? (
          <span className={`ta-stat-trend ta-stat-trend--${trend}`} aria-hidden="true">
            <Icon name={trend === "up" ? "trend-up" : "trend-down"} size={14} />
          </span>
        ) : null}
      </div>

      {hint ? <div className="ta-stat-hint">{hint}</div> : null}
    </>
  );

  const className = `ta-stat ta-stat--${variant}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

/* ==========================================================================
   BADGE
   ========================================================================== */

export function Badge({ children, tone = "default" }) {
  const cls =
    tone === "gold"
      ? "ta-badge ta-badge-gold"
      : tone === "teal"
        ? "ta-badge ta-badge-teal"
        : tone === "ok"
          ? "ta-badge ta-badge-ok"
          : tone === "warn"
            ? "ta-badge ta-badge-warn"
            : tone === "danger"
              ? "ta-badge ta-badge-danger"
              : "ta-badge";
  return <span className={cls}>{children}</span>;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

export function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function shortId(id) {
  if (!id) return "—";
  return `${String(id).slice(0, 8)}…`;
}

export function gbp(n) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(n) || 0);
}