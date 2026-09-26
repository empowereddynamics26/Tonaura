"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatTile } from "@/components/admin/ui";
import "./insights.css";

function gbp(n) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(n) || 0);
}

export default function AdminInsightsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setData(json);
      } catch {
        setError("Could not load insights.");
      }
    })();
  }, []);

  const s = data?.stats;
  const plans = Object.entries(s?.planBreakdown || {}).sort(
    ([, a], [, b]) => Number(b) - Number(a)
  );
  const totalPlans = plans.reduce((sum, [, n]) => sum + Number(n), 0);
  const conversion =
    s?.accounts > 0
      ? Math.round(((s.premiumActive || 0) / s.accounts) * 1000) / 10
      : 0;

  return (
    <AdminShell
      title="Insights"
      section="Overview"
      subtitle="Growth, conversion, and revenue patterns from live data."
    >
      {error ? <div className="ta-error">{error}</div> : null}

      {s ? (
        <div className="ta-insights">
          {/* ── Headline — conversion ──────────────────────────────── */}
          <section className="ta-insight-hero">
            <div className="ta-insight-hero-head">
              <span className="ta-insight-hero-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                </svg>
              </span>
              <span className="ta-insight-hero-label">Premium conversion</span>
            </div>

            <div className="ta-insight-hero-value">
              {conversion}
              <span className="ta-insight-hero-unit">%</span>
            </div>

            <p className="ta-insight-hero-desc">
              {s.premiumActive || 0} of {s.accounts || 0}{" "}
              {s.accounts === 1 ? "account has" : "accounts have"} Premium.
            </p>

            <div
              className="ta-insight-bar"
              role="progressbar"
              aria-valuenow={conversion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Premium conversion rate"
            >
              <span
                className="ta-insight-bar-fill"
                style={{ width: `${Math.min(100, conversion)}%` }}
              />
            </div>
          </section>

          {/* ── Supporting stats ──────────────────────────────────── */}
          <section className="ta-insights-section">
            <header className="ta-insights-section-head">
              <h2>Revenue &amp; growth</h2>
              <p>The numbers behind the conversion figure above.</p>
            </header>

            <div className="ta-stats">
              <StatTile
                label="Estimated MRR"
                value={gbp(s.mrr)}
                hint={`ARR ${gbp(s.arr)}`}
                tone="gold"
                icon="pound"
              />
              <StatTile
                label="Lifetime purchases"
                value={String(s.lifetimeCount || 0)}
                hint="One-time · not in MRR"
                tone="slate"
                icon="crown"
              />
              <StatTile
                label="Signups (30 days)"
                value={String(s.accountsMonth || 0)}
                hint={`+${s.accountsWeek || 0} in the last 7 days`}
                tone="teal"
                icon="trend-up"
              />
            </div>
          </section>

          {/* ── Plan mix ──────────────────────────────────────────── */}
          <section className="ta-insights-section">
            <header className="ta-insights-section-head">
              <h2>Plan mix</h2>
              <p>How Premium subscribers are distributed across plans.</p>
            </header>

            <div className="ta-card">
              {plans.length === 0 ? (
                <div className="ta-empty">No active plans yet.</div>
              ) : (
                <ul className="ta-plan-list">
                  {plans.map(([key, count]) => {
                    const n = Number(count);
                    const pct =
                      totalPlans > 0 ? Math.round((n / totalPlans) * 100) : 0;
                    return (
                      <li className="ta-plan-list-item" key={key}>
                        <span className="ta-plan-list-name">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="ta-plan-list-count">
                          {n}
                          <span className="ta-plan-list-pct">{pct}%</span>
                        </span>
                        <span className="ta-plan-list-bar" aria-hidden="true">
                          <span
                            className="ta-plan-list-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : !error ? (
        <div className="ta-muted">Loading insights…</div>
      ) : null}
    </AdminShell>
  );
}