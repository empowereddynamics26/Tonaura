/** Read-only Premium check. Stripe writes stay on entitlement_cache. */
export function isAccessActive(row, now = Date.now()) {
  if (!row || !row.is_active) return false;
  if (row.expires_at) {
    const exp = Date.parse(row.expires_at);
    if (!Number.isNaN(exp) && exp < now) return false;
  }
  return true;
}

/**
 * Premium is on when Stripe (entitlement_cache) OR a store row
 * (store_entitlements) is active and unexpired. Stripe wins for display.
 * Expiry on one source does not revoke the other.
 */
export function premiumFromSources(stripeRow, storeRows = [], now = Date.now()) {
  if (isAccessActive(stripeRow, now)) {
    return {
      active: true,
      planKey: stripeRow.plan_key || null,
      source: stripeRow.source || "stripe",
      expiresAt: stripeRow.expires_at || null,
      kind: "stripe",
    };
  }
  const store = (storeRows || []).find((row) => isAccessActive(row, now));
  if (store) {
    return {
      active: true,
      planKey: store.plan_key || null,
      source: store.store || "store",
      expiresAt: store.expires_at || null,
      kind: "store",
    };
  }
  return { active: false, planKey: null, source: null, expiresAt: null, kind: null };
}
