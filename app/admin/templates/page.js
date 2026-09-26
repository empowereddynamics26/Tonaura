"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatWhen } from "@/components/admin/ui";
import "./templates.css";

const SUBJECT_LIMIT = 60;

/* Which template keys accept which variables. Used for the inline hint. */
const TEMPLATE_VARIABLES = {
  contact_reply: ["{{reply}}"],
};

function relativeTime(iso) {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
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

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [savedSubject, setSavedSubject] = useState("");
  const [savedBodyHtml, setSavedBodyHtml] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/templates");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setTemplates(json.templates || []);
      if (!selected && json.templates?.[0]) pick(json.templates[0]);
    } catch {
      setError(
        "Could not load templates. Apply the admin_console_v2 migration if needed."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  function pick(t) {
    setSelected(t.key);
    setSubject(t.subject || "");
    setBodyHtml(t.body_html || "");
    setSavedSubject(t.subject || "");
    setSavedBodyHtml(t.body_html || "");
    setNotice("");
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Live preview — render the body inside a sandboxed iframe. */
  useEffect(() => {
    const frame = previewRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;

    // Substitute known variables with sample values for the preview.
    let rendered = bodyHtml;
    (TEMPLATE_VARIABLES[selected] || []).forEach((v) => {
      rendered = rendered.split(v).join(`<span class="preview-var">[${v}]</span>`);
    });

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
  .preview-var { color: #f0c878; background: rgba(212,169,94,0.1); padding: 1px 6px; border-radius: 4px; font-size: 0.9em; }
</style></head>
<body>${rendered || "<p style='opacity:0.4'>Empty body</p>"}</body></html>`);
    doc.close();
  }, [bodyHtml, selected]);

  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selected, subject, body_html: bodyHtml }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice("Template saved.");
      setSavedSubject(subject);
      setSavedBodyHtml(bodyHtml);
      await load();
    } catch (e) {
      setError(e.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    setSubject(savedSubject);
    setBodyHtml(savedBodyHtml);
    setNotice("");
    setError("");
  }

  const current = templates.find((t) => t.key === selected);
  const dirty =
    subject !== savedSubject || bodyHtml !== savedBodyHtml;
  const subjectLen = subject.length;
  const subjectTone =
    subjectLen > 80 ? "is-over" : subjectLen > SUBJECT_LIMIT ? "is-warn" : "";
  const variables = TEMPLATE_VARIABLES[selected] || [];

  const sortedTemplates = useMemo(() => templates, [templates]);

  return (
    <AdminShell
      title="Email templates"
      section="Support"
      subtitle="Editable subject and body copy. Brand chrome stays in code."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      <div className="ta-tpl-layout">
        {/* ── Sidebar list of templates ─────────────────────── */}
        <aside className="ta-tpl-sidebar">
          <header className="ta-tpl-sidebar-head">
            <span className="ta-tpl-sidebar-label">Templates</span>
            <span className="ta-tpl-sidebar-count">
              {sortedTemplates.length}
            </span>
          </header>

          {sortedTemplates.length === 0 ? (
            <div className="ta-empty">No templates yet.</div>
          ) : (
            <ul className="ta-tpl-list">
              {sortedTemplates.map((t) => {
                const isActive = selected === t.key;
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      className={`ta-tpl-item${isActive ? " is-active" : ""}`}
                      onClick={() => pick(t)}
                    >
                      <span className="ta-tpl-item-dot" aria-hidden="true" />
                      <span className="ta-tpl-item-copy">
                        <span className="ta-tpl-item-label">
                          {t.label || t.key}
                        </span>
                        <span className="ta-tpl-item-key">{t.key}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ── Editor ─────────────────────────────────────────── */}
        <section className="ta-tpl-editor">
          {current ? (
            <>
              <header className="ta-tpl-editor-head">
                <div>
                  <h2 className="ta-tpl-editor-title">
                    {current.label || current.key}
                  </h2>
                  <p className="ta-tpl-editor-sub">
                    Last edited {relativeTime(current.updated_at)}
                  </p>
                </div>
                {dirty ? (
                  <span className="ta-tpl-unsaved">Unsaved changes</span>
                ) : null}
              </header>

              <div className="ta-tpl-fields">
                {/* Subject */}
                <div className="ta-field">
                  <div className="ta-tpl-label-row">
                    <label className="ta-field-label" htmlFor="tpl-subject">
                      Subject
                    </label>
                    <span className={`ta-bc-charcount ${subjectTone}`}>
                      {subjectLen}/{SUBJECT_LIMIT}
                    </span>
                  </div>
                  <input
                    id="tpl-subject"
                    className="ta-input"
                    type="text"
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

                {/* Body */}
                <div className="ta-field">
                  <label className="ta-field-label" htmlFor="tpl-body">
                    Body (HTML)
                  </label>
                  <textarea
                    id="tpl-body"
                    className="ta-input ta-textarea ta-tpl-body"
                    rows={12}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                  />

                  {variables.length > 0 ? (
                    <div className="ta-tpl-variables">
                      <span className="ta-tpl-variables-label">
                        Available variables
                      </span>
                      <div className="ta-tpl-variables-list">
                        {variables.map((v) => (
                          <code key={v} className="ta-tpl-variable">
                            {v}
                          </code>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="ta-tpl-actions">
                  <button
                    type="button"
                    className="ta-btn ta-btn-ghost"
                    disabled={!dirty || busy}
                    onClick={discard}
                  >
                    Discard changes
                  </button>
                  <button
                    type="button"
                    className="ta-btn ta-btn-gold"
                    disabled={!dirty || busy}
                    onClick={save}
                  >
                    {busy ? "Saving…" : "Save template"}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="ta-tpl-preview">
                <header className="ta-tpl-preview-head">
                  <span className="ta-tpl-preview-label">Preview</span>
                  <span className="ta-tpl-preview-hint">
                    Rendered as the email body.
                  </span>
                </header>
                <div className="ta-tpl-preview-frame">
                  <div className="ta-tpl-preview-subject">
                    <span className="ta-tpl-preview-subject-label">
                      Subject
                    </span>
                    <span className="ta-tpl-preview-subject-value">
                      {subject.trim() || <em>No subject</em>}
                    </span>
                  </div>
                  <iframe
                    ref={previewRef}
                    className="ta-tpl-preview-iframe"
                    title="Template preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="ta-card">
              <div className="ta-empty">
                Select a template from the list to edit it.
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}