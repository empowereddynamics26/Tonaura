"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/overview");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Forbidden");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    await fetch("/api/admin/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="shell" style={{ maxWidth: 900 }}>
      <SiteNav extra={<a href="/account">Account</a>} />
      <p className="kicker">Internal</p>
      <h1>Admin</h1>
      {error ? (
        <p className="error">
          {error}. Sign in with an admin account, or set ADMIN_EMAILS on Vercel and reload.
        </p>
      ) : null}
      {!data && !error ? <p>Loading…</p> : null}
      {data ? (
        <>
          <div className="card">
            <div className="row">
              <span>Waitlist</span>
              <strong>{data.waitlistCount}</strong>
            </div>
            <div className="row">
              <span>Active Premium</span>
              <strong>{data.premiumCount}</strong>
            </div>
          </div>
          <h2>Recent waitlist</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {data.waitlist.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Contact</h2>
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>Topic</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.messages.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.name}
                    <br />
                    <span className="muted">{row.email}</span>
                  </td>
                  <td>{row.topic}</td>
                  <td>{row.message}</td>
                  <td>
                    <select value={row.status} onChange={(e) => setStatus(row.id, e.target.value)}>
                      <option value="new">new</option>
                      <option value="read">read</option>
                      <option value="replied">replied</option>
                      <option value="archived">archived</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
