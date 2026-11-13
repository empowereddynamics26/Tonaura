// Geometry + WebGL for the homepage descent. No React in here.
//
// World: the camera travels along +z.
//   · four open rings (the Tonaura mark) spaced in depth, so from the start
//     they read as the logo and then fly past like a tunnel
//   · nine sand plates, one per tone, each a Chladni figure at its own depth
//   · dust floating at every depth for parallax
// Everything is static in the buffers; the vertex shader moves it from
// uniforms (camera, time), so a frame is one draw call.

import { NINE } from "@/lib/tones";

const TAU = Math.PI * 2;

// (n, m, sign) per tone — figures get busier as the pitch rises
const MODES = [
  [1, 2, -1], [1, 3, 1], [2, 3, -1], [1, 4, -1], [2, 5, 1],
  [3, 4, -1], [2, 6, 1], [3, 5, -1], [4, 7, -1],
];

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Points on the nodal lines of a square-plate mode, clipped to a disc.
function chladniCells(n, m, sign) {
  const G = 300;
  const f = new Float32Array(G * G);
  for (let j = 0; j < G; j++) {
    const v = j / (G - 1);
    for (let i = 0; i < G; i++) {
      const u = i / (G - 1);
      f[j * G + i] =
        Math.cos(n * Math.PI * u) * Math.cos(m * Math.PI * v) +
        sign * Math.cos(m * Math.PI * u) * Math.cos(n * Math.PI * v);
    }
  }
  const h = 2 / (G - 1);
  const cells = [];
  for (let j = 1; j < G - 1; j++) {
    for (let i = 1; i < G - 1; i++) {
      const x = -1 + i * h;
      const y = -1 + j * h;
      if (x * x + y * y > 0.92) continue;
      const k = j * G + i;
      const gx = (f[k + 1] - f[k - 1]) / (2 * h);
      const gy = (f[k + G] - f[k - G]) / (2 * h);
      if (Math.abs(f[k]) / (Math.hypot(gx, gy) + 1e-4) < 0.012) cells.push(x, y);
    }
  }
  return { cells, h };
}

export const PLATE_R = 2.2;
export const FOCAL = 2.14; // ≈ 50° vertical field of view

/**
 * Layout depends on the screen shape: on a tall phone the camera has to
 * stand further back for a plate to fit the width.
 */
export function layoutFor(aspect) {
  const fit = Math.min(1, aspect * 0.92);
  const hold = (PLATE_R * FOCAL) / (0.74 * fit); // camera distance while a tone holds
  const spacing = hold * 2.3;
  const plate0 = 22 + hold;
  const ringK = (0.44 * Math.min(1, aspect * 1.5)) / FOCAL;
  return { hold, spacing, plate0, ringK, end: plate0 + spacing * 8 };
}

