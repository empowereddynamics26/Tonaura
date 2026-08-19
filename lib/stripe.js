import Stripe from "stripe";

let stripe;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export const PRICE_KEYS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

export const PAYMENT_LINKS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY || "https://buy.stripe.com/00w5kCfwhfzidqwag42kw02",
  yearly: process.env.NEXT_PUBLIC_STRIPE_LINK_YEARLY || "https://buy.stripe.com/cNi28qck50Eo1HO87W2kw03",
  lifetime: process.env.NEXT_PUBLIC_STRIPE_LINK_LIFETIME || "https://buy.stripe.com/dRmdR82Jvbj286cfAo2kw01",
};

export function priceIdFor(key) {
  const id = PRICE_KEYS[key];
  if (!id) throw new Error(`Missing Stripe price for ${key}`);
  return id;
}

export function paymentLinkUrl(priceKey, { userId, email } = {}) {
  const base = PAYMENT_LINKS[priceKey];
  if (!base) throw new Error(`Missing Stripe payment link for ${priceKey}`);
  const url = new URL(base);
  if (userId) url.searchParams.set("client_reference_id", userId);
  if (email) url.searchParams.set("prefilled_email", email);
  return url.toString();
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
