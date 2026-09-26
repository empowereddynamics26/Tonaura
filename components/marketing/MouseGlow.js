"use client";

import { useEffect, useRef } from "react";

/**
 * MouseGlow — a soft radial gradient that follows the cursor.
 *
 * Trails slightly behind the mouse (200ms ease) so it feels organic,
 * not glued to the pointer.
 *
 * Performance:
 *   · Uses requestAnimationFrame + lerp for smooth motion
 *   · Only updates style.transform (GPU-accelerated)
 *   · Disabled on touch devices
 *   · Disabled for prefers-reduced-motion
 */
export function MouseGlow() {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Skip for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;
    let active = false;

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!active) {
        active = true;
        el.style.opacity = "1";
      }
    }

    function onLeave() {
      active = false;
      el.style.opacity = "0";
    }

    function frame() {
      // Lerp toward target — 0.08 gives a soft trailing motion
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="mouse-glow" aria-hidden="true" />;
}