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
const AMBIENT_SRC = "C:/Users/1230s/OneDrive/Documents/Jatt/tonaura-app/tonaura-app/assets/ambients";

const W = 720;
const H = 1280;
const TAB_H = 112;

function tabBarSvg(activeIndex) {
  const labels = ["Orb", "Mixer", "Practice", "Presets"];
  const slot = W / 4;
  const items = labels
    .map((label, i) => {
      const x = Math.round(slot * i + slot / 2);
      const on = i === activeIndex;
      const color = on ? "#C9A24B" : "#8E8AA0";
      let icon = "";
      if (i === 0) {
        icon = `<circle cx="0" cy="-12" r="2.2" fill="${color}"/><circle cx="0" cy="-12" r="6" fill="none" stroke="${color}" stroke-width="1.5"/><circle cx="0" cy="-12" r="10" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.75"/>`;
      } else if (i === 1) {
        icon = `<rect x="-9" y="-18" width="3.5" height="14" rx="1" fill="${color}"/><rect x="-1.75" y="-14" width="3.5" height="10" rx="1" fill="${color}"/><rect x="5.5" y="-20" width="3.5" height="16" rx="1" fill="${color}"/>`;
      } else if (i === 2) {
        icon = `<path d="M0 -20 L2.2 -9 L13 -9 L4.2 -2 L7.5 9 L0 3.5 L-7.5 9 L-4.2 -2 L-13 -9 L-2.2 -9 Z" fill="${color}"/>`;
      } else {
        icon = `<rect x="-11" y="-16" width="22" height="4.5" rx="1.2" fill="${color}"/><rect x="-11" y="-8" width="22" height="4.5" rx="1.2" fill="${color}" opacity="0.75"/><rect x="-11" y="0" width="22" height="4.5" rx="1.2" fill="${color}" opacity="0.5"/>`;
      }
      const mark = on
        ? `<rect x="${x - 12}" y="6" width="24" height="2.5" rx="1.25" fill="#C9A24B"/>`
        : "";
      return `${mark}
        <g transform="translate(${x}, 48)">
          ${icon}
          <text x="0" y="30" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="500" fill="${color}">${label}</text>
        </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${TAB_H}" viewBox="0 0 ${W} ${TAB_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${TAB_H}" fill="#0B0C10"/>
  <rect x="0" y="0" width="${W}" height="1" fill="rgba(237,231,217,0.12)"/>
  ${items}
</svg>`;
}

async function barPng(active) {
  return sharp(Buffer.from(tabBarSvg(active))).png().toBuffer();
}

async function stampScreen(srcName, outName, activeTab) {
  const src = path.join(ASSETS, srcName);
  const bar = await barPng(activeTab);
  const body = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([
      {
        input: {
          create: {
            width: W,
            height: TAB_H + 6,
            channels: 4,
            background: { r: 11, g: 12, b: 16, alpha: 1 },
          },
        },
        top: H - TAB_H - 6,
        left: 0,
      },
      { input: bar, top: H - TAB_H, left: 0 },
    ])
    .webp({ quality: 85 })
    .toBuffer();
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(MIRROR, { recursive: true });
  fs.writeFileSync(path.join(OUT, outName), body);
  fs.writeFileSync(path.join(MIRROR, outName), body);
  console.log("screen", outName);
}

async function stampAmbient(name, activeTab = 0) {
  const jpg = path.join(AMBIENT_SRC, `${name}.jpg`);
  const label = name === "nightsky" ? "Night sky" : name[0].toUpperCase() + name.slice(1);
  const ui = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#08080E" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#08080E" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#08080E" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${W / 2}" cy="${Math.round(H * 0.36)}" r="52" fill="none" stroke="#C9A24B" stroke-width="2.2" opacity="0.75"/>
  <circle cx="${W / 2}" cy="${Math.round(H * 0.36)}" r="92" fill="none" stroke="#4FB3A9" stroke-width="1.6" opacity="0.4"/>
  <circle cx="${W / 2}" cy="${Math.round(H * 0.36)}" r="132" fill="none" stroke="#C9A24B" stroke-width="1.2" opacity="0.25"/>
  <circle cx="${W / 2}" cy="${Math.round(H * 0.36)}" r="7" fill="#C9A24B"/>
  <text x="${W / 2}" y="${H - TAB_H - 118}" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#EDE7D9">${label}</text>
  <rect x="${Math.round(W * 0.16)}" y="${H - TAB_H - 96}" width="${Math.round(W * 0.68)}" height="58" rx="29" fill="#C9A24B"/>
  <text x="${W / 2}" y="${H - TAB_H - 58}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="#1A1608">PLAY</text>
</svg>`);
  const bar = await barPng(activeTab);
  const outAmb = path.join(OUT, "ambients");
  const mirrorAmb = path.join(MIRROR, "ambients");
  fs.mkdirSync(outAmb, { recursive: true });
  fs.mkdirSync(mirrorAmb, { recursive: true });
  const body = await sharp(jpg)
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([
      { input: await sharp(ui).png().toBuffer(), top: 0, left: 0 },
      { input: bar, top: H - TAB_H, left: 0 },
    ])
    .webp({ quality: 84 })
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
