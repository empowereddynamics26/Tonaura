"use client";

import { useEffect, useRef, useState } from "react";

const SLIDES = [
  { src: "/images/app/ambients/winter.webp?v=6", alt: "Winter Theme Pack" },
  { src: "/images/app/ambients/autumn.webp?v=6", alt: "Autumn Theme Pack" },
  { src: "/images/app/ambients/summer.webp?v=6", alt: "Summer Theme Pack" },
  { src: "/images/app/ambients/rain.webp?v=6", alt: "Rain Theme Pack" },
  { src: "/images/app/ambients/nightsky.webp?v=6", alt: "Night sky Theme Pack" },
];

/**
 * AmbientPhone — the 4th phone in the "What's inside" showcase.
 *
 * Cycles through Theme Pack background images every 3 seconds.
 * Respects prefers-reduced-motion.
 *
 * Performance:
 *   · All slides are loading="lazy". Without it React preloaded all five
 *     (~900 KB) in the <head> of the home page, ahead of everything above
 *     the fold, even though this phone sits far below it.
 *   · The 3s cycle only runs while the phone is on (or near) screen.
 *
 * Ported from tonaura-home.js's startAmbientCycle().
 */
export function AmbientPhone() {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div className="phone-screen" data-ambient-phone ref={ref}>
      <div className="ambient-slides">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            width="720"
            height="1280"
            loading="lazy"
            decoding="async"
            className={i === index ? "is-active" : ""}
          />
        ))}
      </div>
    </div>
  );
}
