"use client";

export function AdminTopBar({ title, subtitle, email, onMenu, onSignOut }) {
  const initial = (email || "A").slice(0, 1).toUpperCase();
  return (
    <header className="ta-topbar">
      <button type="button" className="ta-menu-btn" aria-label="Open menu" onClick={onMenu}>
        ☰
      </button>
      <div className="ta-top-titles">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="ta-top-actions">
        <div className="ta-user-chip">
          <div className="ta-avatar">{initial}</div>
          <div className="ta-user-meta">
            <strong>{email || "Admin"}</strong>
            <span>admin</span>
          </div>
        </div>
        <a className="ta-btn ta-btn-ghost ta-btn-sm" href="/account">
          Account
        </a>
        <button type="button" className="ta-btn ta-btn-ghost ta-btn-sm" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
