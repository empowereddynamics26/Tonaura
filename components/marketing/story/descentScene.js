// Geometry + WebGL for the homepage descent. No React in here.
//
// World: the camera travels along +z.
//   · four open rings (the Tonaura mark) spaced in depth, so from the start
//     they read as the logo and then fly past like a tunnel
//   · nine forms, one per tone (see toneForms.js), each at its own depth
//   · dust floating at every depth for parallax
// Everything is static in the buffers; the vertex shader moves it from
// uniforms (camera, time), so a frame is one draw call.

import { NINE } from "@/lib/tones";
import { FORMS } from "./toneForms";

const TAU = Math.PI * 2;

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
  const perRing = small ? 1400 : 2600;
  const dust = small ? 3000 : 7000;
  const total = 9 * perPlate + 4 * perRing + 900 + dust;

  const pos = new Float32Array(total * 3);
  const rnd = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const info = new Float32Array(total * 3); // kind, size, seed
  const cen = new Float32Array(total * 2); // form centre z, form index
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

  // --- the nine forms (kind 1): aPos = finished shape, aRnd = where it waits
  NINE.forEach((tone, k) => {
    const z = L.plate0 + k * L.spacing;
    const c = tone.rgb;
    const bright = c.map((v) => Math.min(255, v + 45));
    FORMS[k](perPlate, r).forEach((pt) => {
      const hot = r() < 0.1;
      cen[o * 2] = z;
      cen[o * 2 + 1] = k;
      put(pt.end[0], pt.end[1], pt.end[2], pt.start[0], pt.start[1], pt.start[2], hot ? bright : c, 1, hot ? 0.032 : 0.018 + r() * 0.01);
    });
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

  return { pos, rnd, col, info, cen, count: o, layout: L };
}

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aRnd;
layout(location=2) in vec3 aCol;
layout(location=3) in vec3 aInfo;
layout(location=4) in vec2 aCen;
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
    float f = aCen.y;
    d = aCen.x - uCam.z;
    float settle = smoothstep(uHold * 2.3, uHold * 1.05, d);
    // particles arrive one after another, not all at once
    float t = clamp(settle * 1.6 - seed * 0.6, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 l = mix(aRnd, aPos, t);
    float pass = smoothstep(uHold * 0.75, 0.0, d);
    if (f == 0.0) {
      // the ground rolls like a slow swell, and falls away as you leave
      l.y += (sin(l.x * 1.3 + uTime * 0.8) * 0.1 + sin(l.z * 1.7 + uTime * 0.6) * 0.08) * t;
      l.y -= pass * pass * 2.5;
    } else if (f == 1.0) {
      l *= 1.0 + 0.06 * sin(uTime * 0.9 + seed * 6.28);
      l.xy *= 1.0 + pass * 1.6;
    } else if (f == 2.0) {
      l.xz *= 1.0 + 0.04 * sin(uTime * 1.4 + seed * 20.0);
      l.xy *= 1.0 + pass * 1.2;
    } else if (f == 8.0) {
      l.xy *= 1.0 + pass * 0.9;
    } else {
      l.xy *= 1.0 + pass * 1.3;
    }
    // each form turns at its own pace
    float sy = f == 1.0 ? 0.1 : f == 2.0 ? 0.15 : f == 3.0 ? 0.3 : f == 5.0 ? 0.5 : f == 6.0 ? 0.3 : 0.0;
    float sz = f == 3.0 ? 0.2 : f == 4.0 ? 0.15 : f == 6.0 ? 0.1 : f == 7.0 ? 0.05 : 0.0;
    float az = uTime * sz + (f == 4.0 ? (1.0 - t) * 2.0 : 0.0);
    float ay = uTime * sy;
    float cz = cos(az), szn = sin(az);
    l.xy = mat2(cz, -szn, szn, cz) * l.xy;
    float cy = cos(ay), syn = sin(ay);
    l.xz = mat2(cy, -syn, syn, cy) * l.xz;
    p = vec3(l.xy, aCen.x + l.z);
    glow = 0.25 + 0.75 * t;
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
  const buffers = [0, 1, 2, 3, 4].map(() => gl.createBuffer());
  let count = 0;
  let layout = null;
  let builtAspect = 0;

  function build(aspect) {
    const g = buildGeometry(aspect, small);
    gl.bindVertexArray(vao);
    [g.pos, g.rnd, g.col, g.info, g.cen].forEach((data, i) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, i === 4 ? 2 : 3, gl.FLOAT, false, 0, 0);
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
