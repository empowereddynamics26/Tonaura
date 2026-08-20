"use client";

import Link from "next/link";

export function StatTile({ label, value, hint, tint = "gold", href, icon }) {
  const body = (
    <>
      <div className={`ta-stat-icon ${tint}`} aria-hidden="true">
        {icon || "•"}
      </div>
      <div>
        <div className="ta-stat-label">{label}</div>
        <div className="ta-stat-value">{value}</div>
        {hint ? <div className="ta-stat-hint">{hint}</div> : null}
      </div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="ta-stat">
        {body}
      </Link>
    );
  }
  return <div className="ta-stat">{body}</div>;
}

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
