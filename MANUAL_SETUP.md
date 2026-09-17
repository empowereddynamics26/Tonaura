# Manual setup (owner)

Code for auth, Stripe checkout, waitlist, contact, admin, and app Premium-from-database is in the repos. This file is only what still needs a human in a dashboard, bank, or legal form. Do these in order.

## 1. Supabase database (blocks everything)

Tables are not on the live project yet. From the app repo (`tonaura-app`):

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. `supabase login`
3. `supabase link --project-ref smztynxgsuumjphzragf`
4. `supabase db push`

That applies `supabase/migrations/` including waitlist, contact, Stripe columns, admin role, and `delete_own_account`.

Until this is done: website waitlist/contact/checkout and app Premium refresh will fail.

## 2. First admin

In Supabase SQL editor, after you have created your own account on the website:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOU@YOURDOMAIN');
```

Or set `ADMIN_EMAILS=you@yourdomain` on Vercel (comma-separated). The admin page is `/admin`.

## 3. Auth URLs (Supabase Dashboard → Authentication)

**URL configuration**

- Site URL: `https://tonaura.com`
- Redirect allow list (add all of these):
  - `https://tonaura.com/auth/callback`
  - `https://www.tonaura.com/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `tonaura://auth/callback`

**Email**

- Confirm signups.
- Set the sender to a domain you control after DNS (below).
- Password reset emails must use the website callback, not a random Vercel URL.

**Google (needed for “Continue with Google” on website + app)**

Website and app both use Supabase `signInWithOAuth({ provider: "google" })`. No app-side Google client IDs are required for this flow.

1. Google Cloud Console → OAuth consent screen: authorized domains include `tonaura.com` and `supabase.co`.
2. Credentials → OAuth client ID (Web): JavaScript origins `https://tonaura.com`, `http://localhost:3000`.
3. Authorized redirect URI must stay exactly:
   `https://smztynxgsuumjphzragf.supabase.co/auth/v1/callback`
4. Supabase → Authentication → Providers → Google: enable and paste Client ID + secret.
5. Site URL should be `https://tonaura.com` (www and legacy `.io` already 301 to apex).

**Apple (disabled in production for now)**

Apple is **disabled** in Supabase and the production “Continue with Apple” CTA is hidden on website + app. Keep Apple Developer / Services ID work for a later pass — do not send users into a broken Apple OAuth flow.

## 4. Stripe

1. Create a Stripe account (use the Empowered Dynamics legal entity).
2. Products + prices (GBP):
   - Monthly £3.99 → copy Price ID to `STRIPE_PRICE_MONTHLY`
   - Yearly £24.99 → `STRIPE_PRICE_YEARLY`
   - Lifetime £39.99 one-time → `STRIPE_PRICE_LIFETIME`
3. Customer Portal: enable cancel, plan change, invoices. Set branding.
4. Settings → Customer Portal / Checkout: add Terms of Service URL `https://tonaura.com/terms.html` so Checkout can collect TOS + the cooling-off acknowledgement.
5. Webhook endpoint: `https://tonaura.com/api/stripe/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.  
   Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
6. Keys: `STRIPE_SECRET_KEY` (server) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
7. Stripe Tax / VAT: turn on if you charge VAT. Confirm the 14-day digital-content wording on Checkout matches what you want legally.
8. If you want a 7-day trial, set it on the Stripe prices (not in the app). The app no longer starts a fake local trial.

Test with Stripe test keys first, then switch to live keys.

## 5. Vercel (website)

Repo: `empowereddynamics26/Tonaura`.

1. Root Directory must be the **repo root** (where `package.json` / `next.config.mjs` live). Unset any old nested path such as `tonaura-website/tonaura-website-final` — that is why the previous deploy 404’d.
2. Framework: Next.js.
3. Environment variables (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://tonaura.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY
STRIPE_PRICE_YEARLY
STRIPE_PRICE_LIFETIME
ADMIN_EMAILS
```

4. Custom domain `tonaura.com` + `www`.
5. Redeploy after env vars.

Local: copy `.env.example` to `.env.local`, fill values, `npm install`, `npm run dev`.

## 6. App env

In `tonaura-app/.env`:

- Keep the existing Supabase URL + publishable key (no spaces around `=`).
- Add `EXPO_PUBLIC_WEB_URL=https://tonaura.com` (use `http://localhost:3000` while testing checkout locally).
- Never put the service role key or Stripe secret in the app.

## 7. Email (Fastmail)

Point these at mailboxes you read, with SPF/DKIM/DMARC on the domain:

- `support@tonaura.io`
- `info@tonaura.io` (welcome / waitlist)
- `privacy@tonaura.io`
- `billing@tonaura.io`
- `legal@tonaura.io`

### 7A. Supabase auth emails (confirm signup + password reset)

Project Settings → Authentication → SMTP → enable custom SMTP with Fastmail:

- Host `smtp.fastmail.com`, port `465`, SSL
- User: your Fastmail address (often `support@tonaura.io`)
- Pass: Fastmail **App Password**
- Sender: `Tonaura <support@tonaura.io>`

Then open Authentication → Email Templates and brand Confirm signup + Reset password.

### 7B. Website transactional emails (Vercel)

Add the same Fastmail SMTP values as Vercel env vars (see `.env.example`):

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
`MAIL_FROM_SUPPORT`, `MAIL_FROM_INFO`, `MAIL_FROM_BILLING`, `MAIL_SUPPORT_INBOX`

These send:

- Welcome after website signup
- Payment confirmed after Stripe checkout
- Subscription confirmed / ended
- Contact auto-reply + notify support inbox
- Waitlist thank-you

Stripe still sends its own payment receipt separately.

### 7C. Fastmail App Password

Fastmail → Settings → Password & Security → App Passwords → create one for “Tonaura SMTP”.
Use that as `SMTP_PASS` (and in Supabase SMTP). Never commit it.

## 8. Stores (when you ship the app)

- Apple Developer Programme ($99/year).
- Google Play Console.
- EAS Build (`eas.json` is already in the app).
- App Store / Play listings, screenshots, privacy nutrition labels, Data Safety.
- Age rating, Health & Fitness (not Medical). Do not claim live heart-rate until HealthKit is real.
- Because Premium is sold on the website, do **not** add IAP products for the same unlock in the app. Keep the in-app buttons as “continue on tonaura.com”. Confirm Reader-app / external-purchase rules with Apple if you later sell inside the US.

## 9. Company / legal (not in git)

- Confirm company name, address, VAT number on the legal pages if they are still placeholders.
- UK 14-day cooling-off: you still need to be happy with the Checkout acknowledgement. A lawyer should sign off if you are unsure.
- Trademark search for “Tonaura”.
- Real social profile URLs (footers currently point at generic instagram.com / x.com / etc.).
- Cookie banner is preference-only; no analytics is wired. If you add analytics later, update the Cookie Policy.

## 10. Smoke test after the dashboards are filled

1. Create an account on `https://tonaura.com/signup`.
2. Confirm the email.
3. Subscribe with a Stripe test card.
4. Confirm `/account` shows Premium.
5. Open the app, sign in with the **same email**, tap Refresh Premium — mixer locks should lift.
6. Submit waitlist on the homepage and a message on `/contact.html`; both should appear on `/admin`.
7. Delete-account on the website should cancel Stripe subscriptions then remove the user.

Do not commit `.env` or `.env.local`.
