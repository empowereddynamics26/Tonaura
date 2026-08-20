const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-1230s-OneDrive-Documents-Jatt-Tonaura-website/assets"
);
const OUT = path.join(ROOT, "public/images/app");
const MIRROR = path.join(ROOT, "tonaura-website/tonaura-website-final/images/app");

const W = 720;
const H = 1280;
const TAB_H = 118;

function tabBarSvg(activeIndex) {
  const labels = ["Orb", "Mixer", "Practice", "Presets"];
  const icons = [
    // simple concentric orb
    `<circle cx="0" cy="-10" r="3" fill="none" stroke="CURRENT" stroke-width="1.6"/><circle cx="0" cy="-10" r="7" fill="none" stroke="CURRENT" stroke-width="1.4"/><circle cx="0" cy="-10" r="1.6" fill="CURRENT"/>`,
    // mixer sliders
    `<rect x="-8" y="-16" width="3" height="14" rx="1" fill="CURRENT"/><rect x="-1.5" y="-12" width="3" height="10" rx="1" fill="CURRENT"/><rect x="5" y="-18" width="3" height="16" rx="1" fill="CURRENT"/>`,
    // sparkle / practice
    `<path d="M0 -18 L2 -8 L12 -8 L4 -2 L7 8 L0 3 L-7 8 L-4 -2 L-12 -8 L-2 -8 Z" fill="CURRENT"/>`,
    // layers / presets
    `<rect x="-10" y="-14" width="20" height="5" rx="1.5" fill="CURRENT" opacity="0.95"/><rect x="-10" y="-6" width="20" height="5" rx="1.5" fill="CURRENT" opacity="0.7"/><rect x="-10" y="2" width="20" height="5" rx="1.5" fill="CURRENT" opacity="0.45"/>`,
  ];
  const slot = W / 4;
  const items = labels
    .map((label, i) => {
      const x = slot * i + slot / 2;
      const on = i === activeIndex;
      const color = on ? "#C9A24B" : "#8E8AA0";
      const icon = icons[i].replaceAll("CURRENT", color);
      const mark = on
        ? `<rect x="${x - 11}" y="8" width="22" height="2.5" rx="1.25" fill="#C9A24B"/>`
        : "";
      return `
        <g transform="translate(${x}, 52)">
          ${mark}
          <g>${icon}</g>
          <text x="0" y="28" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="18" font-weight="500" fill="${color}">${label}</text>
        </g>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${TAB_H}" viewBox="0 0 ${W} ${TAB_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${TAB_H}" fill="#0B0C10"/>
  <line x1="0" y1="0.5" x2="${W}" y2="0.5" stroke="rgba(237,231,217,0.12)" stroke-width="1"/>
  ${items}
</svg>`;
}

async function stampScreen(srcName, outName, activeTab) {
  const src = path.join(ASSETS, srcName);
  const bar = Buffer.from(tabBarSvg(activeTab));
  const barPng = await sharp(bar).png().toBuffer();

  // Cover whatever wrong tabs exist, keep upper UI.
  const body = await sharp(src)
    .resize(W, H, { fit: "cover", position: "top" })
    .composite([
      {
        input: {
          create: {
            width: W,
            height: TAB_H + 8,
            channels: 4,
            background: { r: 11, g: 12, b: 16, alpha: 1 },
          },
        },
        top: H - TAB_H - 8,
        left: 0,
      },
      { input: barPng, top: H - TAB_H, left: 0 },
    ])
    .webp({ quality: 84 })
    .toBuffer();

  fs.writeFileSync(path.join(OUT, outName), body);
  fs.mkdirSync(MIRROR, { recursive: true });
  fs.writeFileSync(path.join(MIRROR, outName), body);
  console.log("wrote", outName);
}

async function stampAmbient(name, activeTab = 0) {
  const freshJpg = path.join(
    "C:/Users/1230s/OneDrive/Documents/Jatt/tonaura-app/tonaura-app/assets/ambients",
    `${name}.jpg`
  );
  const src = fs.existsSync(freshJpg) ? freshJpg : path.join(OUT, "ambients", `${name}.webp`);
  if (!fs.existsSync(src)) return;
  const bar = Buffer.from(tabBarSvg(activeTab));
  const barPng = await sharp(bar).png().toBuffer();
  const label = name === "nightsky" ? "Night sky" : name[0].toUpperCase() + name.slice(1);
  const ui = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#08080E" stop-opacity="0.2"/>
      <stop offset="55%" stop-color="#08080E" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#08080E" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${W / 2}" cy="${H * 0.38}" r="48" fill="none" stroke="#C9A24B" stroke-width="2" opacity="0.7"/>
  <circle cx="${W / 2}" cy="${H * 0.38}" r="88" fill="none" stroke="#4FB3A9" stroke-width="1.5" opacity="0.35"/>
  <circle cx="${W / 2}" cy="${H * 0.38}" r="128" fill="none" stroke="#C9A24B" stroke-width="1.2" opacity="0.22"/>
  <circle cx="${W / 2}" cy="${H * 0.38}" r="6" fill="#C9A24B"/>
  <text x="${W / 2}" y="${H - TAB_H - 110}" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#EDE7D9">${label}</text>
  <rect x="${W * 0.18}" y="${H - TAB_H - 88}" width="${W * 0.64}" height="56" rx="28" fill="#C9A24B"/>
  <text x="${W / 2}" y="${H - TAB_H - 52}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="600" letter-spacing="2" fill="#1A1608">PLAY</text>
</svg>`);

  const outAmb = path.join(OUT, "ambients");
  const mirrorAmb = path.join(MIRROR, "ambients");
  fs.mkdirSync(outAmb, { recursive: true });
  fs.mkdirSync(mirrorAmb, { recursive: true });

  const body = await sharp(src)
    .resize(W, H, { fit: "cover" })
    .composite([
      { input: await sharp(ui).png().toBuffer(), top: 0, left: 0 },
      { input: barPng, top: H - TAB_H, left: 0 },
    ])
    .webp({ quality: 82 })
    .toBuffer();

  fs.writeFileSync(path.join(outAmb, `${name}.webp`), body);
  fs.writeFileSync(path.join(mirrorAmb, `${name}.webp`), body);
  console.log("ambient", name);
}

(async () => {
  await stampScreen("app-mixer.png", "mixer.webp", 1);
  await stampScreen("app-orb.png", "orb.webp", 0);
  await stampScreen("app-practice.png", "practice.webp", 2);
  await stampScreen("app-presets.png", "presets.webp", 3);
  for (const a of ["winter", "autumn", "summer", "rain", "nightsky"]) {
    await stampAmbient(a, 0);
  }
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
