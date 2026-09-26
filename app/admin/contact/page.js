"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContactSkeleton } from "@/components/admin/ContactSkeleton";
import { Badge, formatWhen } from "@/components/admin/ui";
import "./contact.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "replied", label: "Replied" },
  { id: "archived", label: "Archived" },
];

function toneFor(status) {
  if (status === "new") return "warn";
  if (status === "replied") return "ok";
  if (status === "archived") return "default";
  return "teal";
}

function initialFor(name, email) {
  const src = (name || email || "?").trim();
  return src[0] ? src[0].toUpperCase() : "?";
}

function shortTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export default function AdminContactPage() {
  const [rows, setRows] = useState(undefined);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.messages || []);
    } catch {
      setError("Could not load inbox.");
      setRows([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (!rows) return [];
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const counts = useMemo(() => {
    const c = {
      all: rows?.length || 0,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
    (rows || []).forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [rows]);

  async function setStatus(id, status) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      await load();
    } catch {
      setError("Could not update status.");
    } finally {
      setBusy("");
    }
  }

  async function sendReply(id) {
    if (!replyText.trim()) return;
    setBusy(id);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reply: replyText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setNotice(
        json.mailed ? "Reply emailed." : "Reply saved (SMTP may be unset)."
      );
      setReplyFor(null);
      setReplyText("");
      await load();
    } catch (e) {
      setError(e.message || "Could not send reply.");
    } finally {
      setBusy("");
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (rows === undefined && !error) {
    return (
      <AdminShell
        title="Contact inbox"
        section="Support"
        subtitle="Website enquiries. Mark status or reply by email."
      >
        <ContactSkeleton />
      </AdminShell>
    );
  }

  // ── Loaded ─────────────────────────────────────────────────────────────
  return (
    <AdminShell
      title="Contact inbox"
      section="Support"
      subtitle="Website enquiries. Mark status or reply by email."
    >
      {error ? <div className="ta-error">{error}</div> : null}
      {notice ? <p className="ta-ok">{notice}</p> : null}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="ta-inbox-toolbar">
        <div className="ta-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`ta-chip ${filter === f.id ? "is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="ta-chip-count">{counts[f.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Message list ────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="ta-card">
          <div className="ta-empty">
            {filter === "all"
              ? "No messages yet."
              : `No messages in ${filter}.`}
          </div>
        </div>
      ) : (
        <ul className="ta-inbox">
          {visible.map((m) => {
            const initial = initialFor(m.name, m.email);
            const isReplying = replyFor === m.id;
            const isBusy = busy === m.id;

            return (
              <li
                key={m.id}
                className={`ta-inbox-item${isReplying ? " is-replying" : ""}`}
              >
                {/* Header */}
                <div className="ta-inbox-head">
                  <span className="ta-inbox-avatar" aria-hidden="true">
                    {initial}
                  </span>

                  <div className="ta-inbox-from">
                    <span className="ta-inbox-name">
                      {m.name || m.email || "Unknown"}
                    </span>
                    <span className="ta-inbox-meta">
                      {m.name && m.email ? m.email : null}
                      {m.name && m.email && m.topic ? " · " : null}
                      {m.topic || null}
                    </span>
                  </div>

                  <div className="ta-inbox-status">
                    <Badge tone={toneFor(m.status)}>{m.status}</Badge>
                    <span className="ta-inbox-when">
                      {shortTime(m.created_at)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="ta-inbox-body">
                  <p>{m.message}</p>
                </div>

                {/* Previous reply */}
                {m.admin_reply && !isReplying ? (
                  <div className="ta-inbox-previous">
                    <span className="ta-inbox-previous-label">Your reply</span>
                    <p>{m.admin_reply}</p>
                  </div>
                ) : null}

                {/* Reply composer */}
                {isReplying ? (
                  <div className="ta-inbox-composer">
                    <label
                      className="ta-field-label"
                      htmlFor={`reply-${m.id}`}
                    >
                      Reply to {m.name || m.email}
                    </label>
                    <textarea
                      id={`reply-${m.id}`}
                      className="ta-input ta-textarea"
                      rows={4}
                      placeholder="Write a reply…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      autoFocus
                    />
                    <div className="ta-inbox-composer-actions">
                      <button
                        type="button"
                        className="ta-btn ta-btn-gold"
                        disabled={!!busy || !replyText.trim()}
                        onClick={() => sendReply(m.id)}
                      >
                        {isBusy ? "Sending…" : "Send reply"}
                      </button>
                      <button
                        type="button"
                        className="ta-btn ta-btn-ghost"
                        onClick={() => {
                          setReplyFor(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ta-inbox-actions">
                    <button
                      type="button"
                      className="ta-btn ta-btn-gold ta-btn-row"
                      onClick={() => {
                        setReplyFor(m.id);
                        setReplyText(m.admin_reply || "");
                      }}
                    >
                      Reply
                    </button>

                    {m.status !== "read" && m.status !== "replied" ? (
                      <button
                        type="button"
                        className="ta-btn ta-btn-ghost ta-btn-row"
                        disabled={isBusy}
                        onClick={() => setStatus(m.id, "read")}
                      >
                        Mark read
                      </button>
                    ) : null}

                    {m.status !== "archived" ? (
                      <button
                        type="button"
                        className="ta-btn ta-btn-ghost ta-btn-row"
                        disabled={isBusy}
                        onClick={() => setStatus(m.id, "archived")}
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ta-btn ta-btn-ghost ta-btn-row"
                        disabled={isBusy}
                        onClick={() => setStatus(m.id, "new")}
                      >
                        Unarchive
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}