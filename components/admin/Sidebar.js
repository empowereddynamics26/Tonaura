"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
    ],
  },
  {
    label: "Users & growth",
    items: [
      { href: "/admin/users", label: "Accounts" },
      { href: "/admin/waitlist", label: "Waitlist" },
    ],
  },
  {
    label: "Support",
    items: [{ href: "/admin/contact", label: "Contact inbox" }],
  },
  {
    label: "Revenue",
    items: [
      { href: "/admin/subscriptions", label: "Premium" },
      { href: "/admin/billing", label: "Billing events" },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

function Icon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
  };
  if (name === "dash")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  if (name === "users")
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (name === "list")
    return (
      <svg {...common}>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "mail")
    return (
      <svg {...common}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  if (name === "crown")
    return (
      <svg {...common}>
        <path d="m5 9 3.5 9h7L19 9l-3.5 2.5L12 6l-3.5 5.5L5 9z" />
      </svg>
    );
  if (name === "card")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

const ICONS = {
  "/admin": "dash",
  "/admin/users": "users",
  "/admin/waitlist": "list",
  "/admin/contact": "mail",
  "/admin/subscriptions": "crown",
  "/admin/billing": "card",
  "/admin/settings": "gear",
};

export function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open ? <button type="button" className="ta-backdrop" aria-label="Close menu" onClick={onClose} /> : null}
      <aside className={`ta-sidebar ${open ? "is-open" : ""}`}>
        <div className="ta-brand">
          <img src="/images/brand/mark.png" alt="" width={36} height={36} />
          <div>
            <div className="ta-brand-name">Tonaura</div>
            <div className="ta-brand-sub">Admin Console</div>
          </div>
          <button type="button" className="ta-side-close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <nav className="ta-side-nav">
          {NAV.map((section) => (
            <div className="ta-nav-section" key={section.label}>
              <div className="ta-nav-label">{section.label}</div>
              {section.items.map((item) => {
                const active = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ta-nav-link ${active ? "is-active" : ""}`}
                    onClick={onClose}
                  >
                    <Icon name={ICONS[item.href] || "dash"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
