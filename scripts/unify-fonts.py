"""Unify website typography to Plus Jakarta Sans (no italics)."""
from pathlib import Path
import re

ROOTS = [
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\public"),
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\tonaura-website\tonaura-website-final"),
]

OLD_LINK = re.compile(
    r'https://fonts\.googleapis\.com/css2\?family=Fraunces[^"\']+|https://fonts\.googleapis\.com/css2\?family=Inter[^"\']+'
)
NEW_LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"

REPLACEMENTS = [
    (r"font-family:\s*'Inter',\s*-apple-system,\s*sans-serif", "font-family: 'Plus Jakarta Sans', system-ui, sans-serif"),
    (r'font-family:\s*"Inter",\s*-apple-system,\s*sans-serif', 'font-family: "Plus Jakarta Sans", system-ui, sans-serif'),
    (r"font-family:\s*'Inter',\s*sans-serif", "font-family: 'Plus Jakarta Sans', sans-serif"),
    (r'font-family:\s*"Inter",\s*sans-serif', 'font-family: "Plus Jakarta Sans", sans-serif'),
    (r"font-family:\s*'Fraunces',\s*serif", "font-family: 'Plus Jakarta Sans', sans-serif"),
    (r'font-family:\s*"Fraunces",\s*serif', 'font-family: "Plus Jakarta Sans", sans-serif'),
    (r"font-family:\s*'Fraunces',serif", "font-family: 'Plus Jakarta Sans',sans-serif"),
    (r"font-family:'Fraunces',serif", "font-family:'Plus Jakarta Sans',sans-serif"),
    (r"font-family:\s*Inter,\s*system-ui,\s*sans-serif", "font-family: 'Plus Jakarta Sans', system-ui, sans-serif"),
    (r"font-family:\s*Fraunces,\s*serif", "font-family: 'Plus Jakarta Sans', sans-serif"),
    (r"font-family:\s*Georgia,\s*'Times New Roman',\s*serif", "font-family: 'Plus Jakarta Sans', system-ui, sans-serif"),
    (r"font-style:\s*italic", "font-style: normal"),
    (r"font-style:italic", "font-style:normal"),
]

# Google fonts link that includes both Fraunces and Inter
COMBO = re.compile(
    r'href="https://fonts\.googleapis\.com/css2\?family=[^"]+"'
)

count = 0
for root in ROOTS:
    if not root.exists():
        continue
    for p in list(root.rglob("*.html")) + list(root.rglob("*.css")):
        text = p.read_text(encoding="utf-8")
        orig = text
        text = COMBO.sub(f'href="{NEW_LINK}"', text)
        for pat, rep in REPLACEMENTS:
            text = re.sub(pat, rep, text)
        if text != orig:
            p.write_text(text, encoding="utf-8")
            count += 1
            print("updated", p)

# Next.js app styles
app_files = [
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\app\globals.css"),
    Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website\app\layout.js"),
]
for p in app_files:
    if not p.exists():
        continue
    text = p.read_text(encoding="utf-8")
    orig = text
    text = COMBO.sub(f'href="{NEW_LINK}"', text)
    for pat, rep in REPLACEMENTS:
        text = re.sub(pat, rep, text)
    if text != orig:
        p.write_text(text, encoding="utf-8")
        count += 1
        print("updated", p)

print("files", count)
