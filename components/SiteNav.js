"use client";

export function SiteNav({ extra }) {
  return (
    <nav className="top">
      <a className="brand" href="/">
        Tonaura
      </a>
      <div>{extra || <a href="/account">Account</a>}</div>
    </nav>
  );
}
