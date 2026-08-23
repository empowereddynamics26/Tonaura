"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/ui";

export default function AdminHealthPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/health");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setData(json);
      } catch {
        setError("Could not load health.");
      }
    })();
  }, []);

  return (
    <AdminShell title="System health" subtitle="Env checks, mail, Stripe, and feature flags.">
      {error ? <div className="ta-error">{error}</div> : null}
      {!data && !error ? <div className="ta-muted">Checking…</div> : null}
      {data ? (
        <>
          <p style={{ marginBottom: 16 }}>
            Status:{" "}
            <Badge tone={data.healthy ? "ok" : "warn"}>{data.healthy ? "healthy" : "attention"}</Badge>
            <span className="ta-muted"> · {data.generatedAt || ""}</span>
          </p>
          <div className="ta-card">
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>OK</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.checks || []).map((c) => (
                    <tr key={c.key}>
                      <td>{c.key}</td>
                      <td>
                        <Badge tone={c.ok ? "ok" : "warn"}>{c.ok ? "yes" : "no"}</Badge>
                      </td>
                      <td className="ta-muted">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="ta-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Live flags</h3>
            <div className="ta-plan-pills">
              {Object.entries(data.flags || {}).map(([k, v]) => (
                <div className="ta-plan-pill" key={k}>
                  <b>{v ? "on" : "off"}</b>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
