"use client";

import { useEffect, useRef } from "react";
import { setSound } from "@/lib/toneAudio";

/** "Hear the tones" — turns sound on, then glides down to the story. */
export function HeroListenButton() {
  return (
    <a
      className="btn btn--ghost btn--large"
      href="#tones"
      onClick={() => {
        setSound(true);
      }}
    >
      <span className="btn-dot" />
      Hear the tones
    </a>
  );
}

/** Tilts the hero mark toward the pointer and lifts it away as you scroll. */
export function HeroTilt({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, sy = -1;
    function move(e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      raf = 0;
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      const s = window.scrollY;
      const lift = Math.min(1, s / window.innerHeight);
      el.style.transform = `perspective(800px) rotateY(${(cx * 14).toFixed(2)}deg) rotateX(${(-cy * 14).toFixed(2)}deg) translate3d(${(cx * 10).toFixed(1)}px, ${(cy * 10 - lift * 80).toFixed(1)}px, 0) scale(${(1 + lift * 0.25).toFixed(3)})`;
      el.style.opacity = (1 - lift * 0.9).toFixed(3);
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 || s !== sy) {
        sy = s;
        raf = requestAnimationFrame(tick);
      }
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(tick);
    }
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="hero-tilt" ref={ref}>
      {children}
    </div>
  );
}
