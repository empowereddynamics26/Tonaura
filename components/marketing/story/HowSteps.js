"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  { num: "01", title: "Choose a tone", body: "Pick from the classic solfeggio set, or blend several into one field." },
  { num: "02", title: "Shape the mix", body: "Balance the levels, add a Theme Pack, or load a saved preset." },
  { num: "03", title: "Stay with it", body: "Mark the day in Practice when you showed up. That is the whole streak." },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * HowSteps — "Three moves". A gold line draws across as the section
 * scrolls through the screen, and each step lights as the line reaches it.
 */
export function HowSteps() {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const stepsRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const steps = Array.from(stepsRef.current.children);
    let raf = 0;
    let last = -1;
    function frame() {
      raf = requestAnimationFrame(frame);
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the section's top reaches 75% of the screen, 1 as it reaches 5%
      const p = clamp((vh * 0.75 - r.top) / (vh * 0.7));
      if (p === last) return;
      last = p;
      lineRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      steps.forEach((el, i) => {
        const on = clamp((p - (i * 0.33 + 0.02)) / 0.16);
        el.style.setProperty("--on", on.toFixed(3));
      });
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = -1;
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="how" id="how" ref={rootRef}>
      <div className="how-head">
        <p className="eyebrow">How it works</p>
        <h2 className="how-title">
          Three moves.
          <br />
          <em>Then you listen.</em>
        </h2>
      </div>
      <div className="how-rail" aria-hidden="true">
        <span ref={lineRef} />
      </div>
      <ol className="how-steps" ref={stepsRef}>
        {STEPS.map((s) => (
          <li key={s.num} className="how-step">
            <span className="how-dot" aria-hidden="true" />
            <span className="how-num" aria-hidden="true">{s.num}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
