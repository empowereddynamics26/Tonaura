const fs = require("fs");
for (const f of ["public/index.html", "tonaura-website/tonaura-website-final/index.html"]) {
  let t = fs.readFileSync(f, "utf8");
  t = t.replace(
    /<button type="button" class="showcase-nav" data-showcase-prev[^>]*>[\s\S]*?<\/button>/,
    '<button type="button" class="showcase-nav" data-showcase-prev aria-label="Previous screen">Prev</button>'
  );
  t = t.replace(
    /<button type="button" class="showcase-nav" data-showcase-next[^>]*>[\s\S]*?<\/button>/,
    '<button type="button" class="showcase-nav" data-showcase-next aria-label="Next screen">Next</button>'
  );
  fs.writeFileSync(f, t);
  console.log("fixed", f);
}
