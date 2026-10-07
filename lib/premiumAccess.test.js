import test from "node:test";
import assert from "node:assert/strict";
import { isAccessActive, premiumFromSources } from "./premiumAccess.js";

const now = Date.parse("2026-10-07T12:00:00Z");
const future = "2026-11-07T12:00:00Z";
const past = "2026-10-01T12:00:00Z";
const stripe = { is_active: true, source: "stripe", plan_key: "monthly", expires_at: future };
const play = { store: "PLAY_STORE", is_active: true, plan_key: "yearly", expires_at: future };
const playLifetime = { store: "PLAY_STORE", is_active: true, plan_key: "lifetime", expires_at: null };
const playExpired = { store: "PLAY_STORE", is_active: true, plan_key: "monthly", expires_at: past };
const playRefunded = { store: "PLAY_STORE", is_active: false, plan_key: "yearly", expires_at: future };

test("Play premium is visible when Stripe is absent", () => {
  const access = premiumFromSources(null, [play], now);
  assert.equal(access.active, true);
  assert.equal(access.kind, "store");
  assert.equal(access.source, "PLAY_STORE");
  assert.equal(access.planKey, "yearly");
});

test("active Stripe stays premium after Play expires or is refunded", () => {
  assert.equal(premiumFromSources(stripe, [playExpired], now).kind, "stripe");
  assert.equal(premiumFromSources(stripe, [playRefunded], now).kind, "stripe");
});

test("Play stays premium after Stripe expires", () => {
  const expiredStripe = { ...stripe, expires_at: past };
  assert.equal(premiumFromSources(expiredStripe, [play], now).kind, "store");
});

test("lifetime Play has no expiry", () => {
  const access = premiumFromSources(null, [playLifetime], now);
  assert.equal(access.active, true);
  assert.equal(access.expiresAt, null);
  assert.equal(isAccessActive(playLifetime, now), true);
});

test("both inactive means free", () => {
  const access = premiumFromSources({ is_active: false, source: "stripe" }, [playRefunded], now);
  assert.equal(access.active, false);
});
