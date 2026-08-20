from pathlib import Path
import re

ROOTS = [
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\public"),
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\tonaura-website\tonaura-website-final"),
]

EM_RULE = "  em { font-style: normal; font-weight: 600; }\n"

for root in ROOTS:
    for p in root.glob("*.html"):
        t = p.read_text(encoding="utf-8")
        orig = t
        if "em { font-style: normal" not in t:
            t = t.replace(
                "h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; margin: 0; letter-spacing: -0.01em; }\n",
                "h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; margin: 0; letter-spacing: -0.01em; }\n"
                + EM_RULE,
            )
        # Stronger brand / hero mark vibrance without changing asset structure
        t = re.sub(
            r"\.brand img \{ width: 220px; height: auto; display: block; \}",
            ".brand img { width: 220px; height: auto; display: block; filter: saturate(1.22) contrast(1.06) brightness(1.04); }",
            t,
        )
        t = re.sub(
            r"\.mandala \{ animation: breathe 4s ease-in-out infinite; transform-origin: center; display: block; width: 280px; height: 280px; filter: drop-shadow\(0 20px 50px rgba\(201,162,75,0\.18\)\); \}",
            ".mandala { animation: breathe 4s ease-in-out infinite; transform-origin: center; display: block; width: 280px; height: 280px; filter: saturate(1.28) contrast(1.08) brightness(1.05) drop-shadow(0 20px 50px rgba(201,162,75,0.28)); }",
            t,
        )
        t = t.replace(
            ".hero h1 em { font-style: normal; font-weight: 500; color: var(--gold); }",
            ".hero h1 em { font-style: normal; font-weight: 600; color: var(--gold); }",
        )
        if t != orig:
            p.write_text(t, encoding="utf-8")
            print("patched", p.name)

# Show brand markup from index
idx = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\public\index.html")
text = idx.read_text(encoding="utf-8")
m = re.search(r'<div class="brand">([\s\S]*?)</div>', text)
print("BRAND:", (m.group(0)[:400] if m else "missing"))
