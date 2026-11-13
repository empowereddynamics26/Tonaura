"use client";

import { useEffect, useRef } from "react";

const WORDS = "Sound that asks nothing of you.".split(" ");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * QuoteReveal — the listener quote, pinned while each word lights up
 * with the scroll and a ring opens behind it.
 */
export function QuoteReveal() {
  const rootRef = useRef(null);
  const wordsRef = useRef(null);
  const ringRef = useRef(null);
  const byRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const words = Array.from(wordsRef.current.children);
    let raf = 0;
    let last = -1;
    function frame() {
      raf = requestAnimationFrame(frame);
      const r = root.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - window.innerHeight));
      if (p === last) return;
      last = p;
      const n = words.length;
      words.forEach((el, i) => {
        const on = clamp((p * 1.25 - i / n) * n * 0.9);
        el.style.setProperty("--on", on.toFixed(3));
      });
      byRef.current.style.opacity = clamp((p - 0.78) / 0.15).toFixed(3);
      ringRef.current.style.transform = `translate(-50%, -50%) scale(${(0.35 + p * 0.9).toFixed(4)})`;
      ringRef.current.style.opacity = (0.15 + Math.sin(Math.PI * p) * 0.6).toFixed(3);
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = -1;
        raf = requestAnimationFrame(frame);
      }
    }, { rootMargin: "100px 0px" });
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="quote" aria-label="A listener on Tonaura" ref={rootRef}>
      <div className="quote-stage">
        <span className="quote-ring" ref={ringRef} aria-hidden="true" />
        <blockquote className="quote-text">
          <p ref={wordsRef}>
            {WORDS.map((w, i) => (
              <span key={i} className="quote-word">{w} </span>
            ))}
          </p>
          <footer className="quote-by" ref={byRef}>A listener, London</footer>
        </blockquote>
      </div>
    </section>
  );
}
