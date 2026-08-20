const fs = require("fs");

const pub = "public/index.html";
const fin = "tonaura-website/tonaura-website-final/index.html";
const cssRe =
  /\/\* ---------- Product showcase ---------- \*\/[\s\S]*?(?=\/\* ---------- Honest section ---------- \*\/)/;

let publicHtml = fs.readFileSync(pub, "utf8");
publicHtml = publicHtml.replace(/\?v=\d+/g, "?v=4");
// Ensure image urls have v=4
publicHtml = publicHtml.replace(
  /(\/images\/app\/(?:ambients\/)?[\w-]+\.webp)(?:\?v=\d+)?/g,
  "$1?v=4"
);
fs.writeFileSync(pub, publicHtml);

let finalHtml = fs.readFileSync(fin, "utf8");
const css = publicHtml.match(cssRe)[0];
if (!cssRe.test(finalHtml)) throw new Error("final css missing");
finalHtml = finalHtml.replace(cssRe, css);
finalHtml = finalHtml.replace(/\?v=\d+/g, "?v=4");
finalHtml = finalHtml.replace(
  /(\/?images\/app\/(?:ambients\/)?[\w-]+\.webp)(?:\?v=\d+)?/g,
  (m, p) => {
    const path = p.startsWith("/") || p.startsWith("images") ? p.replace(/^\//, "") : p;
    // keep relative for final
    const rel = path.startsWith("images/") ? path : path.replace(/^\//, "");
    return rel.startsWith("images/") ? `${rel}?v=4` : `images/app/${rel.split("/").pop()}?v=4`;
  }
);
// simpler: just force known paths
finalHtml = finalHtml.replaceAll('src="/images/app/', 'src="images/app/');
finalHtml = finalHtml.replace(
  /src="(?:\/)?images\/app\/(mixer|orb|practice|presets)\.webp[^"]*"/g,
  'src="images/app/$1.webp?v=4"'
);
finalHtml = finalHtml.replace(
  /src="(?:\/)?images\/app\/ambients\/(winter|autumn|summer|rain|nightsky)\.webp[^"]*"/g,
  'src="images/app/ambients/$1.webp?v=4"'
);
fs.writeFileSync(fin, finalHtml);
console.log("synced");
