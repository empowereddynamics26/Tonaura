// Nine different 3D shapes, one per tone. Each returns `count` particles as
// { end: [x,y,z], start: [x,y,z] } in local space (about ±2.2 units).
// `end` is the finished shape; `start` is where the particle waits before the
// tone takes hold — so every tone arrives in its own way.

const TAU = Math.PI * 2;
const R = 2.2;

function gauss(r) {
  return (r() + r() + r() - 1.5) / 1.5;
}

// 174 · Ground — a rolling floor that rises from below
function ground(count, r) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = (r() * 2 - 1) * 4.2;
    const z = (r() * 2 - 1) * 3.4;
    const y = -1.6 + Math.sin(x * 1.1) * 0.22 + Math.cos(z * 1.4 + x * 0.5) * 0.2;
    out.push({ end: [x, y, z], start: [x, y - 5 - Math.abs(x) * 0.6, z] });
  }
  return out;
}

// 285 · Soften — a hazy sphere that condenses out of a wide mist
function soften(count, r) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = r() * TAU;
    const b = Math.acos(2 * r() - 1);
    const d = 1.65 + gauss(r) * 0.22;
    const v = [Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)];
    const far = 3.2 + r() * 2.5;
    out.push({ end: v.map((c) => c * d), start: v.map((c) => c * d * far) });
  }
  return out;
}

// 396 · Release — a fountain let go from a single point
function release(count, r) {
  const out = [];
  const arcs = 36;
  for (let i = 0; i < count; i++) {
    const arc = Math.floor(r() * arcs);
    const phi = (arc / arcs) * TAU + (arc % 2) * 0.09;
    const reach = 1.7 + ((arc * 7) % 5) * 0.28;
    const u = Math.pow(r(), 0.8);
    const j = gauss(r) * 0.025;
    const x = Math.cos(phi) * reach * u + j;
    const z = Math.sin(phi) * reach * u + j;
    const y = -2.0 + 7.4 * u - 4.6 * u * u;
    out.push({ end: [x, y, z], start: [0, -2.0, 0] });
  }
  return out;
}

// 417 · Shift — three rings on different axes that slide in from the side
function shift(count, r) {
  const out = [];
  const rings = [
    { rad: 2.05, tilt: [0.35, 0.2] },
    { rad: 1.5, tilt: [1.2, -0.5] },
    { rad: 0.95, tilt: [-0.7, 1.1] },
  ];
  for (let i = 0; i < count; i++) {
    const ring = rings[i % 3];
    const a = r() * TAU;
    const d = ring.rad + gauss(r) * 0.018;
    let x = Math.cos(a) * d, y = Math.sin(a) * d, z = gauss(r) * 0.018;
    // tilt about x then y
    const [tx, ty] = ring.tilt;
    let y2 = y * Math.cos(tx) - z * Math.sin(tx);
    let z2 = y * Math.sin(tx) + z * Math.cos(tx);
    let x3 = x * Math.cos(ty) + z2 * Math.sin(ty);
    let z3 = -x * Math.sin(ty) + z2 * Math.cos(ty);
    const side = i % 3 === 1 ? -1 : 1;
    out.push({ end: [x3, y2, z3], start: [x3 + side * (9 + (i % 3) * 3), y2, z3] });
  }
  return out;
}

// 528 · Return — a spiral that winds back in on itself
function returnForm(count, r) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const arm = i % 3;
    const u = Math.pow(r(), 0.75);
    const rad = 0.12 + u * 2.15;
    const spread = 0.1 + u * 0.28;
    const a = rad * 2.6 + (arm / 3) * TAU + gauss(r) * spread;
    const z = gauss(r) * 0.12 * (1 - u * 0.6);
    const a0 = a + 4.5 + u * 3;
    const rad0 = rad * 2.4 + 1;
    out.push({ end: [Math.cos(a) * rad, Math.sin(a) * rad, z], start: [Math.cos(a0) * rad0, Math.sin(a0) * rad0, z - 2] });
  }
  return out;
}

