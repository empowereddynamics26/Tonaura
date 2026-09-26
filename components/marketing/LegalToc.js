"use client";

import { useEffect, useState } from "react";

/**
 * LegalToc — the "On this page" sidebar for legal pages.
 *
 * Receives the section list as a prop and:
 *   1. Renders a sticky TOC with anchor links
 *   2. Implements scroll-spy: highlights the currently-visible section
 *   3. Smooth-scrolls to sections on click
 *
 * Ported from tonaura-site.js `tocScrollSpy()`.
 */
export function LegalToc({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    let ticking = false;
    function update() {
      ticking = false;
      const pos = window.scrollY + 130;
      let current = elements[0];
      for (const el of elements) {
        if (el.offsetTop <= pos) current = el;
      }
      setActiveId(current.id);
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => document.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <aside className="legal-toc" aria-label="On this page">
      <h2>On this page</h2>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={activeId === s.id ? "toc-active" : ""}
            >
              {s.number}. {s.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}