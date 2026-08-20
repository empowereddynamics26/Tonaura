const fs = require("fs");
const path = require("path");

const files = [
  "public/index.html",
  "tonaura-website/tonaura-website-final/index.html",
].map((f) => path.join(process.cwd(), f));

const newCss = `  /* ---------- Product showcase ---------- */
  .showcase-stage {
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
  }
  .showcase-track {
    display: flex;
    gap: 22px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    padding: 12px 8% 28px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .showcase-track::-webkit-scrollbar { display: none; }
  .phone-card {
    text-align: center;
    flex: 0 0 min(72vw, 260px);
    scroll-snap-align: center;
    opacity: 0.45;
    transform: scale(0.92) translateY(10px);
    transition: opacity 0.55s ease, transform 0.55s ease, filter 0.55s ease;
    filter: saturate(0.85);
  }
  .phone-card.is-active {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: none;
  }
  .phone-frame {
    position: relative;
    width: 100%;
    max-width: 260px;
    margin: 0 auto 20px;
    border-radius: 28px;
    padding: 10px;
    background: linear-gradient(160deg, #1a1a24 0%, #0a0a10 55%, #14141c 100%);
    border: 1px solid rgba(237,231,217,0.12);
    box-shadow: 0 28px 70px -24px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .phone-frame::before {
    content: "";
    position: absolute;
    top: 14px; left: 50%;
    transform: translateX(-50%);
    width: 64px; height: 6px;
    border-radius: 999px;
    background: #050508;
    z-index: 2;
  }
  .phone-frame img {
    display: block;
    width: 100%;
    aspect-ratio: 9 / 19.5;
    object-fit: cover;
    border-radius: 20px;
    background: #12121A;
  }
  .phone-card h3 { font-size: 17px; margin-bottom: 6px; }
  .phone-card p { font-size: 13px; color: var(--text-faint); line-height: 1.55; max-width: 240px; margin: 0 auto; }
  .showcase-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 4px;
  }
  .showcase-dot {
    width: 7px; height: 7px; border-radius: 50%;
    border: 0; padding: 0; cursor: pointer;
    background: rgba(237,231,217,0.22);
    transition: background 0.35s ease, transform 0.35s ease;
  }
  .showcase-dot.is-active {
    background: var(--gold);
    transform: scale(1.25);
  }
  .showcase-nav {
    width: 40px; height: 40px; border-radius: 50%;
    border: 1px solid var(--hairline);
    background: rgba(18,18,26,0.7);
    color: var(--cream);
    cursor: pointer;
    font-size: 18px; line-height: 1;
    transition: border-color 0.25s ease, background 0.25s ease;
  }
  .showcase-nav:hover { border-color: var(--gold); background: rgba(201,162,75,0.12); }
  @media (max-width: 720px) {
    .showcase-track { padding-left: 14%; padding-right: 14%; }
    .phone-card { flex-basis: min(78vw, 280px); }
  }
`;

const newSection = `<section id="inside">
  <div class="section-head">
    <div class="section-eyebrow">What's inside</div>
    <h2>Built to be used, not browsed</h2>
    <p>Five screens from the real app — mix, orb, practice, presets, and your account.</p>
  </div>

  <div class="showcase-stage" data-showcase>
    <div class="showcase-track" data-showcase-track>
      <article class="phone-card is-active" data-showcase-card>
        <div class="phone-frame">
          <img src="/images/app/mixer.webp" width="720" height="1560" alt="Tonaura mixer screen with tone cards and play control" loading="lazy" />
        </div>
        <h3>The mixer</h3>
        <p>Ten pure tones in one breathing view — build a field, then press play.</p>
      </article>
      <article class="phone-card" data-showcase-card>
        <div class="phone-frame">
          <img src="/images/app/orb.webp" width="720" height="1560" alt="Tonaura orb mode with quick picks" loading="lazy" />
        </div>
        <h3>Orb mode</h3>
        <p>One button, a few quick picks, nothing to figure out.</p>
      </article>
      <article class="phone-card" data-showcase-card>
        <div class="phone-frame">
          <img src="/images/app/practice.webp" width="720" height="1560" alt="Tonaura practice streak screen" loading="lazy" />
        </div>
        <h3>Practice, not sleep score</h3>
        <p>A streak for showing up — never for how well you slept.</p>
      </article>
      <article class="phone-card" data-showcase-card>
        <div class="phone-frame">
          <img src="/images/app/presets.webp" width="720" height="1560" alt="Tonaura presets library" loading="lazy" />
        </div>
        <h3>Presets</h3>
        <p>Deep sleep, focus, morning reset — load a blend and go.</p>
      </article>
      <article class="phone-card" data-showcase-card>
        <div class="phone-frame">
          <img src="/images/app/account.webp" width="720" height="1560" alt="Tonaura account and Premium plans" loading="lazy" />
        </div>
        <h3>Account &amp; Premium</h3>
        <p>Same email as the website. Subscribe once, unlock on your phone.</p>
      </article>
    </div>
    <div class="showcase-controls">
      <button type="button" class="showcase-nav" data-showcase-prev aria-label="Previous screen">‹</button>
      <div class="showcase-dots" data-showcase-dots></div>
      <button type="button" class="showcase-nav" data-showcase-next aria-label="Next screen">›</button>
    </div>
  </div>
</section>`;