// 639 · Connect — two strands that meet from either side and link up
function connect(count, r) {
  const out = [];
  const turns = 2.25;
  for (let i = 0; i < count; i++) {
    const t = r();
    const y = (t * 2 - 1) * 2.3;
    const a = t * turns * TAU;
    const kind = r();
    if (kind < 0.72) {
      const s = i % 2 ? 1 : -1;
      const x = Math.cos(a) * 0.95 * s + gauss(r) * 0.03;
      const z = Math.sin(a) * 0.95 * s + gauss(r) * 0.03;
      out.push({ end: [x, y, z], start: [x + s * 8, y + s * 1.5, z] });
    } else {
      // rungs between the strands
      const step = Math.round(t * 26) / 26;
      const yy = (step * 2 - 1) * 2.3;
      const aa = step * turns * TAU;
      const w = r() * 2 - 1;
      out.push({ end: [Math.cos(aa) * 0.95 * w, yy, Math.sin(aa) * 0.95 * w], start: [0, yy, 0] });
    }
  }
  return out;
}

// 741 · Clear — scattered shards that snap into a crystal
function clear(count, r) {
  const out = [];
  const top = [0, 2.2, 0], bot = [0, -2.2, 0];
  const mid = [0, 1, 2, 3, 4, 5].map((k) => [Math.cos((k / 6) * TAU) * 1.45, 0.25, Math.sin((k / 6) * TAU) * 1.45]);
  const edges = [];
  mid.forEach((m, k) => {
    edges.push([top, m], [bot, m], [m, mid[(k + 1) % 6]]);
  });
  const inner = mid.map((m) => m.map((c) => c * 0.45));
  inner.forEach((m, k) => {
    edges.push([[0, 1.0, 0], m], [[0, -1.0, 0], m], [m, inner[(k + 1) % 6]]);
  });
  for (let i = 0; i < count; i++) {
    const [a, b] = edges[Math.floor(r() * edges.length)];
    const t = r();
    const p = a.map((c, k) => c + (b[k] - c) * t + gauss(r) * 0.012);
    const ang = r() * TAU, el = Math.acos(2 * r() - 1), d = 3 + r() * 3;
    out.push({ end: p, start: [Math.sin(el) * Math.cos(ang) * d, Math.cos(el) * d, Math.sin(el) * Math.sin(ang) * d] });
  }
  return out;
}

// 852 · Open — a closed bud that unfolds into a flower
function open(count, r) {
  const out = [];
  const layers = [
    { rad: 2.15, petals: 8, cup: 0.55, phase: 0 },
    { rad: 1.5, petals: 8, cup: 0.9, phase: Math.PI / 8 },
    { rad: 0.85, petals: 6, cup: 1.1, phase: 0.3 },
  ];
  for (let i = 0; i < count; i++) {
    const L = layers[i % 3];
    const th = r() * TAU;
    const petal = Math.pow(Math.abs(Math.cos((L.petals / 2) * th + L.phase)), 0.7);
    const edge = r() < 0.45;
    const u = edge ? 1 : Math.pow(r(), 0.6);
    const rad = L.rad * (0.2 + 0.8 * petal) * u;
    const z = -L.cup * u * u + 0.4;
    const x = Math.cos(th) * rad, y = Math.sin(th) * rad;
    out.push({ end: [x, y, z], start: [x * 0.1, y * 0.1, z - 1.6 - u * 1.4] });
  }
  return out;
}

// 963 · Still — one thin ring and a point of light. Nothing moves.
function still(count, r) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const k = r();
    let p;
    if (k < 0.62) {
      const a = r() * TAU;
      const d = 2.0 + gauss(r) * 0.008;
      p = [Math.cos(a) * d, Math.sin(a) * d, 0];
    } else if (k < 0.8) {
      const a = r() * TAU, b = Math.acos(2 * r() - 1), d = 0.16 * Math.cbrt(r());
      p = [Math.sin(b) * Math.cos(a) * d, Math.cos(b) * d, Math.sin(b) * Math.sin(a) * d];
    } else {
      // a fine horizon line through the centre
      p = [(r() * 2 - 1) * 3.4, gauss(r) * 0.006, 0];
    }
    out.push({ end: p, start: p });
  }
  return out;
}

export const FORMS = [ground, soften, release, shift, returnForm, connect, clear, open, still];
export const FORM_R = R;
