"use client";

import { useEffect, useRef } from "react";

const PACKS = [
  { name: "Winter", tag: "Free", src: "/images/app/ambients/winter.webp?v=6", line: "Snow on the pines. Included with every account." },
  { name: "Autumn", tag: "Premium", src: "/images/app/ambients/autumn.webp?v=6", line: "Amber light and falling leaves." },
  { name: "Summer", tag: "Premium", src: "/images/app/ambients/summer.webp?v=6", line: "Long warm evenings, slow water." },
  { name: "Rain", tag: "Premium", src: "/images/app/ambients/rain.webp?v=6", line: "A window, a grey afternoon, steady rain." },
  { name: "Night sky", tag: "Premium", src: "/images/app/ambients/nightsky.webp?v=6", line: "Stars over a quiet field." },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);

/**
 * ThemeStory — Theme Packs, driven by scroll.
 * Each pack wipes up inside the phone while the full-screen backdrop
 * dissolves to match and the pack's name slides through the list.
 */
export function ThemeStory() {
  const rootRef = useRef(null);
  const layersRef = useRef(null);
  const bgRef = useRef(null);
  const namesRef = useRef(null);
  const phoneRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const layers = Array.from(layersRef.current.children);
    const bgs = Array.from(bgRef.current.children);
    const names = Array.from(namesRef.current.children);
    let raf = 0;
    let last = -1;

    function frame() {
      raf = requestAnimationFrame(frame);
      const rect = root.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / total);
      if (p === last) return;
      last = p;
      const x = p * (PACKS.length - 1 + 0.35);
      const k = Math.min(PACKS.length - 1, Math.floor(x));
      const e = k === PACKS.length - 1 ? 0 : ease(clamp((x - k - 0.35) / 0.65));

      layers.forEach((el, i) => {
        // i <= k fully shown; i === k+1 wipes up from the bottom
        const show = i <= k ? 1 : i === k + 1 ? e : 0;
        el.style.clipPath = `inset(${((1 - show) * 100).toFixed(2)}% 0 0 0)`;
        el.firstChild.style.transform = `scale(${(1.12 - 0.12 * show).toFixed(4)})`;
      });
      bgs.forEach((el, i) => {
        const o = i === k ? 1 - e : i === k + 1 ? e : 0;
        el.style.opacity = o.toFixed(3);
      });
      const active = e < 0.5 ? k : k + 1;
      names.forEach((el, i) => {
        const d = i - (k + e);
        el.style.transform = `translate3d(0, ${(d * 100).toFixed(1)}%, 0)`;
        el.style.opacity = clamp(1 - Math.abs(d) * 0.75).toFixed(3);
        el.classList.toggle("is-on", i === active);
      });
      // the phone tilts gently through the section
      phoneRef.current.style.transform = `rotateY(${(-14 + p * 28).toFixed(2)}deg) rotateX(${(6 - p * 6).toFixed(2)}deg)`;
      barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    }

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        last = -1;
        raf = requestAnimationFrame(frame);
      }
    }, { rootMargin: "200px 0px" });
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="tpacks" id="themes" ref={rootRef} aria-label="Theme Packs">
      <div className="tpacks-stage">
        <div className="tpacks-bg" ref={bgRef} aria-hidden="true">
          {PACKS.map((p, i) => (
            <img key={p.name} src={p.src} alt="" loading="lazy" decoding="async" style={{ opacity: i === 0 ? 1 : 0 }} />
          ))}
        </div>
        <div className="tpacks-shade" aria-hidden="true" />

        <div className="tpacks-copy">
          <p className="eyebrow">Theme Packs</p>
          <h2 className="tpacks-title">
            A place
            <br />
            <em>around the sound.</em>
          </h2>
          <div className="tpacks-names" ref={namesRef}>
            {PACKS.map((p) => (
              <div key={p.name} className="tpacks-name">
                <span className="tpacks-name-word">{p.name}</span>
                <span className="tpacks-name-tag">{p.tag}</span>
                <span className="tpacks-name-line">{p.line}</span>
              </div>
            ))}
          </div>
          <div className="tpacks-bar" aria-hidden="true"><span ref={barRef} /></div>
        </div>

        <div className="tpacks-phone-wrap">
          <div className="tpacks-phone" ref={phoneRef}>
            <div className="tpacks-screen" ref={layersRef}>
              {PACKS.map((p, i) => (
                <div key={p.name} className="tpacks-layer" style={{ clipPath: i === 0 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)" }}>
                  <img src={p.src} alt={`${p.name} Theme Pack`} width="720" height="1280" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
            <span className="tpacks-island" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
