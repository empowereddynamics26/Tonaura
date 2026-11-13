"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { NINE } from "@/lib/tones";
import { createRenderer } from "./descentScene";
import { setStoryTone, setSound, toggleSound, onSoundChange, isSoundOn } from "@/lib/toneAudio";

/**
 * Descent — the homepage as one scroll ride.
 *
 *   hero      the Tonaura rings, hanging in depth
 *   flight    the camera dives through the rings
 *   tones     nine different forms, one per tone, each arriving its own way
 *   worlds    the last plate opens onto the five Theme Pack places
 *
 * Scroll position sets the camera; the pointer leans it; time only adds
 * shimmer and weather.
 */

const WORLDS = [
  { name: "Winter", tag: "Free", src: "/images/worlds/winter.webp", line: "Snow on the pines. Included with every account." },
  { name: "Autumn", tag: "Premium", src: "/images/worlds/autumn.webp", line: "Amber light and falling leaves." },
  { name: "Summer", tag: "Premium", src: "/images/worlds/summer.webp", line: "Long warm evenings in tall grass." },
  { name: "Rain", tag: "Premium", src: "/images/worlds/rain.webp", line: "A grey afternoon and steady rain." },
  { name: "Night sky", tag: "Premium", src: "/images/worlds/nightsky.webp", line: "Stars over a quiet field." },
];

// Timeline, in screens of scroll
const HERO = 1;
const FLY = 1.5;
const TONE = 1.25;
const EXIT = 1;
const WORLD = 1.1;
const END = 0.7;
const T_TONES = HERO + FLY;
const T_EXIT = T_TONES + TONE * 9;
const T_WORLDS = T_EXIT + EXIT;
const TOTAL = T_WORLDS + WORLD * (WORLDS.length - 1) + END;
const HOLD_SHARE = 0.46;
const GOLD = [212, 169, 94];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