export function buildGeometry(aspect, small) {
  const L = layoutFor(aspect);
  const perPlate = small ? 3400 : 7500;
  const rim = small ? 500 : 900;
  const perRing = small ? 1400 : 2600;
  const dust = small ? 3000 : 7000;
  const total = 9 * (perPlate + rim) + 4 * perRing + 900 + dust;

  const pos = new Float32Array(total * 3);
  const rnd = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const info = new Float32Array(total * 3); // kind, size, seed
  let o = 0;
  const r = rng(20261113);
  function put(x, y, z, rx, ry, rz, c, kind, size) {
    pos[o * 3] = x; pos[o * 3 + 1] = y; pos[o * 3 + 2] = z;
    rnd[o * 3] = rx; rnd[o * 3 + 1] = ry; rnd[o * 3 + 2] = rz;
    col[o * 3] = c[0] / 255; col[o * 3 + 1] = c[1] / 255; col[o * 3 + 2] = c[2] / 255;
    info[o * 3] = kind; info[o * 3 + 1] = size; info[o * 3 + 2] = r();
    o++;
  }

  const GOLD = [226, 184, 108];
  const TEAL = [96, 196, 184];

  // --- rings (kind 0): the mark, spread in depth
  const ratios = [0.82, 0.62, 0.42, 0.22];
  ratios.forEach((ratio, i) => {
    const z = 6 + i * 3;
    const rad = ratio * z * L.ringK;
    const c = [0, 1, 2].map((ch) => GOLD[ch] + (TEAL[ch] - GOLD[ch]) * (1 - i / 3));
    for (let p = 0; p < perRing; p++) {
      const a = (0.26 + r() * 0.69) * TAU;
      const d = rad * (1 + (r() - 0.5) * 0.035);
      put(Math.cos(a) * d, Math.sin(a) * d, z + (r() - 0.5) * 0.15, 0, 0, 0, c, 0, 0.02 + r() * 0.025);
    }
  });
  // the bright centre of the mark
  {
    const z = 18;
    const rad = 0.09 * z * L.ringK;
    for (let p = 0; p < 900; p++) {
      const a = r() * TAU;
      const b = Math.acos(2 * r() - 1);
      const d = rad * Math.cbrt(r());
      put(Math.sin(b) * Math.cos(a) * d, Math.sin(b) * Math.sin(a) * d, z + Math.cos(b) * d, 0, 0, 0, [255, 214, 140], 0, 0.03 + r() * 0.03);
    }
  }

  // --- plates (kind 1) and their rims (kind 3)
  NINE.forEach((tone, k) => {
    const [n, m, s] = MODES[k];
    const { cells, h } = chladniCells(n, m, s);
    const nCells = cells.length / 2;
    const z = L.plate0 + k * L.spacing;
    const c = tone.rgb;
    const bright = c.map((v) => Math.min(255, v + 45));
    for (let p = 0; p < perPlate; p++) {
      const ci = Math.floor(r() * nCells) * 2;
      const x = (cells[ci] + (r() - 0.5) * h * 1.7) * PLATE_R;
      const y = (cells[ci + 1] + (r() - 0.5) * h * 1.7) * PLATE_R;
      const hot = r() < 0.1;
      put(x, y, z, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, hot ? bright : c, 1, hot ? 0.03 : 0.017 + r() * 0.008);
    }
    for (let p = 0; p < rim; p++) {
      const a = r() * TAU;
      const d = PLATE_R * (1.07 + (r() - 0.5) * 0.02);
      put(Math.cos(a) * d, Math.sin(a) * d, z, 0, 0, 0, c, 3, 0.014);
    }
  });

  // --- dust (kind 2)
  for (let p = 0; p < dust; p++) {
    const a = r() * TAU;
    const d = 1.2 + Math.pow(r(), 0.8) * 8;
    const z = r() * (L.end + 40);
    const t = Math.min(1, Math.max(0, (z - L.plate0) / (L.end - L.plate0)));
    const c = [0, 1, 2].map((ch) => GOLD[ch] + (TEAL[ch] - GOLD[ch]) * t);
    put(Math.cos(a) * d, Math.sin(a) * d, z, 0, 0, 0, c, 2, 0.02 + r() * 0.05);
  }

  return { pos, rnd, col, info, count: o, layout: L };
}

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aRnd;
layout(location=2) in vec3 aCol;
layout(location=3) in vec3 aInfo;
uniform vec3 uCam;      // camera x, y, z
uniform float uRoll;
uniform float uAspect;
uniform float uPx;      // canvas height in device px
uniform float uTime;
uniform vec2 uShift;    // screen-space offset of the vanishing point
uniform float uHold;
uniform float uFade;    // global fade (worlds take over)
uniform float uEnergy;  // 0..1, how fast the camera is moving
out vec3 vCol;
out float vA;
const float F = ${FOCAL.toFixed(3)};
void main() {
  float kind = aInfo.x;
  float seed = aInfo.z;
  vec3 p = aPos;
  float d = aPos.z - uCam.z;
  float glow = 1.0;
  if (kind == 1.0) {
    float settle = smoothstep(uHold * 2.5, uHold * 1.12, d);
    float burst = smoothstep(uHold * 0.7, 0.3, d);
    // the plate turns slowly as you come in
    float ang = d * 0.05;
    float c = cos(ang), s = sin(ang);
    p.xy = mat2(c, -s, s, c) * p.xy;
    // loose sand hangs in a cloud until the tone takes hold
    vec3 cloud = aRnd * vec3(2.4, 2.4, uHold * 0.9);
    cloud.xy += vec2(sin(seed * 40.0 + uTime * 0.4), cos(seed * 31.0 + uTime * 0.35)) * 0.25;
    p += cloud * (1.0 - settle) * (1.0 - settle);
    // ...and is thrown outward as the camera passes through
    vec2 dir = normalize(p.xy + vec2(0.0001));
    p.xy += dir * burst * burst * (2.5 + seed * 3.0);
    p.z -= burst * seed * 1.5;
    // a ringing plate never sits perfectly still
    p.xy += vec2(sin(uTime * 9.0 + seed * 90.0), cos(uTime * 8.0 + seed * 70.0)) * 0.006 * settle;
    glow = 0.6 + 0.4 * settle;
  } else if (kind == 0.0) {
    float ang = uTime * 0.05 * (0.5 + fract(aPos.z * 0.37));
    float c = cos(ang), s = sin(ang);
    p.xy = mat2(c, -s, s, c) * p.xy;
  } else if (kind == 2.0) {
    p.xy += vec2(sin(uTime * 0.2 + seed * 60.0), cos(uTime * 0.17 + seed * 50.0)) * 0.3;
    glow = 0.45 + 0.55 * sin(uTime * 1.3 + seed * 100.0);
  }
  vec3 v = p - uCam;
  float cr = cos(uRoll), sr = sin(uRoll);
  v.xy = mat2(cr, -sr, sr, cr) * v.xy;
  if (v.z < 0.12) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
  vec2 s2 = v.xy * F / v.z;
  gl_Position = vec4(s2.x / uAspect + uShift.x, s2.y + uShift.y, 0.0, 1.0);
  float size = aInfo.y * uPx * F / v.z * 0.5;
  // moving fast stretches the look a little: bigger, softer grains
  size *= 1.0 + uEnergy * 0.6;
  float maxS = uPx * 0.06;
  gl_PointSize = clamp(size, 1.0, maxS);
  float fog = exp(-max(v.z - uHold * 1.15, 0.0) * 0.045);
  float near = smoothstep(0.12, 1.4, v.z);
  float big = min(1.0, 5.0 / max(size, 1.0));   // out-of-focus grains go faint
  float tiny = min(1.0, size);                   // sub-pixel grains dim instead of popping
  vA = fog * near * mix(1.0, big, 0.85) * tiny * glow * uFade * (kind == 2.0 ? 0.8 : 0.85);
  vCol = aCol;
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec3 vCol;
in float vA;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * vA;
  o = vec4(vCol * a, a);
}`;

// Screen-space weather for the Theme Pack worlds.
const WVERT = `#version 300 es
precision highp float;
layout(location=0) in vec4 aSeed;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform float uPx;
uniform vec2 uDir;     // drift per second, in screens
uniform float uSway;
uniform vec2 uSize;    // min, max px (at 1x)
uniform float uTwinkle;
uniform float uAlpha;
out float vA;
void main() {
  float depth = 0.35 + aSeed.z * 0.65;
  vec2 p = aSeed.xy + uDir * (uTime + uScroll) * depth;
  p.x += sin(uTime * (0.6 + aSeed.w) + aSeed.w * 30.0) * uSway * depth;
  p = fract(p) * 2.0 - 1.0;
  gl_Position = vec4(p * 1.05, 0.0, 1.0);
  gl_PointSize = mix(uSize.x, uSize.y, depth * depth) * uPx / 800.0;
  float tw = mix(1.0, 0.5 + 0.5 * sin(uTime * (1.0 + aSeed.w * 2.0) + aSeed.w * 60.0), uTwinkle);
  vA = uAlpha * tw * (0.35 + 0.65 * depth);
}`;

const WFRAG = `#version 300 es
precision mediump float;
in float vA;
uniform vec3 uColor;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vA;
  o = vec4(uColor * a, a);
}`;

function program(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function uniforms(gl, p, names) {
  const u = {};
  names.forEach((n) => (u[n] = gl.getUniformLocation(p, n)));
  return u;
}

export const WEATHER = [
  { dir: [0.015, -0.07], sway: 0.012, size: [2, 9], color: [1, 1, 1], twinkle: 0, alpha: 0.8, count: 1 },        // snow
  { dir: [0.05, -0.05], sway: 0.03, size: [4, 13], color: [1, 0.55, 0.2], twinkle: 0.3, alpha: 0.75, count: 0.35 }, // leaves
  { dir: [0.006, 0.015], sway: 0.01, size: [3, 16], color: [1, 0.92, 0.6], twinkle: 0.8, alpha: 0.5, count: 0.3 },  // sun motes
  { dir: [-0.12, -0.95], sway: 0, size: [1.5, 3.5], color: [0.7, 0.85, 1], twinkle: 0, alpha: 0.55, count: 1 },    // rain
  { dir: [0.001, 0.0005], sway: 0, size: [1.5, 5], color: [0.9, 0.95, 1], twinkle: 1, alpha: 0.95, count: 0.8 },   // stars
];

export function createRenderer(canvas, small) {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
  if (!gl) return null;
  const prog = program(gl, VERT, FRAG);
  const U = uniforms(gl, prog, ["uCam", "uRoll", "uAspect", "uPx", "uTime", "uShift", "uHold", "uFade", "uEnergy"]);
  const wprog = program(gl, WVERT, WFRAG);
  const W = uniforms(gl, wprog, ["uTime", "uScroll", "uAspect", "uPx", "uDir", "uSway", "uSize", "uTwinkle", "uAlpha", "uColor"]);

  const vao = gl.createVertexArray();
  const buffers = [0, 1, 2, 3].map(() => gl.createBuffer());
  let count = 0;
  let layout = null;
  let builtAspect = 0;

  function build(aspect) {
    const g = buildGeometry(aspect, small);
    gl.bindVertexArray(vao);
    [g.pos, g.rnd, g.col, g.info].forEach((data, i) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0);
    });
    count = g.count;
    layout = g.layout;
    builtAspect = aspect;
  }

  // weather seeds
  const WN = small ? 700 : 1400;
  const wvao = gl.createVertexArray();
  gl.bindVertexArray(wvao);
  const wbuf = gl.createBuffer();
  const seeds = new Float32Array(WN * 4);
  const r = rng(77);
  for (let i = 0; i < seeds.length; i++) seeds[i] = r();
  gl.bindBuffer(gl.ARRAY_BUFFER, wbuf);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  return {
    get layout() { return layout; },
    resize() {
      const dpr = Math.min(small ? 1.5 : 1.75, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      const aspect = w / h;
      if (!layout || Math.abs(aspect - builtAspect) / builtAspect > 0.08) build(aspect);
      return aspect;
    },
    draw(s) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      const aspect = canvas.width / canvas.height;
      if (s.fade > 0.002) {
        gl.useProgram(prog);
        gl.bindVertexArray(vao);
        gl.uniform3f(U.uCam, s.cx, s.cy, s.cz);
        gl.uniform1f(U.uRoll, s.roll);
        gl.uniform1f(U.uAspect, aspect);
        gl.uniform1f(U.uPx, canvas.height);
        gl.uniform1f(U.uTime, s.time);
        gl.uniform2f(U.uShift, s.shiftX, s.shiftY);
        gl.uniform1f(U.uHold, layout.hold);
        gl.uniform1f(U.uFade, s.fade);
        gl.uniform1f(U.uEnergy, s.energy);
        gl.drawArrays(gl.POINTS, 0, count);
      }
      if (s.weatherAlpha > 0.002) {
        const w = WEATHER[s.weather];
        gl.useProgram(wprog);
        gl.bindVertexArray(wvao);
        gl.uniform1f(W.uTime, s.time);
        gl.uniform1f(W.uScroll, s.scroll);
        gl.uniform1f(W.uAspect, aspect);
        gl.uniform1f(W.uPx, canvas.height);
        gl.uniform2f(W.uDir, w.dir[0], w.dir[1]);
        gl.uniform1f(W.uSway, w.sway);
        gl.uniform2f(W.uSize, w.size[0], w.size[1]);
        gl.uniform1f(W.uTwinkle, w.twinkle);
        gl.uniform1f(W.uAlpha, w.alpha * s.weatherAlpha);
        gl.uniform3f(W.uColor, w.color[0], w.color[1], w.color[2]);
        gl.drawArrays(gl.POINTS, 0, Math.round(WN * w.count));
      }
    },
    destroy() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
