"""Build a premium Apple-like Tonaura homepage.
Keeps: logo files, phone showcase markup, footer, ambient cycle, cookie prefs.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website")
SHOWCASE = (ROOT / "scripts" / "_keep_showcase.html").read_text(encoding="utf-8")
FOOTER = (ROOT / "scripts" / "_keep_footer.html").read_text(encoding="utf-8")
SHOW_CSS = (ROOT / "scripts" / "_keep_showcase.css").read_text(encoding="utf-8")
# Drop trailing honest comment remnant
SHOW_CSS = SHOW_CSS.split("/* ---------- Honest")[0].strip()

# Soften section-head inside showcase — we'll wrap with our own story header
SHOWCASE_BODY = SHOWCASE
# Replace old section-head with quieter labels under phones only
import re
SHOWCASE_INNER = re.sub(
    r'<div class="section-head">[\s\S]*?</div>\s*',
    "",
    SHOWCASE_BODY,
    count=1,
)
# Change outer section to just the grid wrapper content
m = re.search(r'<div class="showcase">[\s\S]*</div>\s*</section>', SHOWCASE_INNER)
SHOWCASE_GRID = m.group(0).replace("</section>", "") if m else SHOWCASE_INNER

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tonaura — Solfeggio Tone Therapy</title>
<meta name="description" content="Pure solfeggio tones in one calm mixer. Orb, Practice, Presets, and living ambiences.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tonaura-home.css">
</head>
<body class="home">
<a class="skip" href="#main">Skip to content</a>

<nav class="nav" id="site-nav">
  <div class="nav-inner">
    <a class="brand" href="/">
      <img src="/images/brand/lockup.png" width="200" height="64" alt="Tonaura" />
    </a>
    <button class="nav-burger" id="nav-burger" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">
      <span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links">
      <a href="#inside">Inside</a>
      <a href="#field">The field</a>
      <a href="#pricing">Pricing</a>
      <a href="about.html">About</a>
      <a href="/login" class="nav-ghost">Sign in</a>
      <a href="#early" class="nav-cta">Early access</a>
    </div>
  </div>
</nav>

<main id="main">
  <!-- Hero: brand + one line + one sentence + CTA + dominant product plane -->
  <header class="hero" id="top">
    <div class="hero-atmosphere" aria-hidden="true"></div>
    <div class="hero-content reveal">
      <img class="hero-mark" src="/images/brand/mark.png" width="120" height="120" alt="" />
      <p class="hero-brand">Tonaura</p>
      <h1>Nine tones.<br>One place to be still.</h1>
      <p class="hero-sub">A calm solfeggio mixer with Orb, Practice, Presets, and living ambiences.</p>
      <div class="hero-cta">
        <a class="btn btn-gold" href="#early">Get early access</a>
        <a class="btn btn-ghost" href="#inside">See inside</a>
      </div>
    </div>
    <div class="hero-stage reveal delay-1" aria-hidden="true">
      <div class="hero-glow"></div>
      <img class="hero-device" src="/images/app/orb.webp?v=4" width="720" height="1280" alt="Tonaura Orb screen" />
    </div>
  </header>

  <!-- Story beat 1 -->
  <section class="story" id="field">
    <div class="story-inner reveal">
      <p class="eyebrow">The field</p>
      <h2>Sound that holds a room,<br>not a feed.</h2>
      <p class="lede">Layer pure tones, breathe with the Orb, and let ambiences carry the night — without noise, streaks of clutter, or a dashboard of distractions.</p>
    </div>
  </section>

  <!-- Feature cinema: one idea per viewport -->
  <section class="feature-reel">
    <article class="feature-row reveal">
      <div class="feature-copy">
        <p class="eyebrow">Mixer</p>
        <h2>Ten frequencies.<br>One living blend.</h2>
        <p>Touch a tone, shape the field, and hear how layers settle together.</p>
      </div>
      <div class="feature-visual">
        <img src="/images/app/mixer.webp?v=4" width="720" height="1280" alt="Mixer" loading="lazy" />
      </div>
    </article>
    <article class="feature-row reverse reveal">
      <div class="feature-copy">
        <p class="eyebrow">Orb</p>
        <h2>One gesture<br>to enter the field.</h2>
        <p>Play, pause, and quick presets — Deep Sleep, Clear Focus, Morning Reset.</p>
      </div>
      <div class="feature-visual">
        <img src="/images/app/orb.webp?v=4" width="720" height="1280" alt="Orb" loading="lazy" />
      </div>
    </article>
    <article class="feature-row reveal">
      <div class="feature-copy">
        <p class="eyebrow">Practice</p>
        <h2>Show up.<br>That is the streak.</h2>
        <p>A quiet count of days you sat with a tone — not how long, not how perfect.</p>
      </div>
      <div class="feature-visual">
        <img src="/images/app/practice.webp?v=4" width="720" height="1280" alt="Practice" loading="lazy" />
      </div>
    </article>
  </section>

  <!-- KEEP: five phone showcase -->
  <section class="inside-wrap" id="inside">
    <div class="story-inner reveal">
      <p class="eyebrow">What&rsquo;s inside</p>
      <h2>Built to be used,<br>not browsed.</h2>
      <p class="lede">Four views of the app, then live ambiences cycling in the fifth.</p>
    </div>
    <div class="showcase-pad reveal">
      {SHOWCASE_GRID}
    </div>
  </section>

  <!-- Honesty, sparse -->
  <section class="honest" id="honest">
    <div class="honest-grid">
      <div class="honest-block reveal">
        <p class="eyebrow">Tradition</p>
        <h2>Rooted in solfeggio practice.</h2>
        <p>Frequencies people have used for focus, rest, and release — presented plainly, without mystique for sale.</p>
      </div>
      <div class="honest-block reveal delay-1">
        <p class="eyebrow">Honesty</p>
        <h2>Not a medical device.</h2>
        <p>Tonaura is wellness software. It does not diagnose, treat, or replace care from a clinician.</p>
      </div>
    </div>
  </section>

  <!-- Pricing: clean, not card-heavy clutter -->
  <section class="pricing" id="pricing">
    <div class="story-inner reveal">
      <p class="eyebrow">Pricing</p>
      <h2>Start free.<br>Go deeper when ready.</h2>
    </div>
    <div class="price-row reveal">
      <div class="price-tier">
        <h3>Free</h3>
        <p class="price-amt">£0</p>
        <p class="price-note">Core mixer tones and Orb essentials.</p>
        <ul>
          <li>Essential frequencies</li>
          <li>Orb quick picks</li>
          <li>Practice streak</li>
        </ul>
        <a class="btn btn-ghost" href="#early">Join waitlist</a>
      </div>
      <div class="price-tier featured">
        <p class="tier-tag">Premium</p>
        <h3>Full field</h3>
        <p class="price-amt">£6.99<span>/mo</span></p>
        <p class="price-note">Every tone, ambience, entrainment, and preset.</p>
        <ul>
          <li>All solfeggio tones</li>
          <li>Living ambiences</li>
          <li>Entrainment underlays</li>
          <li>Unlimited custom presets</li>
        </ul>
        <button class="btn btn-gold price-btn primary" type="button" data-plan="premium">Start 7-day free trial</button>
      </div>
    </div>
  </section>

  <!-- Early access -->
  <section class="early" id="early">
    <div class="early-panel reveal">
      <p class="eyebrow">Early access</p>
      <h2>Be first when we open the field.</h2>
      <form class="early-form email-form" data-waitlist>
        <label class="sr-only" for="waitlist-email">Email</label>
        <input id="waitlist-email" name="email" type="email" required placeholder="you@email.com" autocomplete="email" />
        <button class="btn btn-gold" type="submit">Notify me</button>
      </form>
      <p class="early-note">No spam. One note when Tonaura is ready for you.</p>
      <p class="form-status" hidden></p>
    </div>
  </section>
</main>

{FOOTER}

<!-- Cookie prefs (minimal) -->
<div id="cookie-modal-backdrop" class="cookie-backdrop" hidden>
  <div class="cookie-modal" role="dialog" aria-labelledby="cookie-title">
    <h2 id="cookie-title">Cookie preferences</h2>
    <p>Essential cookies keep the site working. Analytics help us improve — optional.</p>
    <label class="cookie-toggle">
      <input type="checkbox" id="cookie-toggle-analytics" />
      <span>Analytics cookies</span>
    </label>
    <div class="cookie-actions">
      <button type="button" class="btn btn-ghost" onclick="saveCookiePrefs(false)">Essential only</button>
      <button type="button" class="btn btn-gold" onclick="saveCookiePrefs(true)">Save</button>
    </div>
  </div>
</div>

<script src="/tonaura-site.js"></script>
<script src="/tonaura-home.js"></script>
</body>
</html>
'''

(ROOT / "public" / "index.html").write_text(html, encoding="utf-8")
print("wrote index.html", len(html))

# Write CSS companion
css = f'''/* Tonaura home — cinematic, Plus Jakarta Sans, logo gold/teal accents */
:root {{
  --bg: #050508;
  --bg-elev: #0c0c12;
  --ink: #0a0a0f;
  --text: #F3EEE4;
  --text-2: #A8A3B5;
  --text-3: #6E6A7A;
  --gold: #C9A24B;
  --gold-soft: rgba(201,162,75,0.14);
  --teal: #4FB3A9;
  --line: rgba(243,238,228,0.1);
  --radius: 20px;
  --max: 1120px;
}}
* {{ box-sizing: border-box; }}
html {{ scroll-behavior: smooth; }}
body {{
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}}
em {{ font-style: normal; font-weight: 600; }}
a {{ color: inherit; text-decoration: none; }}
img {{ max-width: 100%; height: auto; display: block; }}
h1,h2,h3 {{ margin: 0; font-weight: 600; letter-spacing: -0.03em; line-height: 1.05; }}
p {{ margin: 0; }}
.skip {{
  position: absolute; left: -999px; top: 0;
}}
.skip:focus {{ left: 12px; top: 12px; background: var(--gold); color: #1a1608; padding: 8px 12px; z-index: 100; }}
.sr-only {{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }}

/* Nav */
.nav {{
  position: fixed; inset: 0 0 auto 0; z-index: 50;
  transition: background .35s ease, backdrop-filter .35s ease, border-color .35s ease;
  border-bottom: 1px solid transparent;
}}
.nav.is-solid {{
  background: rgba(5,5,8,0.72);
  backdrop-filter: blur(16px);
  border-bottom-color: var(--line);
}}
.nav-inner {{
  max-width: var(--max);
  margin: 0 auto;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}}
.brand img {{
  width: 168px; height: auto;
  filter: saturate(1.18) contrast(1.05) brightness(1.04);
}}
.nav-links {{
  display: flex; align-items: center; gap: 22px;
  font-size: 14px; font-weight: 500; color: var(--text-2);
}}
.nav-links a:hover {{ color: var(--text); }}
.nav-cta {{
  background: var(--gold); color: #1a1608 !important;
  padding: 10px 16px; border-radius: 999px; font-weight: 600;
}}
.nav-ghost {{
  border: 1px solid var(--line); padding: 9px 14px; border-radius: 999px;
}}
.nav-burger {{
  display: none; background: none; border: 0; width: 40px; height: 40px;
  flex-direction: column; justify-content: center; gap: 6px; cursor: pointer;
}}
.nav-burger span {{ display: block; height: 2px; background: var(--text); border-radius: 2px; }}

@media (max-width: 820px) {{
  .nav-burger {{ display: flex; }}
  .nav-links {{
    position: absolute; left: 0; right: 0; top: 100%;
    flex-direction: column; align-items: stretch;
    background: rgba(5,5,8,0.96); padding: 16px 24px 24px;
    max-height: 0; overflow: hidden; opacity: 0; pointer-events: none;
    transition: max-height .35s ease, opacity .25s ease;
  }}
  body.menu-open .nav-links {{
    max-height: 70vh; opacity: 1; pointer-events: auto;
  }}
}}

/* Hero */
.hero {{
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 40px;
  padding: 120px 28px 64px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}}
.hero-atmosphere {{
  position: absolute; inset: -10% -20% auto;
  height: 70vh; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 60% at 70% 40%, rgba(79,179,169,0.16), transparent 60%),
    radial-gradient(ellipse 50% 50% at 20% 30%, rgba(201,162,75,0.12), transparent 55%);
}}
.hero-content {{ position: relative; z-index: 1; max-width: 520px; }}
.hero-mark {{
  width: 72px; height: 72px; margin-bottom: 18px;
  filter: saturate(1.25) contrast(1.06);
}}
.hero-brand {{
  font-size: 13px; font-weight: 600; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 16px;
}}
.hero h1 {{
  font-size: clamp(40px, 6.2vw, 64px);
  margin-bottom: 18px;
}}
.hero-sub {{
  font-size: 17px; line-height: 1.55; color: var(--text-2);
  max-width: 420px; margin-bottom: 28px;
}}
.hero-cta {{ display: flex; flex-wrap: wrap; gap: 12px; }}
.hero-stage {{
  position: relative; z-index: 1;
  display: flex; justify-content: center; align-items: center;
}}
.hero-glow {{
  position: absolute; width: 70%; height: 70%;
  background: radial-gradient(circle, rgba(201,162,75,0.22), transparent 70%);
  filter: blur(30px);
}}
.hero-device {{
  width: min(320px, 70vw);
  border-radius: 36px;
  border: 1px solid rgba(243,238,228,0.12);
  box-shadow: 0 40px 100px -30px rgba(0,0,0,0.85);
  position: relative;
  animation: floatY 7s ease-in-out infinite;
}}
@keyframes floatY {{
  0%,100% {{ transform: translateY(0); }}
  50% {{ transform: translateY(-12px); }}
}}
@media (prefers-reduced-motion: reduce) {{
  .hero-device {{ animation: none; }}
}}
@media (max-width: 900px) {{
  .hero {{
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 110px;
    min-height: auto;
  }}
  .hero-content {{ max-width: none; margin: 0 auto; }}
  .hero-sub {{ margin-left: auto; margin-right: auto; }}
  .hero-cta {{ justify-content: center; }}
  .hero-mark {{ margin-left: auto; margin-right: auto; }}
  .hero-device {{ width: min(260px, 62vw); }}
}}

.btn {{
  display: inline-flex; align-items: center; justify-content: center;
  padding: 14px 22px; border-radius: 999px; font-weight: 600; font-size: 15px;
  border: 1px solid transparent; cursor: pointer;
  transition: transform .2s ease, filter .2s ease, background .2s ease;
  font-family: inherit;
}}
.btn:active {{ transform: scale(0.98); }}
.btn-gold {{ background: var(--gold); color: #1a1608; }}
.btn-gold:hover {{ filter: brightness(1.08); }}
.btn-ghost {{
  background: transparent; color: var(--text);
  border-color: var(--line);
}}
.btn-ghost:hover {{ border-color: rgba(243,238,228,0.28); }}

/* Story / features */
.story {{
  padding: 140px 28px 80px;
  text-align: center;
}}
.story-inner {{ max-width: 720px; margin: 0 auto; }}
.eyebrow {{
  color: var(--teal); font-size: 12px; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 18px;
}}
.story h2, .feature-copy h2, .inside-wrap h2, .honest-block h2, .pricing h2, .early h2 {{
  font-size: clamp(32px, 5vw, 52px); margin-bottom: 18px;
}}
.lede, .feature-copy p, .honest-block p {{
  font-size: 18px; line-height: 1.6; color: var(--text-2);
}}

.feature-reel {{ padding: 40px 28px 80px; max-width: 1120px; margin: 0 auto; }}
.feature-row {{
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
  align-items: center; padding: 72px 0;
  border-top: 1px solid var(--line);
}}
.feature-row.reverse {{ direction: rtl; }}
.feature-row.reverse > * {{ direction: ltr; }}
.feature-visual {{
  display: flex; justify-content: center;
}}
.feature-visual img {{
  width: min(280px, 70%);
  border-radius: 32px;
  border: 1px solid var(--line);
  box-shadow: 0 30px 80px -28px rgba(0,0,0,0.75);
}}
@media (max-width: 800px) {{
  .feature-row, .feature-row.reverse {{
    grid-template-columns: 1fr; direction: ltr; text-align: center; gap: 28px;
  }}
}}

/* Showcase keep */
.inside-wrap {{ padding: 80px 20px 120px; }}
.inside-wrap .story-inner {{ margin-bottom: 48px; text-align: center; }}
.showcase-pad {{ max-width: 1100px; margin: 0 auto; }}
{SHOW_CSS}
.phone-card h3 {{ color: var(--text); }}
.phone-card p {{ color: var(--text-3); }}

/* Honest */
.honest {{ padding: 100px 28px 120px; background: linear-gradient(180deg, transparent, rgba(12,12,18,0.9)); }}
.honest-grid {{
  max-width: var(--max); margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
}}
@media (max-width: 800px) {{ .honest-grid {{ grid-template-columns: 1fr; }} }}

/* Pricing */
.pricing {{ padding: 80px 28px 100px; text-align: center; }}
.price-row {{
  max-width: 820px; margin: 40px auto 0;
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;
}}
.price-tier {{
  padding: 32px 28px; border-radius: 24px;
  border: 1px solid var(--line); background: rgba(12,12,18,0.6);
}}
.price-tier.featured {{
  border-color: rgba(201,162,75,0.45);
  background: linear-gradient(160deg, rgba(201,162,75,0.1), rgba(12,12,18,0.85));
}}
.tier-tag {{
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #1a1608; background: var(--gold);
  padding: 4px 10px; border-radius: 999px; margin-bottom: 12px;
}}
.price-tier h3 {{ font-size: 22px; margin-bottom: 8px; }}
.price-amt {{
  font-size: 40px; font-weight: 700; color: var(--gold); margin-bottom: 8px;
}}
.price-amt span {{ font-size: 15px; color: var(--text-3); font-weight: 500; }}
.price-note {{ color: var(--text-2); font-size: 14px; margin-bottom: 18px; line-height: 1.5; }}
.price-tier ul {{
  list-style: none; padding: 0; margin: 0 0 24px;
  display: grid; gap: 10px; color: var(--text-2); font-size: 14px;
}}
.price-tier ul li::before {{ content: "– "; color: var(--teal); }}
.price-tier .btn {{ width: 100%; }}
@media (max-width: 700px) {{ .price-row {{ grid-template-columns: 1fr; }} }}

/* Early access */
.early {{ padding: 40px 28px 140px; }}
.early-panel {{
  max-width: 640px; margin: 0 auto; text-align: center;
  padding: 48px 28px; border-radius: 28px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(79,179,169,0.14), transparent 60%),
    var(--bg-elev);
  border: 1px solid var(--line);
}}
.early-form {{
  display: flex; gap: 10px; margin: 28px auto 12px; max-width: 440px;
}}
.early-form input {{
  flex: 1; min-width: 0; border-radius: 999px; border: 1px solid var(--line);
  background: rgba(0,0,0,0.35); color: var(--text);
  padding: 14px 18px; font: inherit; font-size: 15px;
}}
.early-form input:focus {{ outline: 2px solid var(--gold); outline-offset: 2px; }}
.early-note {{ color: var(--text-3); font-size: 13px; }}
.form-status {{ margin-top: 12px; color: var(--teal); font-size: 14px; }}
@media (max-width: 560px) {{
  .early-form {{ flex-direction: column; }}
}}

/* Footer (kept structure) */
footer {{
  border-top: 1px solid var(--line);
  padding: 56px 28px 28px;
  background: #040406;
}}
.footer-inner {{
  max-width: var(--max); margin: 0 auto 36px;
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 28px;
}}
.footer-lockup {{
  width: 180px; height: auto; margin-bottom: 12px;
  filter: saturate(1.18) contrast(1.05);
}}
.footer-tagline {{ color: var(--text-2); font-size: 14px; margin-bottom: 16px; }}
.footer-social {{ display: flex; gap: 14px; color: var(--text-3); }}
.footer-social a:hover {{ color: var(--gold); }}
.footer-col h4 {{
  font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-3); margin-bottom: 14px; font-weight: 600;
}}
.footer-col a {{
  display: block; color: var(--text-2); font-size: 14px; margin-bottom: 10px;
}}
.footer-col a:hover {{ color: var(--text); }}
.footer-bottom {{
  max-width: var(--max) !important; margin: 0 auto; padding-top: 20px;
  border-top: 1px solid var(--line);
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  color: var(--text-3); font-size: 12px;
}}
.footer-bottom a {{ color: var(--text-2); }}
@media (max-width: 780px) {{
  .footer-inner {{ grid-template-columns: 1fr 1fr; }}
  .footer-brand-col {{ grid-column: 1 / -1; }}
}}

/* Reveal motion */
.reveal {{
  opacity: 0; transform: translateY(28px);
  transition: opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);
}}
.reveal.is-in {{ opacity: 1; transform: none; }}
.reveal.delay-1 {{ transition-delay: .12s; }}
@media (prefers-reduced-motion: reduce) {{
  .reveal {{ opacity: 1; transform: none; transition: none; }}
}}

/* Cookie */
.cookie-backdrop {{
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: grid; place-items: center; z-index: 80; padding: 20px;
}}
.cookie-backdrop[hidden] {{ display: none !important; }}
.cookie-modal {{
  width: min(420px, 100%); background: var(--bg-elev); border: 1px solid var(--line);
  border-radius: 20px; padding: 24px;
}}
.cookie-modal h2 {{ font-size: 22px; margin-bottom: 10px; }}
.cookie-modal p {{ color: var(--text-2); font-size: 14px; line-height: 1.5; margin-bottom: 16px; }}
.cookie-toggle {{ display: flex; gap: 10px; align-items: center; margin-bottom: 18px; color: var(--text-2); }}
.cookie-actions {{ display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }}
'''

(ROOT / "public" / "tonaura-home.css").write_text(css, encoding="utf-8")
print("wrote css", len(css))

js = r'''(function () {
  var nav = document.getElementById("site-nav");
  var burger = document.getElementById("nav-burger");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-solid", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Ambient cycle on 5th phone
  function startAmbientCycle() {
    var phone = document.querySelector("[data-ambient-phone]");
    if (!phone) return;
    var slides = Array.prototype.slice.call(phone.querySelectorAll(".ambient-slides img"));
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
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

  // Scroll reveals
  var nodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) { io.observe(n); });
  } else {
    nodes.forEach(function (n) { n.classList.add("is-in"); });
  }

  // Cookie helpers used by footer
  window.openCookiePrefs = function () {
    var el = document.getElementById("cookie-modal-backdrop");
    if (!el) return;
    el.hidden = false;
    var saved = localStorage.getItem("tonaura_cookie_prefs");
    var analytics = true;
    try {
      if (saved) analytics = !!JSON.parse(saved).analytics;
    } catch (e) {}
    var box = document.getElementById("cookie-toggle-analytics");
    if (box) box.checked = analytics;
  };
  window.saveCookiePrefs = function (all) {
    var box = document.getElementById("cookie-toggle-analytics");
    var analytics = all === true ? true : !!(box && box.checked);
    if (all === false) analytics = false;
    localStorage.setItem(
      "tonaura_cookie_prefs",
      JSON.stringify({ essential: true, analytics: analytics, savedAt: Date.now() })
    );
    var el = document.getElementById("cookie-modal-backdrop");
    if (el) el.hidden = true;
  };
})();
'''
(ROOT / "public" / "tonaura-home.js").write_text(js, encoding="utf-8")
print("wrote js", len(js))
