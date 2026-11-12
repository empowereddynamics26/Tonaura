"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * OffscreenPause — freezes looping decorations in sections you can't see.
 *
 * The marketing pages are full of infinite CSS animations (hero rings and
 * waves, headline shimmer, pulsing diamonds and dots, interlude rings…).
 * Browsers keep ticking those even when the section is far off-screen, and
 * several of them (SVG rings, the shimmer) repaint on the main thread every
 * frame. This marks each top-level page section with [data-offscreen] while
 * it is out of view; marketing.css pauses every animation inside it.
 * Nothing changes visually: a section resumes just before it scrolls in.
 *
 * Mounted once in app/(marketing)/layout.js; re-scans on route change.
 */
export function OffscreenPause() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    let io = null;
    // Defer a tick so the new route's DOM has committed.
    const timer = setTimeout(() => {
      const targets = document.querySelectorAll(
        "#main-content > *, .site-footer"
      );
      if (!targets.length) return;

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.removeAttribute("data-offscreen");
            } else {
              entry.target.setAttribute("data-offscreen", "");
            }
          }
        },
        // Resume a little before the section enters the viewport.
        { rootMargin: "200px 0px" }
      );
      targets.forEach((el) => io.observe(el));
    }, 0);

    return () => {
      clearTimeout(timer);
      if (io) io.disconnect();
      document
        .querySelectorAll("[data-offscreen]")
        .forEach((el) => el.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}
