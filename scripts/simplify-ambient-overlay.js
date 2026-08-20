const fs = require("fs");
const path = require("path");

const files = [
  "public/index.html",
  "tonaura-website/tonaura-website-final/index.html",
].map((f) => path.join(process.cwd(), f));

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");

  // Drop CSS overlay chrome — stamped ambient webps already include orb/play/tabs
  html = html.replace(
    /\n  \.ambient-ui \{[\s\S]*?\.ambient-play \{[\s\S]*?\}\n/,
    "\n"
  );

  // Simplify ambient phone markup: images only (with baked-in UI)
  html = html.replace(
    /<div class="phone-screen" data-ambient-phone>[\s\S]*?<\/div>\s*<\/div>\s*<h3>Ambiences<\/h3>/,
    `<div class="phone-screen" data-ambient-phone>
          <div class="ambient-slides">
            <img src="/images/app/ambients/winter.webp" alt="Winter ambient" class="is-active" />
            <img src="/images/app/ambients/autumn.webp" alt="Autumn ambient" />
            <img src="/images/app/ambients/summer.webp" alt="Summer ambient" />
            <img src="/images/app/ambients/rain.webp" alt="Rain ambient" />
            <img src="/images/app/ambients/nightsky.webp" alt="Night sky ambient" />
          </div>
        </div>
      </div>
      <h3>Ambiences</h3>`
  );

  if (file.includes("tonaura-website-final")) {
    html = html.replaceAll('src="/images/app/', 'src="images/app/');
  }

  // Simplify JS — no label element anymore
  html = html.replace(
    /\n<script>\n\(function \(\) \{\n  var phone = document\.querySelector\("\[data-ambient-phone\]"\);[\s\S]*?<\/script>\n?/,
    `
<script>
(function () {
  var phone = document.querySelector("[data-ambient-phone]");
  if (!phone) return;
  var slides = Array.prototype.slice.call(phone.querySelectorAll(".ambient-slides img"));
  if (slides.length < 2) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i = 0;
  function tick() {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }
  if (!reduce) setInterval(tick, 3000);
})();
</script>
`
  );

  fs.writeFileSync(file, html);
  console.log("updated", path.relative(process.cwd(), file));
}
