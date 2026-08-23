"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
      { href: "/admin/health", label: "System health" },
      { href: "/admin/insights", label: "Insights" },
    ],
  },
  {
    label: "Users & growth",
    items: [{ href: "/admin/users", label: "Accounts" }],
  },
  {
    label: "Support",
    items: [
      { href: "/admin/contact", label: "Contact inbox" },
      { href: "/admin/templates", label: "Email templates" },
      { href: "/admin/broadcasts", label: "Broadcasts" },
    ],
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
    items: [
      { href: "/admin/flags", label: "Feature flags" },
      { href: "/admin/audit", label: "Audit log" },
      { href: "/admin/settings", label: "Settings" },
    ],
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
  if (name === "pulse")
    return (
      <svg {...common}>
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    );
  if (name === "flag")
    return (
      <svg {...common}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <path d="M4 22v-7" />
      </svg>
    );
  if (name === "audit")
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  if (name === "broadcast")
    return (
      <svg {...common}>
        <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-6" />
      </svg>
    );
  if (name === "template")
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5" />
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
  "/admin/contact": "mail",
  "/admin/subscriptions": "crown",
  "/admin/billing": "card",
  "/admin/settings": "gear",
  "/admin/health": "pulse",
  "/admin/flags": "flag",
  "/admin/audit": "audit",
  "/admin/broadcasts": "broadcast",
  "/admin/insights": "chart",
  "/admin/templates": "template",
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
                const active = item.match
                  ? item.match(pathname)
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
