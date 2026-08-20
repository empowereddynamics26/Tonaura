from pathlib import Path
import re, base64

ROOT = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website")
index = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
out = ROOT / "public" / "images" / "brand"
out.mkdir(parents=True, exist_ok=True)
scripts = ROOT / "scripts"
scripts.mkdir(exist_ok=True)

m = re.search(r'<div class="brand">\s*<img src="data:image/png;base64,([^"]+)"', index)
if m:
    (out / "lockup.png").write_bytes(base64.b64decode(m.group(1)))
    print("lockup", (out / "lockup.png").stat().st_size)

m2 = re.search(r'<img class="mandala" src="data:image/png;base64,([^"]+)"', index)
if m2:
    (out / "mark.png").write_bytes(base64.b64decode(m2.group(1)))
    print("mark", (out / "mark.png").stat().st_size)

sm = re.search(r'(<section id="inside"[\s\S]*?</section>)', index)
if sm:
    (scripts / "_keep_showcase.html").write_text(sm.group(1), encoding="utf-8")
    print("showcase", len(sm.group(1)))

fm = re.search(r'(<footer>[\s\S]*?</footer>)', index)
if fm:
    footer = fm.group(1)
    # Point footer lockup at file instead of huge base64 when rebuilding
    footer = re.sub(
        r'<img class="footer-lockup" src="data:image/png;base64,[^"]+"',
        '<img class="footer-lockup" src="/images/brand/lockup.png"',
        footer,
        count=1,
    )
    (scripts / "_keep_footer.html").write_text(footer, encoding="utf-8")
    print("footer", len(footer))

# Capture showcase CSS block used by phones
cm = re.search(r'(/\* ---------- What.?s Inside[\s\S]*?/\* ---------- Honest)', index)
if not cm:
    cm = re.search(r'(\.showcase\s*\{[\s\S]*?\.ambient-slides img\.is-active[\s\S]*?\})', index)
if cm:
    (scripts / "_keep_showcase.css").write_text(cm.group(1), encoding="utf-8")
    print("css", len(cm.group(1)))
