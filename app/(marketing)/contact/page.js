"use client";

import { useState } from "react";
import "./contact.css";

const TOPICS = [
  "General question",
  "Billing & subscriptions",
  "Privacy & data",
  "Report a bug",
  "Something else",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState({ state: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ state: "sending", text: "Sending your message…" });
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message, _honey: honey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not send.");

      setStatus({
        state: "success",
        text: "Message received. We'll reply by email.",
      });
      setName("");
      setEmail("");
      setTopic(TOPICS[0]);
      setMessage("");
      setHoney("");
    } catch (err) {
      setStatus({
        state: "error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const statusClass = status.state
    ? `contact-status is-visible status-${status.state}`
    : "contact-status";

  return (
    <>
      {/* Hero */}
      <header className="contact-hero" id="top">
        <p className="contact-hero-eyebrow">Get in touch</p>
        <h1 className="contact-hero-headline">Contact us</h1>
        <p className="contact-hero-lede">
          Have a question, found a problem, or just want to say hello? Send us a message and
          we&rsquo;ll reply by email, usually within one business day.
        </p>
        <span className="contact-hero-rule" aria-hidden="true" />
      </header>

      {/* Form */}
      <div className="contact-layout">
        <div className="contact-card">
          <div className="contact-card-head">
            <h2 className="contact-card-title">Send us a message</h2>
            <p className="contact-card-note">
              Fill out the form below and we&rsquo;ll reply by email.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="_honey"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="form-row">
              <div className="form-field">
                <label className="form-field-label" htmlFor="contact-name">
                  Full name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field-label" htmlFor="contact-email">
                  Email address
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  placeholder="jane@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-field-label" htmlFor="contact-topic">
                Topic
              </label>
              <select
                id="contact-topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="How can we help?"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--large contact-submit"
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send message"}
            </button>

            {status.text ? (
              <p className={statusClass} role="status">
                {status.text}
              </p>
            ) : null}

            <p className="contact-privacy">
              We&rsquo;ll reply by email. Don&rsquo;t include payment card numbers.
            </p>
          </form>
        </div>
      </div>

      {/* Closing */}
      <section className="contact-closing">
        <p className="contact-closing-line">We read every message.</p>
        <p className="contact-closing-sub">
          Usually one reply per business day but always from a person.
        </p>
      </section>
    </>
  );
}