const showcaseJs = `
<script>
(function () {
  var root = document.querySelector("[data-showcase]");
  if (!root) return;
  var track = root.querySelector("[data-showcase-track]");
  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-showcase-card]"));
  var dotsWrap = root.querySelector("[data-showcase-dots]");
  var prev = root.querySelector("[data-showcase-prev]");
  var next = root.querySelector("[data-showcase-next]");
  var index = 0;
  var timer = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  cards.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "showcase-dot" + (i === 0 ? " is-active" : "");
    b.setAttribute("aria-label", "Show screen " + (i + 1));
    b.addEventListener("click", function () { go(i, true); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function go(i, user) {
    index = (i + cards.length) % cards.length;
    cards.forEach(function (c, n) { c.classList.toggle("is-active", n === index); });
    dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    var card = cards[index];
    var left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
    if (user) restart();
  }

  function restart() {
    if (reduce) return;
    clearInterval(timer);
    timer = setInterval(function () { go(index + 1, false); }, 4200);
  }

  prev.addEventListener("click", function () { go(index - 1, true); });
  next.addEventListener("click", function () { go(index + 1, true); });
  track.addEventListener("scroll", function () {
    var mid = track.scrollLeft + track.clientWidth / 2;
    var best = 0, bestDist = Infinity;
    cards.forEach(function (c, i) {
      var d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best !== index) {
      index = best;
      cards.forEach(function (c, n) { c.classList.toggle("is-active", n === index); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    }
  }, { passive: true });

  root.addEventListener("mouseenter", function () { clearInterval(timer); });
  root.addEventListener("mouseleave", restart);
  go(0, false);
  restart();
})();
</script>
`;

const cssRe =
  /\/\* ---------- Product showcase ---------- \*\/[\s\S]*?(?=\/\* ---------- Honest section ---------- \*\/)/;
const sectionRe = /<section id="inside">[\s\S]*?<\/section>\s*(?=<section id="honest")/;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log("skip missing", file);
    continue;
  }
  let html = fs.readFileSync(file, "utf8");
  if (!cssRe.test(html)) throw new Error("CSS block not found in " + file);
  if (!sectionRe.test(html)) throw new Error("Section not found in " + file);
  html = html.replace(cssRe, newCss + "\n");
  html = html.replace(sectionRe, newSection + "\n\n");
  // Fix image paths for the nested static copy if needed
  if (file.includes("tonaura-website-final")) {
    html = html.replaceAll('src="/images/app/', 'src="images/app/');
  }
  if (!html.includes("data-showcase")) throw new Error("showcase missing after replace");
  if (!html.includes("[data-showcase]")) {
    // inject script before </body>
    if (html.includes("</body>")) {
      html = html.replace("</body>", showcaseJs + "\n</body>");
    } else {
      html += showcaseJs;
    }
  } else if (!html.includes("data-showcase-track")) {
    // already has old? shouldn't
  }
  // Always ensure script once
  if (!html.includes("data-showcase-prev")) {
    // section should have it
  }
  if (!html.includes("(function () {\n  var root = document.querySelector(\"[data-showcase]\")")) {
    html = html.replace("</body>", showcaseJs + "\n</body>");
  }
  fs.writeFileSync(file, html);
  console.log("updated", path.relative(process.cwd(), file));
}

// Copy webp into static mirror folder
const mirrorDir = path.join(process.cwd(), "tonaura-website/tonaura-website-final/images/app");
fs.mkdirSync(mirrorDir, { recursive: true });
for (const f of ["mixer", "orb", "practice", "presets", "account"]) {
  const src = path.join(process.cwd(), "public/images/app", f + ".webp");
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(mirrorDir, f + ".webp"));
}
console.log("copied webp to static mirror");
