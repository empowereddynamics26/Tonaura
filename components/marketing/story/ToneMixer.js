"use client";

import { useEffect, useRef, useState } from "react";
import { MIXER_TONES, BLENDS } from "@/lib/tones";
import { setMixerLevels, setSound, isSoundOn, onSoundChange, silenceMixer, resumeMixer } from "@/lib/toneAudio";

/**
 * ToneMixer — a playable cut of the app's mixer.
 * Ten faders (Deepener + the nine), the app's own blends, and a live
 * waveform of what you are hearing.
 */
export function ToneMixer() {
  const [levels, setLevels] = useState({ 528: 0.5, 741: 0.35 });
  const [active, setActive] = useState("focus");
  const [on, setOn] = useState(false);
  const levelsRef = useRef(levels);
  const scopeRef = useRef(null);
  const rootRef = useRef(null);
  const onRef = useRef(false);

  useEffect(() => {
    levelsRef.current = levels;
    if (isSoundOn()) setMixerLevels(levels);
  }, [levels]);

  useEffect(() => onSoundChange((v) => { setOn(v); onRef.current = v; }), []);

  // Only play the mixer while it's on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMixerLevels(levelsRef.current);
        resumeMixer();
      } else silenceMixer();
    }, { threshold: 0.25 });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  // Waveform: the summed sines, drawn slowed down so the shape is readable.
  useEffect(() => {
    const canvas = scopeRef.current;
    const g = canvas.getContext("2d");
    let raf = 0;
    let visible = false;
    let phase = 0;
    let lastT = 0;

    function draw(t) {
      raf = requestAnimationFrame(draw);
      const dt = lastT ? Math.min(50, t - lastT) : 16;
      lastT = t;
      if (onRef.current) phase += dt * 0.0009;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const lv = levelsRef.current;
      const entries = MIXER_TONES.filter((tone) => (lv[tone.hz] || 0) > 0.001);
      const sumL = entries.reduce((s, tone) => s + lv[tone.hz], 0) || 1;
      // three passes: soft glow, colour, bright core
      const passes = [
        { width: 8, alpha: 0.08 },
        { width: 2.2, alpha: 0.5 },
        { width: 1, alpha: 0.95 },
      ];
      passes.forEach(({ width, alpha }) => {
        const grad = g.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(212,169,94,${alpha})`);
        grad.addColorStop(1, `rgba(79,179,169,${alpha})`);
        g.strokeStyle = grad;
        g.lineWidth = width;
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          let y = 0;
          entries.forEach((tone) => {
            y += lv[tone.hz] * Math.sin(u * tone.hz * 0.06 + phase * tone.hz * 0.02);
          });
          y = (y / sumL) * (h * 0.38) * Math.min(1, sumL * 1.4);
          const taper = Math.sin(Math.PI * u);
          const py = h / 2 + y * taper;
          if (x === 0) g.moveTo(x, py);
          else g.lineTo(x, py);
        }
        g.stroke();
      });
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      lastT = 0;
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  function setLevel(hz, v) {
    setActive(null);
    setLevels((prev) => ({ ...prev, [hz]: v }));
  }

  function loadBlend(b) {
    setActive(b.id);
    setLevels({ ...b.levels });
    if (!isSoundOn()) setSound(true);
  }

  return (
    <section className="mixer" id="mixer" ref={rootRef}>
      <div className="mixer-head reveal">
        <p className="eyebrow">Try it here</p>
        <h2 className="mixer-title">
          Make a blend.
          <br />
          <em>Right in your browser.</em>
        </h2>
        <p className="lede">
          The same pure sine tones the app plays. Raise a fader, or start from one of the
          app&rsquo;s blends.
        </p>
        <div className="mixer-top">
          <div className="mixer-blends" role="group" aria-label="Blends">
            {BLENDS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`mixer-chip${active === b.id ? " is-active" : ""}`}
                onClick={() => loadBlend(b)}
              >
                {b.name}
              </button>
            ))}
            <button type="button" className="mixer-chip mixer-chip--ghost" onClick={() => { setActive(null); setLevels({}); }}>
              Clear
            </button>
          </div>
          <button
            type="button"
            className={`mixer-play${on ? " is-on" : ""}`}
            onClick={() => setSound(!on)}
            aria-pressed={on}
          >
            <span className="mixer-play-icon" aria-hidden="true" />
            {on ? "Pause" : "Play"}
          </button>
        </div>

      </div>

      <div className="mixer-deck reveal">
        <canvas className="mixer-scope" ref={scopeRef} aria-hidden="true" />

        <div className="mixer-faders">
          {MIXER_TONES.map((tone) => {
            const v = levels[tone.hz] || 0;
            return (
              <label
                key={tone.hz}
                className={`fader${v > 0.001 ? " is-up" : ""}`}
                style={{ "--c": tone.color, "--v": v }}
              >
                <span className="fader-val">{Math.round(v * 100)}</span>
                <span className="fader-track">
                  <span className="fader-fill" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(v * 100)}
                    onChange={(e) => setLevel(tone.hz, Number(e.target.value) / 100)}
                    aria-label={`${tone.hz} hertz`}
                  />
                </span>
                <span className="fader-hz">{tone.hz}</span>
                <span className="fader-word">{tone.word}</span>
              </label>
            );
          })}
        </div>
        <p className="mixer-foot">Use headphones at a low volume. Tonaura is wellness software, not a medical device.</p>
      </div>
    </section>
  );
}
