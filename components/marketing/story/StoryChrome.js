"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { toggleSound, onSoundChange, isSoundOn, setSound } from "@/lib/toneAudio";

const MOTION_KEY = "tonaura_motion_paused";

/**
 * StoryChrome — homepage-only helpers:
 *   · Lenis smooth scrolling (always on: many Windows PCs report
 *     reduced-motion by default, and gating it there leaves the story jumpy;
 *     visitors can pause it from the dock instead)
 *   · a small dock with Sound and Motion toggles
 */
export function StoryChrome() {
  const [sound, setSoundState] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let p = false;
    try {
      p = localStorage.getItem(MOTION_KEY) === "1";
    } catch {}
    setPaused(p);
    setSoundState(isSoundOn());
    return onSoundChange(setSoundState);
  }, []);

  useEffect(() => {
    if (paused) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true });
    // In-page anchors glide too
    function onClick(e) {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [paused]);

  // Leave the page quietly
  useEffect(() => () => setSound(false), []);

  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    try {
      localStorage.setItem(MOTION_KEY, next ? "1" : "0");
    } catch {}
  }

  return (
    <div className="story-dock" role="group" aria-label="Page controls">
      <button type="button" className={`story-dock-btn${sound ? " is-on" : ""}`} onClick={() => toggleSound()} aria-pressed={sound}>
        <span className="story-dock-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        {sound ? "Sound on" : "Sound off"}
      </button>
      <button type="button" className="story-dock-btn story-dock-btn--quiet" onClick={toggleMotion} aria-pressed={paused}>
        {paused ? "Smooth scroll off" : "Smooth scroll on"}
      </button>
    </div>
  );
}
