const fs = require("fs");
const t = fs.readFileSync("public/index.html", "utf8");
const start = t.indexOf('id="inside"');
const end = t.indexOf('id="honest"');
console.log("start", start, "end", end);
console.log(t.slice(start, Math.min(start + 6000, end > 0 ? end : start + 6000)));
