"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatWhen } from "@/components/admin/ui";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/templates");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setTemplates(json.templates || []);
      if (!selected && json.templates?.[0]) pick(json.templates[0]);
    } catch {
      setError("Could not load templates. Apply the admin_console_v2 migration if needed.");
    }
  }

  function pick(t) {
    setSelected(t.key);
    setSubject(t.subject || "");
    setBodyHtml(t.body_html || "");
  }

  useEffect(() => {
    load();
  }, []);

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
      await load();
    } catch (e) {
      setError(e.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const current = templates.find((t) => t.key === selected);

  return (
    <AdminShell title="Email templates" subtitle="Editable subject and body copy. Brand chrome stays in code.">
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}
      <div className="ta-grid-2">
        <div className="ta-card">
          <div className="ta-card-head">
            <h2>Templates</h2>
          </div>
          {templates.length === 0 ? (
            <div className="ta-empty">No templates yet.</div>
          ) : (
            <ul className="ta-list">
              {templates.map((t) => (
                <li key={t.key}>
                  <button
                    type="button"
                    className={`ta-btn ta-btn-ghost ta-btn-sm ${selected === t.key ? "is-active" : ""}`}
                    onClick={() => pick(t)}
                  >
                    {t.label || t.key}
                  </button>
                  <div className="ta-muted">{t.key}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ta-card">
          {current ? (
            <>
              <div className="ta-card-head">
                <h2>{current.label}</h2>
                <span className="ta-muted">{formatWhen(current.updated_at)}</span>
              </div>
              <label className="ta-muted">Subject</label>
              <input className="ta-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <label className="ta-muted" style={{ display: "block", marginTop: 12 }}>
                Body HTML
              </label>
              <textarea
                className="ta-input"
                rows={12}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
              />
              <button
                type="button"
                className="ta-btn ta-btn-primary"
                style={{ marginTop: 12 }}
                disabled={busy}
                onClick={save}
              >
                {busy ? "Saving…" : "Save template"}
              </button>
            </>
          ) : (
            <div className="ta-empty">Select a template.</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