export function Descent() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const hudRef = useRef(null);
  const hzRef = useRef(null);
  const ghostRef = useRef(null);
  const wordRef = useRef(null);
  const noteRef = useRef(null);
  const lineRef = useRef(null);
  const countRef = useRef(null);
  const rulerRef = useRef(null);
  const rulerWrapRef = useRef(null);
  const worldsRef = useRef(null);
  const worldCopyRef = useRef(null);
  const worldNameRef = useRef(null);
  const worldTagRef = useRef(null);
  const worldLineRef = useRef(null);
  const worldNumRef = useRef(null);
  const endRef = useRef(null);
  const cueRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const small = window.matchMedia("(max-width: 720px)").matches;
    let renderer = null;
    try {
      renderer = createRenderer(canvas, small);
    } catch (err) {
      console.warn("Descent: WebGL unavailable", err);
    }
    if (!renderer) {
      stage.classList.add("no-gl");
    }
    const worldEls = Array.from(worldsRef.current.children);

    let aspect = renderer ? renderer.resize() : 1;
    const onResize = () => {
      if (renderer) aspect = renderer.resize();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    // pointer lean
    let tx = 0, ty = 0, px = 0, py = 0;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let lastS = 0;
    let energy = 0;
    let shownTone = -1;
    let shownWorld = -1;
    const t0 = performance.now();

    function camZ(s, L) {
      if (s < HERO) return lerp(0, 1.4, s / HERO);
      const h0 = L.plate0 - L.hold;
      if (s < T_TONES) return lerp(1.4, h0, easeIO((s - HERO) / FLY));
      if (s < T_EXIT) {
        const k = Math.min(8, Math.floor((s - T_TONES) / TONE));
        const u = (s - T_TONES - k * TONE) / TONE;
        const hk = h0 + k * L.spacing;
        const drift = L.hold * 0.1;
        if (u < HOLD_SHARE) return hk + drift * (u / HOLD_SHARE);
        const next = k < 8 ? hk + L.spacing : hk + L.hold + 4;
        return lerp(hk + drift, next, easeIO((u - HOLD_SHARE) / (1 - HOLD_SHARE)));
      }
      const zEnd = h0 + 8 * L.spacing + L.hold + 4;
      return zEnd + (s - T_EXIT) * 1.5;
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp(-rect.top / (rect.height - vh));
      const s = p * TOTAL;
      const time = (now - t0) / 1000;
      const pinned = rect.top <= 1 && rect.bottom >= vh - 1;

      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      energy += (clamp(Math.abs(s - lastS) * 14) - energy) * 0.12;
      lastS = s;

      /* ---------- tones ---------- */
      const inTones = s >= T_TONES && s < T_EXIT;
      let k = clamp(Math.floor((s - T_TONES) / TONE), 0, 8);
      let u = clamp((s - T_TONES - k * TONE) / TONE);
      let e = k < 8 ? ease(clamp((u - HOLD_SHARE) / (1 - HOLD_SHARE))) : 0;
      if (s < T_TONES) { k = 0; e = 0; }
      const hz = lerp(NINE[k].hz, NINE[Math.min(8, k + 1)].hz, e);
      const show = e < 0.5 ? k : k + 1;
      if (show !== shownTone) {
        shownTone = show;
        const t = NINE[show];
        wordRef.current.textContent = t.word;
        noteRef.current.textContent = t.note ? `Solfeggio · ${t.note}` : "Solfeggio · below Ut";
        lineRef.current.textContent = t.line;
        countRef.current.textContent = `0${show + 1}`;
      }
      const hzText = Math.round(hz).toString();
      if (hzRef.current.textContent !== hzText) {
        hzRef.current.textContent = hzText;
        ghostRef.current.textContent = hzText;
      }
      const flyIn = clamp((s - (T_TONES - 0.45)) / 0.45);
      const lastOut = k === 8 ? clamp((u - 0.55) / 0.3) : 0;
      const hud = s < T_EXIT ? flyIn * (1 - lastOut) : 0;
      hudRef.current.style.opacity = hud.toFixed(3);
      hudRef.current.style.visibility = hud > 0.01 ? "visible" : "hidden";
      const swap = 1 - Math.sin(Math.PI * e);
      wordRef.current.style.opacity = swap.toFixed(3);
      lineRef.current.style.opacity = swap.toFixed(3);
      wordRef.current.style.transform = `translate3d(0, ${((e < 0.5 ? -e : 1 - e) * 50).toFixed(1)}px, 0)`;
      ghostRef.current.style.transform = `translate3d(${(-px * 18).toFixed(1)}px, ${(-py * 12 + (u - 0.5) * -40).toFixed(1)}px, 0) scale(${(1 + e * 0.06).toFixed(4)})`;
      rulerRef.current.style.transform = `translate3d(${(-hz * 1.6).toFixed(1)}px, 0, 0)`;
      rulerWrapRef.current.style.opacity = hud.toFixed(3);
      ghostRef.current.style.opacity = hud.toFixed(3);

      const a = NINE[k].rgb;
      const b = NINE[Math.min(8, k + 1)].rgb;
      const heroMix = clamp((s - HERO) / FLY);
      const rgb = a.map((v, i) => Math.round(lerp(lerp(GOLD[i], v, heroMix), b[i], e)));
      stage.style.setProperty("--tone", `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);

      /* ---------- hero ---------- */
      const heroO = clamp(1 - s / 0.7);
      heroRef.current.style.opacity = heroO.toFixed(3);
      heroRef.current.style.transform = `translate3d(0, ${(-s * 90).toFixed(1)}px, 0)`;
      heroRef.current.style.visibility = heroO > 0.01 ? "visible" : "hidden";
      cueRef.current.style.opacity = clamp(1 - s / 0.25).toFixed(3);

      /* ---------- worlds ---------- */
      const ws = s - T_EXIT; // 0..EXIT opens Winter, then one world per WORLD
      let wi = 0;
      let wAlpha = 0;
      if (ws > 0) {
        const open = clamp(ws / EXIT);
        const wf = clamp((s - T_WORLDS) / WORLD, 0, WORLDS.length - 1);
        const cur = Math.floor(wf);
        const we = cur < WORLDS.length - 1 ? ease(clamp((wf - cur - 0.45) / 0.55)) : 0;
        worldEls.forEach((el, i) => {
          let r = 0;
          if (i === 0) r = ease(open);
          else if (i <= cur) r = 1;
          else if (i === cur + 1) r = we;
          el.style.clipPath = `circle(${(r * 78).toFixed(2)}% at 50% 50%)`;
          el.style.visibility = r > 0.001 ? "visible" : "hidden";
          // each place pushes in while it is on screen
          const life = i === 0 ? open * 0.4 + clamp(wf) * 0.6 : clamp(wf - (i - 1) - 0.45, 0, 1.55) / 1.55;
          el.firstChild.style.transform = `translate3d(${(-px * 14).toFixed(1)}px, ${(-py * 10).toFixed(1)}px, 0) scale(${(1.28 - 0.2 * life).toFixed(4)})`;
        });
        wi = we < 0.5 ? cur : cur + 1;
        const dip = cur < WORLDS.length - 1 ? 1 - Math.sin(Math.PI * we) : 1;
        wAlpha = (cur === 0 ? ease(clamp((open - 0.5) * 2)) : 1) * dip;
        if (wi !== shownWorld) {
          shownWorld = wi;
          worldNameRef.current.textContent = WORLDS[wi].name;
          worldTagRef.current.textContent = WORLDS[wi].tag;
          worldLineRef.current.textContent = WORLDS[wi].line;
          worldNumRef.current.textContent = `0${wi + 1} / 05`;
        }
        const endO = clamp((s - (TOTAL - END * 0.9)) / (END * 0.5));
        worldCopyRef.current.style.opacity = (wAlpha * (1 - endO)).toFixed(3);
        worldCopyRef.current.style.transform = `translate3d(0, ${((1 - wAlpha) * 30).toFixed(1)}px, 0)`;
        endRef.current.style.opacity = endO.toFixed(3);
        endRef.current.style.visibility = endO > 0.01 ? "visible" : "hidden";
        worldsRef.current.style.visibility = "visible";
      } else {
        worldsRef.current.style.visibility = "hidden";
        worldCopyRef.current.style.opacity = "0";
        endRef.current.style.opacity = "0";
        endRef.current.style.visibility = "hidden";
      }
      worldCopyRef.current.style.visibility = ws > 0 ? "visible" : "hidden";

      /* ---------- sound ---------- */
      setStoryTone(hz, pinned && inTones ? clamp(hud * 1.2) : 0);

      /* ---------- render ---------- */
      if (renderer) {
        const L = renderer.layout;
        const wide = aspect > 1.05;
        const toTones = ease(clamp((s - HERO) / FLY)) * (1 - ease(clamp((s - (T_EXIT - 0.5)) / 0.5)));
        renderer.draw({
          cx: px * 0.35,
          cy: -py * 0.25,
          cz: camZ(s, L),
          roll: px * 0.03 + s * 0.02,
          time,
          shiftX: wide ? 0.3 * toTones : 0,
          shiftY: (wide ? 0.44 : 0.48) * (1 - ease(clamp(s / (HERO + FLY * 0.5)))) + (wide ? 0 : -0.2 * toTones),
          fade: 1 - clamp((ws - 0.15) / 0.6),
          energy,
          weather: wi,
          weatherAlpha: wAlpha,
          scroll: s * 0.6,
        });
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
      else setStoryTone(174, 0);
    });
    io.observe(root);

    const offSound = onSoundChange((on) => {
      if (soundRef.current) soundRef.current.dataset.on = on ? "1" : "0";
    });
    if (soundRef.current) soundRef.current.dataset.on = isSoundOn() ? "1" : "0";

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offSound();
      window.removeEventListener("pointermove", onMove);
      setStoryTone(174, 0);
      renderer?.destroy();
    };
  }, []);

  return (
    <section className="descent" id="top" ref={rootRef} style={{ height: `${(TOTAL + 1) * 100}vh` }}>
      <span className="descent-anchor" id="tones" style={{ top: `${(T_TONES + 0.2) * 100}vh` }} />
      <span className="descent-anchor" id="themes" style={{ top: `${(T_WORLDS + 0.1) * 100}vh` }} />

      <div className="descent-stage" ref={stageRef}>
        <div className="descent-glow" aria-hidden="true" />

        <div className="descent-worlds" ref={worldsRef} aria-hidden="true">
          {WORLDS.map((w) => (
            <div key={w.name} className="descent-world" style={{ clipPath: "circle(0% at 50% 50%)", visibility: "hidden" }}>
              <img src={w.src} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>

        <p className="descent-ghost" ref={ghostRef} aria-hidden="true" style={{ opacity: 0 }}>174</p>
        <canvas className="descent-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="descent-vignette" aria-hidden="true" />

        {/* Hero */}
        <header className="descent-hero" ref={heroRef}>
          <p className="descent-eyebrow">Solfeggio Tone Therapy</p>
          <h1 className="descent-h1">
            Nine solfeggio tones.
            <br />
            <em>One place to be still.</em>
          </h1>
          <p className="descent-sub">
            A calm solfeggio mixer with Practice, Presets and living Theme Packs. Offline by default, honest about what it is.
          </p>
          <div className="descent-cta">
            <Link className="btn btn--primary btn--large" href="/signup">Create account</Link>
            <a className="btn btn--ghost btn--large" href="#tones" onClick={() => setSound(true)}>
              <span className="btn-dot" />
              Hear the tones
            </a>
          </div>
        </header>
        <p className="descent-cue" ref={cueRef} aria-hidden="true">
          <span />
          Scroll to descend
        </p>

        {/* Tone HUD */}
        <div className="descent-hud" ref={hudRef} style={{ opacity: 0, visibility: "hidden" }}>
          <p className="descent-count"><b ref={countRef}>01</b> / 09</p>
          <p className="descent-tag" ref={noteRef}>Solfeggio</p>
          <p className="descent-hz"><span ref={hzRef}>174</span><small>Hz</small></p>
          <h2 className="descent-word" ref={wordRef}>Ground</h2>
          <p className="descent-line" ref={lineRef}>{NINE[0].line}</p>
          <button type="button" className="descent-sound" ref={soundRef} data-on="0" onClick={() => toggleSound()}>
            <span className="tstory-sound-bars" aria-hidden="true"><i /><i /><i /></span>
            <span className="tstory-sound-off">Turn sound on</span>
            <span className="tstory-sound-on">Sound on</span>
          </button>
        </div>

        <div className="descent-ruler" ref={rulerWrapRef} aria-hidden="true" style={{ opacity: 0 }}>
          <div className="tstory-ruler-track" ref={rulerRef}>
            {Array.from({ length: 111 }, (_, i) => (
              <span key={i} className={`tstory-tick${i % 5 === 0 ? " tstory-tick--mid" : ""}`} style={{ left: `${i * 16}px` }}>
                {i % 10 === 0 ? <b>{i * 10}</b> : null}
              </span>
            ))}
            {NINE.map((t) => (
              <span key={t.hz} className="tstory-mark" style={{ left: `${t.hz * 1.6}px` }} />
            ))}
          </div>
          <span className="tstory-needle" />
        </div>

        {/* Worlds */}
        <div className="descent-worldcopy" ref={worldCopyRef} style={{ opacity: 0, visibility: "hidden" }}>
          <p className="descent-tag">Theme Packs · <span ref={worldNumRef}>01 / 05</span></p>
          <h2 className="descent-worldname"><span ref={worldNameRef}>Winter</span></h2>
          <p className="descent-worldline">
            <span className="descent-worldtag" ref={worldTagRef}>Free</span>
            <span ref={worldLineRef}>{WORLDS[0].line}</span>
          </p>
        </div>

        <div className="descent-end" ref={endRef} style={{ opacity: 0, visibility: "hidden" }}>
          <h2 className="descent-h1">
            A place
            <br />
            <em>around the sound.</em>
          </h2>
        </div>
        <div className="descent-floor" aria-hidden="true" />
      </div>
    </section>
  );
}
