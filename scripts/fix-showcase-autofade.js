const fs = require("fs");
const path = require("path");

const files = [
  "public/index.html",
  "tonaura-website/tonaura-website-final/index.html",
].map((f) => path.join(process.cwd(), f));

const newCss = `  /* ---------- Product showcase ---------- */
  .showcase-stage {
    max-width: 420px;
    margin: 0 auto;
    text-align: center;
  }
  .showcase-phone {
    position: relative;
    width: min(240px, 72vw);
    margin: 0 auto 22px;
    border-radius: 26px;
    padding: 8px;
    background: linear-gradient(160deg, #1a1a24 0%, #0a0a10 55%, #14141c 100%);
    border: 1px solid rgba(237,231,217,0.12);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .showcase-phone::before {
    content: "";
    position: absolute;
    top: 12px; left: 50%;
    transform: translateX(-50%);
    width: 52px; height: 5px;
    border-radius: 999px;
    background: #050508;
    z-index: 3;
    pointer-events: none;
  }
  .showcase-slides {
    position: relative;
    width: 100%;
    border-radius: 18px;
    overflow: hidden;
    background: #12121A;
    aspect-ratio: 9 / 16;
  }
  .showcase-slides img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center top;
    opacity: 0;
    transform: scale(1.03);
    transition: opacity 0.85s ease, transform 1.1s ease;
    pointer-events: none;
  }
  .showcase-slides img.is-active {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
  }
  .showcase-copy {
    min-height: 4.6em;
  }
  .showcase-copy h3 {
    font-size: 17px;
    margin-bottom: 6px;
    transition: opacity 0.35s ease;
  }
  .showcase-copy p {
    font-size: 14px;
    color: var(--text-faint);
    line-height: 1.55;
    max-width: 320px;
    margin: 0 auto;
    transition: opacity 0.35s ease;
  }
  .showcase-copy.is-fading h3,
  .showcase-copy.is-fading p { opacity: 0; }
  .showcase-progress {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 18px;
  }
  .showcase-progress span {
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: rgba(237,231,217,0.18);
    overflow: hidden;
    position: relative;
  }
  .showcase-progress span::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--gold);
    transform: scaleX(0);
    transform-origin: left center;
  }
  .showcase-progress span.is-active::after {
    animation: showcaseFill 4.2s linear forwards;
  }
  @keyframes showcaseFill {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .showcase-slides img { transition: none; transform: none; }
    .showcase-progress span.is-active::after { transform: scaleX(1); animation: none; }
  }
`;

const newSection = `<section id="inside">
  <div class="section-head">
    <div class="section-eyebrow">What's inside</div>
    <h2>Built to be used, not browsed</h2>
    <p>Five screens from the app — mix, orb, practice, presets, and your account.</p>
  </div>

  <div class="showcase-stage" data-showcase>
    <div class="showcase-phone">
      <div class="showcase-slides" data-showcase-slides>
        <img src="/images/app/mixer.webp" width="720" height="1280" alt="Mixer" data-title="The mixer" data-copy="Ten pure tones in one breathing view — build a field, then press play." class="is-active" />
        <img src="/images/app/orb.webp" width="720" height="1280" alt="Orb mode" data-title="Orb mode" data-copy="One button, a few quick picks, nothing to figure out." />
        <img src="/images/app/practice.webp" width="720" height="1280" alt="Practice streak" data-title="Practice, not sleep score" data-copy="A streak for showing up — never for how well you slept." />
        <img src="/images/app/presets.webp" width="720" height="1280" alt="Presets" data-title="Presets" data-copy="Deep sleep, focus, morning reset — load a blend and go." />
        <img src="/images/app/account.webp" width="720" height="1280" alt="Account and Premium" data-title="Account &amp; Premium" data-copy="Same email as the website. Subscribe once, unlock on your phone." />
      </div>
    </div>
    <div class="showcase-copy" data-showcase-copy>
      <h3 data-showcase-title>The mixer</h3>
      <p data-showcase-text>Ten pure tones in one breathing view — build a field, then press play.</p>
    </div>
    <div class="showcase-progress" data-showcase-progress aria-hidden="true"></div>
  </div>
</section>`;

const newJs = `
<script>
(function () {
  var root = document.querySelector("[data-showcase]");
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-showcase-slides] img"));
  var titleEl = root.querySelector("[data-showcase-title]");
  var textEl = root.querySelector("[data-showcase-text]");
  var copyEl = root.querySelector("[data-showcase-copy]");
  var progress = root.querySelector("[data-showcase-progress]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;
  var INTERVAL = 4200;

  slides.forEach(function () {
    progress.appendChild(document.createElement("span"));
  });
  var bars = Array.prototype.slice.call(progress.children);

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (img, n) { img.classList.toggle("is-active", n === index); });
    bars.forEach(function (b, n) {
      b.classList.remove("is-active");
      void b.offsetWidth;
      if (n === index) b.classList.add("is-active");
    });
    var slide = slides[index];
    if (!copyEl || !titleEl || !textEl) return;
    copyEl.classList.add("is-fading");
    window.setTimeout(function () {
      titleEl.textContent = slide.getAttribute("data-title") || "";
      textEl.textContent = slide.getAttribute("data-copy") || "";
      copyEl.classList.remove("is-fading");
    }, reduce ? 0 : 220);
  }

  function tick() { show(index + 1); }

  function start() {
    if (reduce) return;
    clearInterval(timer);
    timer = setInterval(tick, INTERVAL);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) clearInterval(timer);
    else start();
  });

  show(0);
  start();
})();
</script>
`;

const cssRe =
  /\/\* ---------- Product showcase ---------- \*\/[\s\S]*?(?=\/\* ---------- Honest section ---------- \*\/)/;
const sectionRe = /<section id="inside">[\s\S]*?<\/section>\s*(?=<section id="honest")/;
const oldScriptRe = /\n<script>\n\(function \(\) \{\n  var root = document\.querySelector\("\[data-showcase\]"\);[\s\S]*?<\/script>\n?/;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  if (!cssRe.test(html)) throw new Error("CSS missing: " + file);
  if (!sectionRe.test(html)) throw new Error("section missing: " + file);
  html = html.replace(cssRe, newCss + "\n");
  html = html.replace(sectionRe, newSection + "\n\n");
  html = html.replace(oldScriptRe, "\n");
  if (file.includes("tonaura-website-final")) {
    html = html.replaceAll('src="/images/app/', 'src="images/app/');
  }
  if (!html.includes("</body>")) throw new Error("no body: " + file);
  html = html.replace("</body>", newJs + "\n</body>");
  fs.writeFileSync(file, html);
  console.log("updated", path.relative(process.cwd(), file));
}
