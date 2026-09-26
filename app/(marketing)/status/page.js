"use client";

import { useCallback, useEffect, useState } from "react";
import "./status.css";

const LABELS = {
  operational: "Operational",
  degraded: "Degraded",
  unavailable: "Status Unavailable",
};

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso || "Unknown";
  }
}

function normalizeStatus(status) {
  return LABELS[status] ? status : "unavailable";
}

const FALLBACK = {
  checkedAt: new Date().toISOString(),
  note: "Status API could not be reached. Showing Status Unavailable rather than inventing green checks.",
  checks: [
    {
      id: "website",
      name: "Website",
      status: "unavailable",
      detail: "Status endpoint did not respond.",
    },
    {
      id: "auth",
      name: "Sign-in & sync",
      status: "unavailable",
      detail: "Not measurable right now.",
    },
    {
      id: "billing",
      name: "Billing (Stripe)",
      status: "unavailable",
      detail: "Not publicly measurable from this page.",
    },
    {
      id: "email",
      name: "Transactional email",
      status: "unavailable",
      detail: "Not publicly measurable from this page.",
    },
  ],
};

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const json = await res.json();
      setData(json);
    } catch {
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checks = data?.checks || [];
  const checkedAt = data?.checkedAt;
  const note = data?.note;

  return (
    <>
      <header className="status-hero" id="top">
        <p className="status-hero-eyebrow">Service status</p>
        <h1 className="status-hero-headline">Tonaura status</h1>
        <p className="status-hero-lede">
          We only mark a system green when it can be measured from here. Everything else shows{" "}
          <strong>Status Unavailable</strong> not assumed healthy.
        </p>
        <span className="status-hero-rule" aria-hidden="true" />
      </header>

      <section className="status-body">
        <div className="status-meta">
          <p className="status-meta-label">
            Last checked
            <strong>
              {loading && !checkedAt ? "Checking…" : formatTime(checkedAt)}
            </strong>
          </p>
        </div>

        <div className="status-panel" aria-live="polite">
          {loading && !checks.length ? (
            <div className="status-row">
              <div className="status-row-text">
                <h2 className="status-row-name">Loading checks</h2>
                <p className="status-row-detail">
                  Fetching the latest measurable signals.
                </p>
              </div>
              <span className="status-badge checking">Checking</span>
            </div>
          ) : checks.length === 0 ? (
            <div className="status-row">
              <div className="status-row-text">
                <h2 className="status-row-name">Status Unavailable</h2>
                <p className="status-row-detail">
                  No measurable checks were returned.
                </p>
              </div>
              <span className="status-badge unavailable">Status Unavailable</span>
            </div>
          ) : (
            checks.map((c) => {
              const st = normalizeStatus(c.status);
              return (
                <div className="status-row" key={c.id}>
                  <div className="status-row-text">
                    <h2 className="status-row-name">{c.name || c.id}</h2>
                    <p className="status-row-detail">{c.detail || "No detail."}</p>
                  </div>
                  <span className={`status-badge ${st}`}>{LABELS[st]}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="status-actions">
          <button
            type="button"
            className={`status-refresh${loading ? " is-loading" : ""}`}
            onClick={load}
            disabled={loading}
          >
            <svg
              className="status-refresh-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            {loading ? "Checking…" : "Check again"}
          </button>
        </div>

        <p className="status-note">
          {note ||
            "Core tone listening in the app works offline. Sign-in, sync, billing, and email depend on online services."}
        </p>
      </section>
    </>
  );
}