"use client";

import { useEffect, useRef } from "react";

/**
 * WordReveal — animates an h1 in word by word.
 *
 * Wraps each word in <span class="word-reveal"> with a staggered
 * animation-delay. CSS handles the animation (see legal.css).
 * Preserves <br> line breaks.
 *
 * Respects prefers-reduced-motion.
 *
 * Ported from tonaura-site.js `revealHeroWords()`.
 */
export function WordReveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const h1 = ref.current;
    if (!h1) return;
    if (h1.dataset.split === "1") return;
    h1.dataset.split = "1";

    const original = h1.innerHTML;
    const lines = original.split(/<br\s*\/?>/i);
    let wordIndex = 0;

    const html = lines
      .map((line) => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        return words
          .map((word) => {
            const delay = (wordIndex * 0.06).toFixed(2);
            wordIndex++;
            return `<span class="word-reveal" style="animation-delay:${delay}s">${word}</span>`;
          })
          .join(" ");
      })
      .join("<br>");

    h1.innerHTML = html;
  }, []);

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}