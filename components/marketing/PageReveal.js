"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll fade-up for Next.js pages.
 *
 * Re-runs whenever the route changes so that client-side navigations
 * (not just full page loads) pick up newly-mounted elements.
 *
 * Elements start hidden via CSS (.reveal-init) and become visible
 * (.reveal-in) when they enter the viewport.
 */
export function PageReveal() {
  const pathname = usePathname();

  useEffect(() => {
    let currentCleanup = () => {};

    // Defer to let the new route's DOM fully commit
    const initTimeout = setTimeout(() => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

   const selector = [
  ".shell",
  ".card",
  ".checkout-wrap",
  ".auth-panel",
  ".reveal",
  ".reveal-init",
].join(", ");

      const nodes = Array.from(document.querySelectorAll(selector)).filter(
        (el) =>
          !el.closest(".admin-shell, .ta-admin, [data-admin], .ta-side-nav")
      );

      if (!nodes.length) return;

      // Reduced motion or no IO — show everything instantly
      if (reduce || !("IntersectionObserver" in window)) {
        nodes.forEach((el) => {
          el.classList.add("reveal-in");
          el.classList.remove("reveal-init");
        });
        return;
      }

      // Stagger the reveal a touch and make sure .reveal elements get
      // the .reveal-init class so the CSS transition applies.
      nodes.forEach((el, i) => {
        if (
          el.classList.contains("reveal") &&
          !el.classList.contains("reveal-init")
        ) {
          el.classList.add("reveal-init");
        }
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = `${Math.min(i % 6, 5) * 0.09}s`;
        }
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -6% 0px" }
      );

      // Two rAFs so the browser paints the initial opacity:0 first
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nodes.forEach((el) => io.observe(el));
        });
      });

      currentCleanup = () => {
        cancelAnimationFrame(rafId);
        io.disconnect();
      };
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      currentCleanup();
    };
  }, [pathname]);

  return null;
}