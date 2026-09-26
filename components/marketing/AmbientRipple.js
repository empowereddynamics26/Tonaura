"use client";

import { usePathname } from "next/navigation";

/**
 * AmbientRipple — the small periodic drip at the top of marketing pages.
 *
 * Not shown on the homepage, because the homepage hero already emits
 * its own rings from the mark. Doubling up would be visual noise.
 *
 * Mounted in app/(marketing)/layout.js. Hides itself on "/".
 */
export function AmbientRipple() {
  const pathname = usePathname();

  // No ripple on the homepage — the hero mark has its own emission
  if (pathname === "/") return null;

  return (
    <div className="ambient-drop" aria-hidden="true">
      <svg
        className="ambient-drop-svg"
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="ambient-drop-ring ambient-drop-ring--1"
          cx="240"
          cy="240"
          r="40"
        />
        <circle
          className="ambient-drop-ring ambient-drop-ring--2"
          cx="240"
          cy="240"
          r="40"
        />
      </svg>
    </div>
  );
}