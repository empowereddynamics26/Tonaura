"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatTile } from "@/components/admin/ui";

function gbp(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);
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
  const plans = Object.entries(s?.planBreakdown || {});
  const conversion =
    s?.accounts > 0 ? Math.round(((s.premiumActive || 0) / s.accounts) * 1000) / 10 : 0;

  return (
    <AdminShell title="Insights" subtitle="Simple growth and revenue snapshot from shared data.">
      {error ? <div className="ta-error">{error}</div> : null}
      {s ? (
        <>
          <div className="ta-stats">
            <StatTile label="Est. MRR" value={gbp(s.mrr)} hint={`ARR ${gbp(s.arr)}`} tint="gold" />
            <StatTile label="Premium rate" value={`${conversion}%`} hint="Active / accounts" tint="ok" />
            <StatTile
              label="Signups 7d"
              value={String(s.accountsWeek)}
              hint={`${s.accountsMonth} / 30d`}
              tint="slate"
            />
            <StatTile label="Lifetime" value={String(s.lifetimeCount || 0)} hint="Not in MRR" tint="slate" />
          </div>
          <div className="ta-card">
            <div className="ta-card-head">
              <h2>Plan breakdown</h2>
            </div>
            {plans.length === 0 ? (
              <div className="ta-empty">No active plans.</div>
            ) : (
              <div className="ta-plan-pills">
                {plans.map(([k, n]) => (
                  <div className="ta-plan-pill" key={k} >
                    <b>{n}</b>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : !error ? (
        <div className="ta-muted">Loading…</div>
      ) : null}
    </AdminShell>
  );
}
