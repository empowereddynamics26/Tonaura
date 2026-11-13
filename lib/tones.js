// The nine solfeggio tones as the website presents them, plus the app's
// Deepener (69.3 Hz) for the mixer. Words describe the sound, never a
// health outcome — Tonaura is wellness software, not a medical device.

const GOLD = [212, 169, 94];
const TEAL = [79, 179, 169];

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

export const NINE = [
  { hz: 174, word: "Ground", note: null, line: "The lowest of the nine. A floor to build the mix on." },
  { hz: 285, word: "Soften", note: null, line: "Warm and close. Sits well under a slow evening." },
  { hz: 396, word: "Release", note: "Ut", line: "The first note of the old scale. Let the day go." },
  { hz: 417, word: "Shift", note: "Re", line: "One step up. For when something needs to move." },
  { hz: 528, word: "Return", note: "Mi", line: "The one most people know. Bright, round and easy." },
  { hz: 639, word: "Connect", note: "Fa", line: "Even and open. Plays well with others in a blend." },
  { hz: 741, word: "Clear", note: "Sol", line: "Crisp at the edges. Pairs with 528 for focus." },
  { hz: 852, word: "Open", note: "La", line: "Airy and high. Thin it out over a low tone." },
  { hz: 963, word: "Still", note: "Si", line: "The top of the set. Light, quiet, almost not there." },
].map((t, i) => {
  const rgb = mix(GOLD, TEAL, i / 8);
  return { ...t, rgb, color: `rgb(${rgb.join(",")})` };
});

export const DEEPENER = { hz: 69.3, word: "Deepener", rgb: [166, 124, 58], color: "rgb(166,124,58)" };

export const MIXER_TONES = [DEEPENER, ...NINE];

// The app's own multi-tone presets (tonaura-app src/data/presets.js).
export const BLENDS = [
  { id: "deep-sleep", name: "Deep Sleep Blend", levels: { 69.3: 0.45, 174: 0.4, 396: 0.3, 852: 0.2 } },
  { id: "focus", name: "Clear Focus Blend", levels: { 528: 0.5, 741: 0.35 } },
  { id: "morning-reset", name: "Morning Reset", levels: { 417: 0.4, 528: 0.45, 639: 0.3 } },
];
