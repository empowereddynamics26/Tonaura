"use client";

import { useEffect, useRef } from "react";
import { NINE } from "@/lib/tones";
import { setStoryTone, isSoundOn, toggleSound, onSoundChange } from "@/lib/toneAudio";

/**
 * ToneStory — the pinned "tune the nine" scroll story.
 *
 * Grains of sand settle on the nodal lines of a vibrating plate (Chladni
 * figures). Each of the nine tones gets its own figure; scrolling moves the
 * sand from one figure to the next and, with sound on, glides the tone.
 *
 * Every movement is a pure function of scroll position: nothing runs on a
 * timer, so it plays forwards and backwards exactly with the scroll.
 */

// Mode pairs (n, m, sign) — complexity grows with the frequency.
const MODES = [
  [1, 2, -1],
  [1, 3, 1],
  [2, 3, -1],
  [1, 4, -1],
  [2, 5, 1],
  [3, 4, -1],
  [2, 6, 1],
  [3, 5, -1],
  [4, 7, -1],
];

const TAU = Math.PI * 2;

function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sort by angle, then lightly by radius, so grain k in one figure lands
// near grain k in the next — the sand drifts instead of teleporting.
function order(xs, ys) {
  const idx = Array.from(xs, (_, i) => i);
  const key = idx.map((i) => {
    const a = Math.atan2(ys[i], xs[i]);
    const r = Math.hypot(xs[i], ys[i]);
    return Math.floor(r * 4) * 10 + (a + Math.PI) / TAU;
  });
  idx.sort((a, b) => key[a] - key[b]);
  return [Float32Array.from(idx, (i) => xs[i]), Float32Array.from(idx, (i) => ys[i])];
}

function chladni(n, m, sign, count, seed) {
  const G = 360;
  const f = new Float32Array(G * G);
  const P = Math.PI;
  for (let j = 0; j < G; j++) {
    const v = j / (G - 1);
    for (let i = 0; i < G; i++) {
      const u = i / (G - 1);
      f[j * G + i] =
        Math.cos(n * P * u) * Math.cos(m * P * v) +
        sign * Math.cos(m * P * u) * Math.cos(n * P * v);
    }
  }
  const cells = [];
  const h = 2 / (G - 1);
  for (let j = 1; j < G - 1; j++) {
    for (let i = 1; i < G - 1; i++) {
      const x = -1 + i * h;
      const y = -1 + j * h;
      if (x * x + y * y > 0.94) continue;
      const k = j * G + i;
      const gx = (f[k + 1] - f[k - 1]) / (2 * h);
      const gy = (f[k + G] - f[k - G]) / (2 * h);
      const d = Math.abs(f[k]) / (Math.hypot(gx, gy) + 1e-4);
      if (d < 0.011) cells.push(x, y);
    }
  }
  const r = rand(seed);
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  const nCells = cells.length / 2;
  for (let p = 0; p < count; p++) {
    const c = Math.floor(r() * nCells) * 2;
    xs[p] = cells[c] + (r() - 0.5) * h * 1.6;
    ys[p] = cells[c + 1] + (r() - 0.5) * h * 1.6;
  }
  return order(xs, ys);
}

function scatter(count, seed) {
  const r = rand(seed);
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  for (let p = 0; p < count; p++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * 0.96;
    xs[p] = Math.cos(a) * d;
    ys[p] = Math.sin(a) * d;
  }
  return order(xs, ys);
}

