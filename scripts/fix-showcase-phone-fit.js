/**
 * Fix showcase phone screens:
 * - strip double tab bars (original + stamped)
 * - restamp a single clean 4-tab bar
 * - keep exact 720x1280 (9:16) for CSS frame match
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/images/app");
const MIRROR = path.join(ROOT, "tonaura-website/tonaura-website-final/images/app");
const W = 720;
const H = 1280;
const TAB_H = 112;
/** Approximate height of the leftover original tab strip above the stamp */
const OLD_TAB_H = 108;

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
          <text x="0" y="30" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="17" font-weight="500" fill="${color}">${label}</text>
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

async function fixScreen(fileName, activeTab) {
  const srcPath = path.join(OUT, fileName);
  const buf = fs.readFileSync(srcPath);
  const meta = await sharp(buf).metadata();
  const strip = TAB_H + OLD_TAB_H;
  const bodyH = Math.max(meta.height - strip, 800);
  const body = await sharp(buf)
    .extract({ left: 0, top: 0, width: meta.width, height: bodyH })
    .resize(W, H - TAB_H, { fit: "cover", position: "north" })
    .toBuffer();
  const bar = await barPng(activeTab);
  const out = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 11, g: 12, b: 16 } },
  })
    .composite([
      { input: body, top: 0, left: 0 },
      { input: bar, top: H - TAB_H, left: 0 },
    ])
    .webp({ quality: 88 })
    .toBuffer();

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(MIRROR, { recursive: true });
  const next = path.join(OUT, fileName.replace(".webp", ".next.webp"));
  fs.writeFileSync(next, out);
  try {
    fs.unlinkSync(srcPath);
  } catch (_) {}
  try {
    fs.renameSync(next, srcPath);
  } catch (_) {
    fs.copyFileSync(next, srcPath);
    try {
      fs.unlinkSync(next);
    } catch (__) {}
  }
  fs.writeFileSync(path.join(MIRROR, fileName), out);
  console.log("fixed", fileName);
}

(async () => {
  await fixScreen("mixer.webp", 1);
  await fixScreen("orb.webp", 0);
  await fixScreen("practice.webp", 2);
  await fixScreen("presets.webp", 3);
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
