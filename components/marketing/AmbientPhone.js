"use client";

import { useEffect, useState } from "react";

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
 * Ported from tonaura-home.js's startAmbientCycle().
 */
export function AmbientPhone() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="phone-screen" data-ambient-phone>
      <div className="ambient-slides">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={i === index ? "is-active" : ""}
          />
        ))}
      </div>
    </div>
  );
}