// The Tonaura mark: four open rings around a bright centre.
function mark(count, seed) {
  const r = rand(seed);
  const rings = [
    { rad: 0.22, from: 0.3, len: 0.72 },
    { rad: 0.42, from: 0.25, len: 0.7 },
    { rad: 0.62, from: 0.28, len: 0.68 },
    { rad: 0.82, from: 0.26, len: 0.66 },
  ];
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  for (let p = 0; p < count; p++) {
    if (p % 9 === 0) {
      const a = r() * TAU;
      const d = Math.sqrt(r()) * 0.09;
      xs[p] = Math.cos(a) * d;
      ys[p] = Math.sin(a) * d;
      continue;
    }
    const ring = rings[Math.floor(r() * 4)];
    const a = (ring.from + r() * ring.len) * TAU;
    const d = ring.rad + (r() - 0.5) * 0.022;
    xs[p] = Math.cos(a) * d;
    ys[p] = Math.sin(a) * d;
  }
  return order(xs, ys);
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

const GOLD = [212, 169, 94];
const STATES = [
  { kind: "intro", rgb: GOLD },
  ...NINE.map((t) => ({ kind: "tone", tone: t, rgb: t.rgb })),
  { kind: "outro", rgb: GOLD },
];
const HOLD = 0.42; // share of each step spent holding a figure

export function ToneStory() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const hzRef = useRef(null);
  const wordRef = useRef(null);
  const noteRef = useRef(null);
  const lineRef = useRef(null);
  const copyRef = useRef(null);
  const introRef = useRef(null);
  const outroRef = useRef(null);
  const rulerRef = useRef(null);
  const dotsRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    const small = window.matchMedia("(max-width: 720px)").matches;
    const COUNT = small ? 3600 : 7000;

    const figures = [
      scatter(COUNT, 7),
      ...MODES.map(([n, m, s], i) => chladni(n, m, s, COUNT, 100 + i)),
      mark(COUNT, 991),
    ];

    let size = 0;
    let dpr = 1;
    const haloSprite = document.createElement("canvas");
    haloSprite.width = haloSprite.height = 32;
    let haloKey = "";
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      size = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      last = -1;
    }

    let last = -1;
    let lastIndex = -2;
    let visible = false;
    let raf = 0;

    function setText(state) {
      if (state.kind !== "tone") return;
      const t = state.tone;
      wordRef.current.textContent = t.word;
      noteRef.current.textContent = t.note ? `Solfeggio · ${t.note}` : "Solfeggio · below Ut";
      lineRef.current.textContent = t.line;
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const progress = clamp(-rect.top / total);
      const inStage = rect.top <= 1 && rect.bottom >= vh - 1;
      const soundKey = isSoundOn() ? 1 : 0;
      const key = progress * 10 + soundKey * 1000 + size;
      if (key === last) return;
      last = key;

      const steps = STATES.length - 1;
      const x = progress * (steps + HOLD);
      const k = Math.min(steps, Math.floor(x));
      const frac = k === steps ? 0 : x - k;
      const e = ease(clamp((frac - HOLD) / (1 - HOLD)));
      const a = figures[k];
      const b = figures[Math.min(steps, k + 1)];
      const sa = STATES[k];
      const sb = STATES[Math.min(steps, k + 1)];

      // Colour + backdrop
      const rgb = sa.rgb.map((v, i) => Math.round(lerp(v, sb.rgb[i], e)));
      stage.style.setProperty("--tone", `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);

      // Frequency readout glides between tones
      const hzA = sa.kind === "tone" ? sa.tone.hz : sa.kind === "intro" ? 174 : 963;
      const hzB = sb.kind === "tone" ? sb.tone.hz : sb.kind === "intro" ? 0 : 963;
      const hz = lerp(hzA, hzB, e);
      let toneish = (sa.kind === "tone" ? 1 - e : 0) + (sb.kind === "tone" ? e : 0);
      // intro and outro copy hand over without overlapping the tone copy
      if (sa.kind === "intro") toneish = clamp((e - 0.5) * 2);
      if (sb.kind === "outro") toneish = sa.kind === "tone" ? clamp(1 - e * 2) : 0;
      hzRef.current.textContent = Math.round(hz).toString().padStart(3, "0");
      copyRef.current.style.opacity = toneish.toFixed(3);

      // Words swap at the midpoint of a transition
      const showIndex = e < 0.5 ? k : k + 1;
      if (showIndex !== lastIndex) {
        lastIndex = showIndex;
        setText(STATES[Math.min(steps, showIndex)]);
        const dots = dotsRef.current.children;
        for (let i = 0; i < dots.length; i++) {
          dots[i].classList.toggle("is-on", i === showIndex - 1);
        }
      }
      // Text fades out and back in around the swap
      const swapFade = sa.kind === "tone" && sb.kind === "tone" ? 1 - Math.sin(Math.PI * e) : 1;
      lineRef.current.style.opacity = swapFade.toFixed(3);
      wordRef.current.style.opacity = swapFade.toFixed(3);
      wordRef.current.style.transform = `translateY(${((e < 0.5 ? -e : 1 - e) * 40).toFixed(1)}px)`;

      const introO = k === 0 ? clamp(1 - e * 2) : 0;
      introRef.current.style.opacity = introO.toFixed(3);
      introRef.current.style.transform = `translateY(${(-(k === 0 ? e : 1) * 60).toFixed(1)}px)`;
      introRef.current.style.visibility = introO > 0.01 ? "visible" : "hidden";
      const outroO = k === steps ? 1 : k === steps - 1 ? clamp((e - 0.5) * 2) : 0;
      outroRef.current.style.opacity = outroO.toFixed(3);
      outroRef.current.style.transform = `translateY(${((1 - outroO) * 50).toFixed(1)}px)`;
      outroRef.current.style.visibility = outroO > 0.01 ? "visible" : "hidden";

      // Ruler: 1 Hz = 1.6px, the needle stays centred
      rulerRef.current.style.transform = `translate3d(${(-hz * 1.6).toFixed(1)}px,0,0)`;

      // Sound follows the story while the stage is pinned
      const level = inStage ? clamp(toneish * 1.2) : 0;
      setStoryTone(Math.max(60, hz || 174), level);

      // Sand
      const W = canvas.width;
      const H = canvas.height;
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      const cx = W / 2;
      const cy = H / 2;
      const R = (Math.min(W, H) / 2) * 0.96;
      // A slow turn tied to scroll keeps the hold alive
      const turn = progress * 0.9;
      const lift = Math.sin(Math.PI * e); // grains jump off the plate mid-change
      const cosT = Math.cos(turn);
      const sinT = Math.sin(turn);
      const grain = Math.max(1, dpr * (small ? 0.95 : 1.05));
      const ax = a[0], ay = a[1], bx = b[0], by = b[1];
      const bright = `rgba(${Math.min(255, rgb[0] + 50)}, ${Math.min(255, rgb[1] + 45)}, ${Math.min(255, rgb[2] + 40)}, 0.75)`;
      // soft halo under the sand so the figure glows
      const halo = grain * 9;
      const spriteKey = rgb.join(",");
      if (spriteKey !== haloKey) {
        haloKey = spriteKey;
        const sg = haloSprite.getContext("2d");
        sg.clearRect(0, 0, 32, 32);
        const grd = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
        grd.addColorStop(0, `rgba(${spriteKey}, 0.16)`);
        grd.addColorStop(1, `rgba(${spriteKey}, 0)`);
        sg.fillStyle = grd;
        sg.fillRect(0, 0, 32, 32);
      }
      for (let p = 0; p < COUNT; p += 6) {
        const px = ax[p] + (bx[p] - ax[p]) * e;
        const py = ay[p] + (by[p] - ay[p]) * e;
        const rx = px * cosT - py * sinT;
        const ry = px * sinT + py * cosT;
        g.drawImage(haloSprite, cx + rx * R - halo / 2, cy + ry * R - halo / 2, halo, halo);
      }
      g.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.55)`;
      for (let p = 0; p < COUNT; p++) {
        let px = ax[p] + (bx[p] - ax[p]) * e;
        let py = ay[p] + (by[p] - ay[p]) * e;
        if (lift > 0.001) {
          // each grain swirls a little on its own path while airborne
          const w = ((p * 2654435761) >>> 0) / 4294967296;
          const ang = w * TAU + e * 3;
          const amp = lift * (0.05 + w * 0.08);
          px += Math.cos(ang) * amp;
          py += Math.sin(ang) * amp;
        }
        const rx = px * cosT - py * sinT;
        const ry = px * sinT + py * cosT;
        if (p % 11 === 0) {
          g.fillStyle = bright;
          g.fillRect(cx + rx * R, cy + ry * R, grain * 1.5, grain * 1.5);
          g.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.55)`;
        } else {
          g.fillRect(cx + rx * R, cy + ry * R, grain, grain);
        }
      }
      g.globalCompositeOperation = "source-over";
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) {
          last = -1;
          raf = requestAnimationFrame(frame);
        } else {
          setStoryTone(174, 0);
        }
      },
      { rootMargin: "100px 0px" }
    );
    io.observe(root);

    const offSound = onSoundChange((on) => {
      soundRef.current?.setAttribute("aria-pressed", on ? "true" : "false");
      if (soundRef.current) soundRef.current.dataset.on = on ? "1" : "0";
      last = -1;
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      offSound();
      setStoryTone(174, 0);
    };
  }, []);

  return (
    <section className="tstory" id="tones" ref={rootRef} aria-label="The nine tones">
      <div className="tstory-stage" ref={stageRef}>
        <div className="tstory-glow" aria-hidden="true" />

        <div className="tstory-plate">
          <div className="tstory-plate-ring" aria-hidden="true" />
          <canvas ref={canvasRef} className="tstory-canvas" aria-hidden="true" />
        </div>

        <div className="tstory-intro" ref={introRef}>
          <p className="tstory-kicker">Scroll to tune</p>
          <h2 className="tstory-title">
            Nine tones.
            <br />
            <em>Each leaves a shape.</em>
          </h2>
          <p className="tstory-note">
            Sand on a ringing plate gathers where the plate is still. These figures follow
            that maths, one for every tone in the app.
          </p>
          <button type="button" className="tstory-sound" ref={soundRef} data-on="0" aria-pressed="false" onClick={() => toggleSound()}>
            <span className="tstory-sound-bars" aria-hidden="true"><i /><i /><i /></span>
            <span className="tstory-sound-off">Turn sound on</span>
            <span className="tstory-sound-on">Sound on</span>
          </button>
        </div>

        <div className="tstory-copy" ref={copyRef} style={{ opacity: 0 }}>
          <p className="tstory-note-tag" ref={noteRef}>Solfeggio</p>
          <p className="tstory-hz">
            <span ref={hzRef}>174</span>
            <small>Hz</small>
          </p>
          <h3 className="tstory-word" ref={wordRef}>Ground</h3>
          <p className="tstory-line" ref={lineRef}>{NINE[0].line}</p>
        </div>

        <div className="tstory-outro" ref={outroRef} style={{ opacity: 0, visibility: "hidden" }}>
          <h2 className="tstory-title">
            Nine solfeggio tones.
            <br />
            <em>One place to be still.</em>
          </h2>
          <a className="btn btn--primary btn--large" href="#mixer">Make a blend</a>
        </div>

        <ol className="tstory-dots" ref={dotsRef} aria-hidden="true">
          {NINE.map((t) => (
            <li key={t.hz}><span>{t.hz}</span></li>
          ))}
        </ol>

        <div className="tstory-ruler" aria-hidden="true">
          <div className="tstory-ruler-track" ref={rulerRef}>
            {Array.from({ length: 111 }, (_, i) => {
              const hz = i * 10;
              return (
                <span
                  key={hz}
                  className={`tstory-tick${hz % 50 === 0 ? " tstory-tick--mid" : ""}`}
                  style={{ left: `${hz * 1.6}px` }}
                >
                  {hz % 100 === 0 ? <b>{hz}</b> : null}
                </span>
              );
            })}
            {NINE.map((t) => (
              <span key={t.hz} className="tstory-mark" style={{ left: `${t.hz * 1.6}px` }} />
            ))}
          </div>
          <span className="tstory-needle" />
        </div>
      </div>
    </section>
  );
}
