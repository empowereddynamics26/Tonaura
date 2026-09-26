"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, formatWhen } from "@/components/admin/ui";
import "./broadcasts.css";

const SUBJECT_LIMIT = 60;

const SEGMENTS = [
  { id: "all", label: "All accounts", hint: "Every profile with an email." },
  { id: "free", label: "Free", hint: "No entitlement row." },
  { id: "premium", label: "Premium", hint: "Active subscription." },
  { id: "inactive", label: "Inactive / lapsed", hint: "Had Premium, not active." },
];

function toneFor(status) {
  if (status === "sent") return "ok";
  if (status === "failed") return "danger";
  if (status === "sending") return "warn";
  return "default";
}

function relativeTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminBroadcastsPage() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ all: 0, free: 0, premium: 0, inactive: 0 });
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p>Hello from Tonaura.</p>");
  const [segment, setSegment] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const previewRef = useRef(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/broadcasts");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.broadcasts || []);
      if (json.segmentCounts) setCounts(json.segmentCounts);
    } catch {
      setError("Could not load broadcasts.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* Live preview — re-inject HTML into the sandboxed iframe whenever the body changes. */
  useEffect(() => {
    const frame = previewRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  body {
    margin: 0;
    padding: 24px;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    color: #f2ead9;
    background: #0a0a10;
    line-height: 1.6;
    font-size: 14.5px;
  }
  p { margin: 0 0 14px; }
  a { color: #d4a95e; }
  h1, h2, h3 { font-weight: 600; letter-spacing: -0.01em; margin: 0 0 12px; }
  hr { border: 0; border-top: 1px solid rgba(242,234,217,0.12); margin: 20px 0; }
  img { max-width: 100%; height: auto; }
</style></head>
<body>${bodyHtml || "<p style='opacity:0.4'>Empty body</p>"}</body></html>`);
    doc.close();
  }, [bodyHtml]);

  const subjectLen = subject.length;
  const subjectTone =
    subjectLen > 80 ? "is-over" : subjectLen > SUBJECT_LIMIT ? "is-warn" : "";

  const activeSegment = useMemo(
    () => SEGMENTS.find((s) => s.id === segment) || SEGMENTS[0],
    [segment]
  );
  const recipientCount = counts[segment] || 0;

  const canSend =
    subject.trim().length > 0 &&
    bodyHtml.trim().length > 0 &&
    recipientCount > 0 &&
    !busy;

  async function submit(send) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body_html: bodyHtml,
          segment,
          send,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      if (send) {
        setNotice(`Sent to ${json.recipient_count ?? 0} recipients.`);
      } else {
        setNotice("Draft saved.");
      }
      setSubject("");
      setBodyHtml("<p>Hello from Tonaura.</p>");
      setConfirmingSend(false);
      await load();
    } catch (e) {
      setError(e.message || "Could not save broadcast.");
      setConfirmingSend(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell
      title="Broadcasts"
      section="Support"
      subtitle="Send email to segments of your user base."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {/* ══════════ Compose ══════════ */}
      <section className="ta-bc-compose">
        <div className="ta-bc-form">
          {/* Subject */}
          <div className="ta-field">
            <div className="ta-bc-label-row">
              <label className="ta-field-label" htmlFor="bc-subject">
                Subject
              </label>
              <span className={`ta-bc-charcount ${subjectTone}`}>
                {subjectLen}/{SUBJECT_LIMIT}
              </span>
            </div>
            <input
              id="bc-subject"
              className="ta-input"
              type="text"
              placeholder="A short, clear subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
            {subjectLen > SUBJECT_LIMIT ? (
              <p className="ta-field-hint">
                Most email clients truncate around 60 characters.
              </p>
            ) : null}
          </div>

          {/* Segment */}
          <div className="ta-field">
            <label className="ta-field-label" htmlFor="bc-segment">
              Audience
            </label>
            <select
              id="bc-segment"
              className="ta-select"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            >
              {SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {counts[s.id] || 0}{" "}
                  {counts[s.id] === 1 ? "account" : "accounts"}
                </option>
              ))}
            </select>
            <p className="ta-field-hint">{activeSegment.hint}</p>
          </div>

          {/* Body */}
          <div className="ta-field">
            <label className="ta-field-label" htmlFor="bc-body">
              Body (HTML)
            </label>
            <textarea
              id="bc-body"
              className="ta-input ta-textarea ta-bc-body"
              rows={12}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
            />
            <p className="ta-field-hint">
              Simple HTML is fine — <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code>,{" "}
              <code>&lt;strong&gt;</code>. Rendered live on the right.
            </p>
          </div>

          {/* Actions */}
          <div className="ta-bc-actions">
            {confirmingSend ? (
              <div className="ta-bc-confirm">
                <span className="ta-bc-confirm-text">
                  Send <strong>&ldquo;{subject.trim()}&rdquo;</strong> to{" "}
                  <strong>
                    {recipientCount} {recipientCount === 1 ? "account" : "accounts"}
                  </strong>{" "}
                  in <strong>{activeSegment.label}</strong>? This cannot be undone.
                </span>
                <div className="ta-bc-confirm-actions">
                  <button
                    type="button"
                    className="ta-btn ta-btn-ghost"
                    onClick={() => setConfirmingSend(false)}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ta-btn ta-btn-gold"
                    onClick={() => submit(true)}
                    disabled={busy}
                  >
                    {busy ? "Sending…" : "Yes, send now"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="ta-btn ta-btn-ghost"
                  disabled={busy || !subject.trim() || !bodyHtml.trim()}
                  onClick={() => submit(false)}
                >
                  Save draft
                </button>
                <button
                  type="button"
                  className="ta-btn ta-btn-gold"
                  disabled={!canSend}
                  onClick={() => setConfirmingSend(true)}
                >
                  Send to {recipientCount}{" "}
                  {recipientCount === 1 ? "account" : "accounts"} →
                </button>
              </>
            )}
          </div>
        </div>

        {/* ══════════ Preview ══════════ */}
        <aside className="ta-bc-preview">
          <header className="ta-bc-preview-head">
            <span className="ta-bc-preview-label">Preview</span>
            <span className="ta-bc-preview-hint">Rendered as the email will be.</span>
          </header>
          <div className="ta-bc-preview-frame">
            <div className="ta-bc-preview-subject">
              <span className="ta-bc-preview-subject-label">Subject</span>
              <span className="ta-bc-preview-subject-value">
                {subject.trim() || <em>No subject yet</em>}
              </span>
            </div>
           <iframe
  ref={previewRef}
  className="ta-bc-preview-iframe"
  title="Broadcast preview"
  sandbox="allow-same-origin"
/>
          </div>
        </aside>
      </section>

      {/* ══════════ History ══════════ */}
      <section className="ta-bc-history">
        <header className="ta-bc-history-head">
          <h2>History</h2>
          <p>The last {rows.length || 0} broadcasts.</p>
        </header>

        {rows.length === 0 ? (
          <div className="ta-card">
            <div className="ta-empty">No broadcasts yet.</div>
          </div>
        ) : (
          <ul className="ta-bc-list">
            {rows.map((b) => {
              const isOpen = expanded === b.id;
              return (
                <li
                  key={b.id}
                  className={`ta-bc-item${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="ta-bc-item-head"
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="ta-bc-item-main">
                      <span className="ta-bc-item-subject">{b.subject}</span>
                      <span className="ta-bc-item-meta">
                        {b.segment} · {b.recipient_count || 0} recipients ·{" "}
                        {relativeTime(b.sent_at || b.created_at)}
                      </span>
                    </span>
                    <span className="ta-bc-item-end">
                      <Badge tone={toneFor(b.status)}>{b.status}</Badge>
                      <span className="ta-bc-item-chev" aria-hidden="true">
                        {isOpen ? "▴" : "▾"}
                      </span>
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="ta-bc-item-body">
                      <div className="ta-bc-item-meta-grid">
                        <div>
                          <span className="ta-bc-item-meta-label">Segment</span>
                          <span className="ta-bc-item-meta-value">
                            {b.segment}
                          </span>
                        </div>
                        <div>
                          <span className="ta-bc-item-meta-label">Status</span>
                          <span className="ta-bc-item-meta-value">
                            {b.status}
                          </span>
                        </div>
                        <div>
                          <span className="ta-bc-item-meta-label">Recipients</span>
                          <span className="ta-bc-item-meta-value">
                            {b.recipient_count || 0}
                          </span>
                        </div>
                        <div>
                          <span className="ta-bc-item-meta-label">
                            {b.sent_at ? "Sent" : "Created"}
                          </span>
                          <span className="ta-bc-item-meta-value">
                            {formatWhen(b.sent_at || b.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="ta-bc-item-preview">
                        <span className="ta-bc-item-meta-label">
                          Body (as sent)
                        </span>
                        <div
                          className="ta-bc-item-preview-render"
                          dangerouslySetInnerHTML={{ __html: b.body_html }}
                        />
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}