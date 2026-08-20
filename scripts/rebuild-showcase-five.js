const fs = require("fs");
const path = require("path");

const files = [
  "public/index.html",
  "tonaura-website/tonaura-website-final/index.html",
].map((f) => path.join(process.cwd(), f));

const newCss = `  /* ---------- Product showcase ---------- */
  .showcase {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
    max-width: 1080px;
    margin: 0 auto;
    align-items: start;
  }
  @media (max-width: 980px) {
    .showcase {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      max-width: 640px;
    }
  }
  @media (max-width: 640px) {
    .showcase {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-width: 420px;
      gap: 14px;
    }
  }
  .phone-card { text-align: center; }
  .phone-frame {
    position: relative;
    width: 100%;
    max-width: 200px;
    margin: 0 auto 16px;
    border-radius: 22px;
    padding: 7px;
    background: linear-gradient(160deg, #1a1a24 0%, #0a0a10 55%, #14141c 100%);
    border: 1px solid rgba(237,231,217,0.12);
    box-shadow: 0 20px 48px -18px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .phone-frame::before {
    content: "";
    position: absolute;
    top: 11px; left: 50%;
    transform: translateX(-50%);
    width: 42px; height: 4px;
    border-radius: 999px;
    background: #050508;
    z-index: 4;
    pointer-events: none;
  }
  .phone-screen {
    position: relative;
    width: 100%;
    aspect-ratio: 9 / 16;
    border-radius: 16px;
    overflow: hidden;
    background: #12121A;
  }
  .phone-screen > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .ambient-slides {
    position: absolute;
    inset: 0;
  }
  .ambient-slides img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.9s ease;
  }
  .ambient-slides img.is-active { opacity: 1; }
  .ambient-ui {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 14% 10% 12%;
    background: linear-gradient(180deg, rgba(8,8,14,0.18) 0%, rgba(8,8,14,0.15) 45%, rgba(8,8,14,0.72) 100%);
    pointer-events: none;
  }
  .ambient-orb {
    width: 46%;
    aspect-ratio: 1;
    border-radius: 50%;
    margin-bottom: auto;
    margin-top: 18%;
    border: 1.5px solid rgba(201,162,75,0.55);
    box-shadow: 0 0 0 10px rgba(79,179,169,0.12), 0 0 0 20px rgba(201,162,75,0.08), inset 0 0 18px rgba(201,162,75,0.25);
    position: relative;
  }
  .ambient-orb::after {
    content: "";
    position: absolute;
    top: 50%; left: 50%;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--gold);
    transform: translate(-50%, -50%);
  }
  .ambient-name {
    font-family: 'Fraunces', serif;
    font-size: 13px;
    color: var(--cream);
    margin-bottom: 10px;
    letter-spacing: 0.02em;
  }
  .ambient-play {
    width: 78%;
    background: var(--gold);
    color: #1a1608;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    padding: 8px 10px;
    border-radius: 999px;
  }
  .phone-card h3 { font-size: 14px; margin-bottom: 5px; line-height: 1.25; }
  .phone-card p { font-size: 12px; color: var(--text-faint); line-height: 1.45; max-width: 190px; margin: 0 auto; }
  @media (prefers-reduced-motion: reduce) {
    .ambient-slides img { transition: none; }
  }
`;

