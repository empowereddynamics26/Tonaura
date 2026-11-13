"use client";

import { useEffect, useRef } from "react";

/**
 * CardTilt — gives every `.price-card` inside it a soft 3D tilt and a glow
 * that follows the pointer. Mouse/pen only; touch screens keep flat cards.
 */
export function CardTilt({ children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const cards = Array.from(root.querySelectorAll(".price-card"));
    const offs = cards.map((card) => {
      let raf = 0;
      let px = 0.5, py = 0.5;
      function apply() {
        raf = 0;
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        card.style.transform = `perspective(900px) rotateY(${((px - 0.5) * 10).toFixed(2)}deg) rotateX(${(-(py - 0.5) * 10).toFixed(2)}deg) translateY(-6px)`;
      }
      function move(e) {
        const r = card.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width;
        py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        if (!raf) raf = requestAnimationFrame(apply);
      }
      function leave() {
        cancelAnimationFrame(raf);
        raf = 0;
        card.classList.remove("is-tilting");
        card.style.transform = "";
      }
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        cancelAnimationFrame(raf);
      };
    });
    return () => offs.forEach((off) => off());
  }, []);
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
