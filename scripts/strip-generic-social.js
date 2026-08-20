const fs = require("fs");
const path = require("path");

const roots = ["public", path.join("tonaura-website", "tonaura-website-final")];
const re =
  /\s*<a href="https:\/\/(?:x\.com|www\.instagram\.com)"[^>]*>[\s\S]*?<\/a>\n?/g;

let n = 0;
for (const root of roots) {
  const dir = path.join(process.cwd(), root);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
    const p = path.join(dir, f);
    const t = fs.readFileSync(p, "utf8");
    const next = t.replace(re, "");
    if (next !== t) {
      fs.writeFileSync(p, next);
      n += 1;
      console.log("updated", root + "/" + f);
    }
  }
}
console.log("files", n);
