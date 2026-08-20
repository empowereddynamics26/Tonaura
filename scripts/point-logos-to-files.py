from pathlib import Path
import re

root = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\public")
n = 0
for p in root.glob("*.html"):
    if p.name == "index.html":
        continue
    t = p.read_text(encoding="utf-8")
    nt = re.sub(
        r'(<div class="brand">\s*<img )src="data:image/png;base64,[^"]+"',
        r'\1src="/images/brand/lockup.png"',
        t,
        count=1,
    )
    nt = re.sub(
        r'(<img class="footer-lockup" )src="data:image/png;base64,[^"]+"',
        r'\1src="/images/brand/lockup.png"',
        nt,
        count=1,
    )
    if nt != t:
        p.write_text(nt, encoding="utf-8")
        n += 1
        print("updated", p.name)
print("files", n)
