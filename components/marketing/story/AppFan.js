"use client";

import { useEffect, useRef, useState } from "react";

const SCREENS = [
  { src: "/images/app/presets.webp?v=6", title: "Presets", body: "Deep Sleep, Clear Focus, Morning Reset, or your own." },
  { src: "/images/app/mixer.webp?v=6", title: "The mixer", body: "Ten pure tones in one breathing view." },
  { src: "/images/app/practice.webp?v=6", title: "Practice", body: "A streak for showing up. That is the whole streak." },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const KEY = "tonaura_try_streak";
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * AppFan — three app screens that fan out as you scroll in, plus a
 * tap-to-mark practice week you can try right here.
 */
export function AppFan() {
  const rootRef = useRef(null);
  const phonesRef = useRef(null);
  const [days, setDays] = useState([true, true, false, false, false, false, false]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDays(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const phones = Array.from(phonesRef.current.children);
    let raf = 0;
    let last = -1;
    function frame() {
      raf = requestAnimationFrame(frame);
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section top enters, 1 when its middle reaches mid-screen
      const p = clamp((vh - rect.top) / (vh * 0.95));
      if (p === last) return;
      last = p;
      const e = 1 - Math.pow(1 - p, 3);
      const narrow = window.innerWidth < 720;
      const spread = narrow ? 64 : 118;
      phones.forEach((el, i) => {
        const side = i - 1;
        const x = side * spread * e;
        const rot = side * 9 * e;
        const y = (1 - e) * 120 + Math.abs(side) * 26 * e;
        el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}%), ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${side === 0 ? 1 : 0.9})`;
        el.style.opacity = clamp(0.2 + e * 1.2).toFixed(3);
      });
    }
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
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

  function toggleDay(i) {
    setDays((prev) => {
      const next = prev.map((d, j) => (j === i ? !d : d));
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // Current run = consecutive marked days ending at the latest marked one
  let streak = 0;
  const lastOn = days.lastIndexOf(true);
  for (let i = lastOn; i >= 0 && days[i]; i--) streak++;

  return (
    <section className="appfan" id="inside" ref={rootRef}>
      <div className="appfan-head reveal">
        <p className="eyebrow">What&rsquo;s inside</p>
        <h2 className="appfan-title">
          Built to be used,
          <br />
          <em>not browsed.</em>
        </h2>
      </div>

      <div className="appfan-phones" ref={phonesRef}>
        {SCREENS.map((s) => (
          <figure key={s.title} className="appfan-phone">
            <div className="appfan-frame">
              <img src={s.src} alt={`Tonaura ${s.title.toLowerCase()} screen`} width="720" height="1280" loading="lazy" decoding="async" />
            </div>
            <figcaption>
              <strong>{s.title}</strong>
              <span>{s.body}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="practice reveal">
        <div className="practice-copy">
          <p className="eyebrow">Practice</p>
          <p className="practice-text">Tap the days you listened. No targets, no badges, just the days you showed up.</p>
        </div>
        <div className="practice-week" role="group" aria-label="Try the practice week">
          {DAYS.map((d, i) => (
            <button
              key={i}
              type="button"
              className={`practice-day${days[i] ? " is-on" : ""}`}
              onClick={() => toggleDay(i)}
              aria-pressed={days[i]}
              aria-label={`Day ${i + 1}`}
            >
              <span>{d}</span>
            </button>
          ))}
        </div>
        <p className="practice-count">
          <span className="practice-num">{streak}</span>
          <span>{streak === 1 ? "day in a row" : "days in a row"}</span>
        </p>
      </div>
    </section>
  );
}
