"use client";

/**
 * toneAudio — one small Web Audio engine shared by the homepage.
 *
 * The app plays pre-rendered pure sine loops, so the browser can play the
 * same thing with oscillators: no audio files to download.
 *
 * Two voices groups:
 *   · story  — one oscillator that follows the scroll story's frequency
 *   · mixer  — one oscillator per tone, each with its own gain
 *
 * Sound is OFF until the visitor turns it on (browsers require a gesture).
 * Everything ramps with setTargetAtTime so nothing clicks.
 */

const listeners = new Set();
let ctx = null;
let master = null;
let enabled = false;

let storyOsc = null;
let storyGain = null;

const mixerVoices = new Map(); // hz -> { osc, gain }
let mixerLevels = {}; // hz -> 0..1
let analyser = null;
let mixerMuted = true; // the mixer only sounds while it is on screen

const MASTER_LEVEL = 0.55;

function emit() {
  listeners.forEach((fn) => fn(enabled));
}

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  // A gentle low-pass keeps the higher tones soft on laptop speakers.
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 4200;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  master.connect(soften);
  soften.connect(analyser);
  analyser.connect(ctx.destination);
  return ctx;
}

export function isSoundOn() {
  return enabled;
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getAnalyser() {
  return analyser;
}

export async function setSound(on) {
  if (on) {
    const c = ensureContext();
    if (!c) return;
    if (c.state === "suspended") await c.resume();
    enabled = true;
    master.gain.setTargetAtTime(MASTER_LEVEL, c.currentTime, 0.15);
    applyMixer();
  } else if (ctx) {
    enabled = false;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
  } else {
    enabled = false;
  }
  emit();
}

export function toggleSound() {
  return setSound(!enabled);
}

/* ---------------- story voice ---------------- */

export function setStoryTone(hz, level) {
  if (!enabled || !ctx) {
    if (storyGain && ctx) storyGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    return;
  }
  if (!storyOsc) {
    storyOsc = ctx.createOscillator();
    storyOsc.type = "sine";
    storyGain = ctx.createGain();
    storyGain.gain.value = 0;
    storyOsc.connect(storyGain);
    storyGain.connect(master);
    storyOsc.frequency.value = hz;
    storyOsc.start();
  }
  const t = ctx.currentTime;
  storyOsc.frequency.setTargetAtTime(hz, t, 0.06);
  storyGain.gain.setTargetAtTime(level * 0.32, t, 0.12);
}

/* ---------------- mixer voices ---------------- */

function voiceFor(hz) {
  let v = mixerVoices.get(hz);
  if (v) return v;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = hz;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  v = { osc, gain };
  mixerVoices.set(hz, v);
  return v;
}

function applyMixer() {
  if (!enabled || !ctx) return;
  if (mixerMuted) {
    const t0 = ctx.currentTime;
    mixerVoices.forEach((v) => v.gain.gain.setTargetAtTime(0, t0, 0.1));
    return;
  }
  const active = Object.values(mixerLevels).filter((l) => l > 0.001);
  // Keep the summed level steady however many tones are up.
  const norm = 1 / Math.max(1, Math.sqrt(active.length));
  const t = ctx.currentTime;
  Object.entries(mixerLevels).forEach(([hz, level]) => {
    const v = voiceFor(Number(hz));
    v.gain.gain.setTargetAtTime(level * 0.3 * norm, t, 0.08);
  });
}

export function setMixerLevels(levels) {
  // levels: { [hz]: 0..1 }; tones not listed go to 0
  const next = {};
  Object.keys(mixerLevels).forEach((hz) => (next[hz] = 0));
  Object.entries(levels).forEach(([hz, l]) => (next[hz] = l));
  mixerLevels = next;
  applyMixer();
}

export function silenceMixer() {
  mixerMuted = true;
  if (!ctx) return;
  const t = ctx.currentTime;
  mixerVoices.forEach((v) => v.gain.gain.setTargetAtTime(0, t, 0.1));
}

export function resumeMixer() {
  mixerMuted = false;
  applyMixer();
}
