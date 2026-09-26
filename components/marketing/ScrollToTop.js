"use client";

import { useEffect, useState } from "react";
import "./ScrollToTop.css";

/**
 * ScrollToTop — the Returning Ring.
 *
 * A floating gold-and-teal button that appears after 800px of scroll.
 * The icon is a concentric ring + upward chevron: the mark's language
 * reduced to its minimum. On hover, an outer ring emits outward like
 * the hero waves. On click, the whole button collapses inward.
 *
 * Respects prefers-reduced-motion (instant jump, no emission).
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 800);
          ticking = false;
        });
        ticking = true;
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      className={`scroll-to-top${visible ? " is-visible" : ""}`}
      onClick={handleClick}
      aria-label="Scroll to top"
    >
      <span className="scroll-to-top-icon" aria-hidden="true">
        {/* Emitted outer ring — animates on hover */}
        <span className="scroll-to-top-emit" />

        {/* Static inner ring — the resting ring */}
        <span className="scroll-to-top-ring" />

        {/* The chevron — pure SVG stroke, no fill */}
        <svg
          className="scroll-to-top-chevron"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V6" />
          <path d="M6 12l6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}