const newSection = `<section id="inside">
  <div class="section-head">
    <div class="section-eyebrow">What's inside</div>
    <h2>Built to be used, not browsed</h2>
    <p>Four views of the app, then live ambiences cycling in the fifth.</p>
  </div>

  <div class="showcase">
    <article class="phone-card">
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="/images/app/mixer.webp" width="720" height="1280" alt="Tonaura mixer" loading="lazy" />
        </div>
      </div>
      <h3>The mixer</h3>
      <p>Ten pure tones in one breathing view.</p>
    </article>

    <article class="phone-card">
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="/images/app/orb.webp" width="720" height="1280" alt="Tonaura orb mode" loading="lazy" />
        </div>
      </div>
      <h3>Orb mode</h3>
      <p>One button, a few quick picks.</p>
    </article>

    <article class="phone-card">
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="/images/app/practice.webp" width="720" height="1280" alt="Tonaura practice streak" loading="lazy" />
        </div>
      </div>
      <h3>Practice</h3>
      <p>A streak for showing up.</p>
    </article>

    <article class="phone-card">
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="/images/app/presets.webp" width="720" height="1280" alt="Tonaura presets" loading="lazy" />
        </div>
      </div>
      <h3>Presets</h3>
      <p>Deep sleep, focus, morning reset.</p>
    </article>

    <article class="phone-card">
      <div class="phone-frame">
        <div class="phone-screen" data-ambient-phone>
          <div class="ambient-slides">
            <img src="/images/app/ambients/winter.webp" alt="" class="is-active" data-ambient-name="Winter" />
            <img src="/images/app/ambients/autumn.webp" alt="" data-ambient-name="Autumn" />
            <img src="/images/app/ambients/summer.webp" alt="" data-ambient-name="Summer" />
            <img src="/images/app/ambients/rain.webp" alt="" data-ambient-name="Rain" />
            <img src="/images/app/ambients/nightsky.webp" alt="" data-ambient-name="Night sky" />
          </div>
          <div class="ambient-ui">
            <div class="ambient-orb" aria-hidden="true"></div>
            <div class="ambient-name" data-ambient-label>Winter</div>
            <div class="ambient-play">Play</div>
          </div>
        </div>
      </div>
      <h3>Ambiences</h3>
      <p>Winter through night sky — the field behind your mix.</p>
    </article>
  </div>
</section>`;

const newJs = `
<script>
(function () {
  var phone = document.querySelector("[data-ambient-phone]");
  if (!phone) return;
  var slides = Array.prototype.slice.call(phone.querySelectorAll(".ambient-slides img"));
  var label = phone.querySelector("[data-ambient-label]");
  if (slides.length < 2) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i = 0;
  function tick() {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
    if (label) label.textContent = slides[i].getAttribute("data-ambient-name") || "";
  }
  if (!reduce) setInterval(tick, 3000);
})();
</script>
`;

const cssRe =
  /\/\* ---------- Product showcase ---------- \*\/[\s\S]*?(?=\/\* ---------- Honest section ---------- \*\/)/;
const sectionRe = /<section id="inside">[\s\S]*?<\/section>\s*(?=<section id="honest")/;
const oldScriptRe =
  /\n<script>\n\(function \(\) \{\n  var (?:root|phone) = document\.querySelector\("\[data-(?:showcase|ambient-phone)\]"\);[\s\S]*?<\/script>\n?/;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(cssRe, newCss + "\n");
  html = html.replace(sectionRe, newSection + "\n\n");
  html = html.replace(oldScriptRe, "\n");
  // Also strip any leftover showcase autofade script
  html = html.replace(
    /\n<script>\n\(function \(\) \{\n  var root = document\.querySelector\("\[data-showcase\]"\);[\s\S]*?<\/script>\n?/g,
    "\n"
  );
  html = html.replace(
    /\n<script>\n\(function \(\) \{\n  var phone = document\.querySelector\("\[data-ambient-phone\]"\);[\s\S]*?<\/script>\n?/g,
    "\n"
  );
  if (file.includes("tonaura-website-final")) {
    html = html.replaceAll('src="/images/app/', 'src="images/app/');
  }
  html = html.replace("</body>", newJs + "\n</body>");
  fs.writeFileSync(file, html);
  console.log("updated", path.relative(process.cwd(), file));
}

// Mirror assets into static copy
const mirrorApp = path.join(process.cwd(), "tonaura-website/tonaura-website-final/images/app");
const mirrorAmb = path.join(mirrorApp, "ambients");
fs.mkdirSync(mirrorAmb, { recursive: true });
for (const f of ["mixer.webp", "orb.webp", "practice.webp", "presets.webp"]) {
  fs.copyFileSync(path.join(process.cwd(), "public/images/app", f), path.join(mirrorApp, f));
}
for (const f of ["winter", "autumn", "summer", "rain", "nightsky"]) {
  fs.copyFileSync(
    path.join(process.cwd(), "public/images/app/ambients", f + ".webp"),
    path.join(mirrorAmb, f + ".webp")
  );
}
console.log("mirrored images");
