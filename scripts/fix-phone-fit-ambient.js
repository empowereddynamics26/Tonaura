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
    border-radius: 24px;
    padding: 8px;
    background: linear-gradient(160deg, #1a1a24 0%, #0a0a10 55%, #14141c 100%);
    border: 1px solid rgba(237,231,217,0.12);
    box-shadow: 0 20px 48px -18px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04);
    box-sizing: border-box;
  }
  .phone-frame::before {
    content: "";
    position: absolute;
    top: 12px; left: 50%;
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
    border-radius: 17px;
    overflow: hidden;
    background: #0B0C10;
    isolation: isolate;
  }
  .phone-screen > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
  .ambient-slides {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .ambient-slides img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    opacity: 0;
    z-index: 0;
    transition: opacity 0.8s ease;
    pointer-events: none;
  }
  .ambient-slides img.is-active {
    opacity: 1;
    z-index: 1;
  }
  .phone-card h3 { font-size: 14px; margin-bottom: 5px; line-height: 1.25; }
  .phone-card p { font-size: 12px; color: var(--text-faint); line-height: 1.45; max-width: 190px; margin: 0 auto; }
`;

const newJs = `
<script>
(function () {
  function startAmbientCycle() {
    var phone = document.querySelector("[data-ambient-phone]");
    if (!phone) return;
    var slides = Array.prototype.slice.call(phone.querySelectorAll(".ambient-slides img"));
    if (slides.length < 2) return;
    var i = 0;
    slides.forEach(function (img, n) {
      img.classList.toggle("is-active", n === 0);
    });
    window.setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 3000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAmbientCycle);
  } else {
    startAmbientCycle();
  }
})();
</script>
`;

const cssRe =
  /\/\* ---------- Product showcase ---------- \*\/[\s\S]*?(?=\/\* ---------- Honest section ---------- \*\/)/;
const oldAmbientJsRe =
  /\n<script>\n\(function \(\) \{\n  var phone = document\.querySelector\("\[data-ambient-phone\]"\);[\s\S]*?<\/script>\n?/g;
const oldAmbientJsRe2 =
  /\n<script>\n\(function \(\) \{\n  function startAmbientCycle\(\) \{[\s\S]*?<\/script>\n?/g;

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (!cssRe.test(html)) throw new Error("css missing " + file);
  html = html.replace(cssRe, newCss + "\n");
  html = html.replace(oldAmbientJsRe, "\n");
  html = html.replace(oldAmbientJsRe2, "\n");
  if (!html.includes("startAmbientCycle")) {
    html = html.replace("</body>", newJs + "\n</body>");
  }
  // Cache-bust ambient images so browsers pick up the cycle frames
  html = html.replace(
    /\/images\/app\/ambients\/(winter|autumn|summer|rain|nightsky)\.webp/g,
    "/images/app/ambients/$1.webp?v=3"
  );
  html = html.replace(
    /\/images\/app\/(mixer|orb|practice|presets)\.webp(?:\?v=\d+)?/g,
    "/images/app/$1.webp?v=3"
  );
  if (file.includes("tonaura-website-final")) {
    html = html.replaceAll('src="/images/app/', 'src="images/app/');
  }
  fs.writeFileSync(file, html);
  console.log("patched", path.relative(process.cwd(), file));
}
