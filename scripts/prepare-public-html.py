from pathlib import Path

WEB = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\Tonaura website")
SRC = WEB / "tonaura-website" / "tonaura-website-final"
PUBLIC = WEB / "public"
APP_ENV = Path(r"C:\Users\1230s\OneDrive\Documents\Jatt\tonaura-app\tonaura-app\.env")

PUBLIC.mkdir(exist_ok=True)

REPLACEMENTS = [
    (
        "Where used, Tonaura relies on: <strong>Firebase</strong> (Google LLC) for optional sign-in, <strong>RevenueCat</strong> for subscription entitlement management, and <strong>Apple/Google</strong> for in-app purchases. Each processes information only as necessary to provide their service, under their own privacy policies.",
        "Tonaura relies on: <strong>Supabase</strong> for optional sign-in and account data, and <strong>Stripe</strong> for web purchases and Premium status. Each processes information only as necessary to provide their service, under their own privacy policies.",
    ),
    (
        "Tonaura relies on third-party providers — including Apple, Google, and (where applicable) Firebase and RevenueCat — to operate sign-in, purchases, and sync. Your use of those features is also subject to those providers' own terms.",
        "Tonaura relies on third-party providers — including Supabase for sign-in and Stripe for web purchases. Your use of those features is also subject to those providers' own terms.",
    ),
    (
        "We use the following categories of sub-processor: authentication (Firebase/Google), subscription management (RevenueCat), and payment processing (Apple, Google, Stripe). Each is bound by its own data protection terms.",
        "We use the following categories of sub-processor: authentication (Supabase) and payment processing (Stripe). Each is bound by its own data protection terms.",
    ),
    (
        "Subscriptions are purchased through the App Store (iOS), Google Play (Android), or — where offered — directly on tonaura.io via Stripe. Which option you see depends on your platform and region.",
        "Subscriptions and lifetime access are purchased on tonaura.io via Stripe. The Tonaura app uses the same signed-in account and does not sell Premium inside the App Store or Google Play.",
    ),
    (
        "App Store and Google Play purchases are billed by Apple or Google respectively, to the payment method on file with your Apple ID or Google account. Web purchases via Stripe are billed directly by Tonaura/Empowered Dynamics FZ-LLC.",
        "Web purchases via Stripe are billed by Tonaura/Empowered Dynamics FZ-LLC. The app does not take payment for Premium.",
    ),
    (
        "Monthly and yearly subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period, in line with standard App Store/Google Play/Stripe subscription behavior.",
        "Monthly and yearly subscriptions renew automatically unless cancelled before the end of the current period, in line with Stripe subscription behaviour. Cancel from your Tonaura account page.",
    ),
    (
        "The 7-day free trial converts automatically into a paid subscription unless cancelled before it ends. You can cancel anytime during the trial with no charge.",
        "If Stripe shows a free trial on a plan, it converts into a paid subscription unless cancelled before it ends. Cancel from your Tonaura account page. The app does not start its own trial.",
    ),
    (
        "Cancel anytime through: Settings &gt; [your Apple ID] &gt; Subscriptions (iOS), the Google Play Store app (Android), or your Tonaura account page (web purchases). Cancelling stops future renewals but doesn't end your access before the current paid period ends.",
        "Cancel anytime from your Tonaura account page (Manage billing). Cancelling stops future renewals but does not end access before the current paid period ends.",
    ),
    (
        "Refund requests for App Store or Google Play purchases are handled by Apple or Google under their own refund policies — we don't have the ability to issue those refunds directly. For web (Stripe) purchases, contact <a class=\"inline-link\" href=\"mailto:billing@tonaura.io\">billing@tonaura.io</a> and we'll review the request.",
        "For Stripe purchases, contact <a class=\"inline-link\" href=\"mailto:billing@tonaura.io\">billing@tonaura.io</a> and we'll review the request. There are no App Store or Google Play Premium purchases in the current product.",
    ),
    (
        "If we change subscription pricing, existing subscribers will be notified in advance in accordance with App Store/Google Play/Stripe requirements before any change takes effect on their subscription.",
        "If we change subscription pricing, existing subscribers will be notified in advance in accordance with Stripe requirements before any change takes effect on their subscription.",
    ),
    (
        "If you're signed in, your Premium entitlement syncs automatically to any device where you sign in with the same account. If you're not signed in, use “Restore Purchases” in Account settings on the same platform (iOS or Android) you originally subscribed on.",
        "If you're signed in with the same account, Premium syncs to the app automatically. If it does not, use Refresh Premium in the app Account screen.",
    ),
    (
        "This form doesn't submit anywhere yet — wire it to a real backend or a service like Formspree before launch.",
        "We'll reply by email. Don't include payment card numbers.",
    ),
]

SCRIPT = '<script src="/tonaura-site.js"></script>'


def patch_text(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def inject_script(text: str) -> str:
    if "tonaura-site.js" in text:
        return text
    lower = text.lower()
    idx = lower.rfind("</body>")
    if idx == -1:
        return text + "\n" + SCRIPT + "\n"
    return text[:idx] + SCRIPT + "\n" + text[idx:]


copied = 0
for html in SRC.glob("*.html"):
    raw = html.read_text(encoding="utf-8")
    patched = patch_text(raw)
    if patched != raw:
        html.write_text(patched, encoding="utf-8")
    dest = PUBLIC / html.name
    dest.write_text(inject_script(patched), encoding="utf-8")
    copied += 1

# App .env: strip spaces after = and add WEB_URL without printing secrets
if APP_ENV.exists():
    lines = APP_ENV.read_text(encoding="utf-8").splitlines()
    out = []
    seen_web = False
    for line in lines:
        if line.startswith("EXPO_PUBLIC_") or line.startswith("SUPABASE_"):
            if "=" in line:
                key, val = line.split("=", 1)
                line = f"{key}={val.strip()}"
        if line.startswith("EXPO_PUBLIC_WEB_URL="):
            seen_web = True
        if "REVENUECAT_WEBHOOK_SECRET" in line:
            continue
        if "RevenueCat secret API key" in line:
            continue
        out.append(line)
    if not seen_web:
        insert_at = 0
        for i, line in enumerate(out):
            if line.startswith("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="):
                insert_at = i + 1
                break
        out.insert(insert_at, "")
        out.insert(insert_at + 1, "EXPO_PUBLIC_WEB_URL=https://tonaura.io")
    body = "\n".join(out).rstrip() + "\n"
    APP_ENV.write_text(body, encoding="utf-8")

print(f"copied_html={copied}")
print("env_updated=yes" if APP_ENV.exists() else "env_updated=no")
