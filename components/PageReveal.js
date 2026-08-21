"use client";

import { useEffect } from "react";

/**
 * Scroll fade-up for Next.js pages (login, account, checkout, etc.).
 * Mirrors public/tonaura-site.js so app routes match marketing HTML.
 */
export function PageReveal() {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(
      document.querySelectorAll(".shell, .card, .checkout-wrap, .auth-panel, main section")
    ).filter((el) => !el.closest(".admin-shell, .ta-admin, [data-admin], .ta-side-nav"));
    if (!nodes.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    nodes.forEach((el, i) => {
      el.classList.add("reveal-init");
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

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nodes.forEach((el) => io.observe(el));
      });
    });

    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
    };
  }, []);

  return null;
}
