import { createAdminClient } from "./supabase/admin";

function unixToIso(seconds) {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

async function resolveUserId(admin, { userId, customerId, email }) {
  if (userId) return userId;
  if (customerId) {
    const { data } = await admin.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
    if (data?.id) return data.id;
  }
  return null;
}

async function alreadyProcessed(admin, eventId, userId, eventType) {
  const { error } = await admin.from("billing_events").insert({
    event_id: eventId,
    user_id: userId,
    event_type: eventType,
  });
  if (error && error.code === "23505") return true;
  if (error) throw error;
  return false;
}

async function upsertEntitlement(admin, userId, patch) {
  const row = {
    user_id: userId,
    entitlement_id: "premium",
    source: "stripe",
    store: "stripe",
    updated_at: new Date().toISOString(),
    ...patch,
  };
  const { error } = await admin.from("entitlement_cache").upsert(row, { onConflict: "user_id" });
  if (error) throw error;
}

async function attachCustomer(admin, userId, customerId) {
  if (!userId || !customerId) return;
  await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
}

export async function applyStripeEvent(event) {
  const admin = createAdminClient();
  const type = event.type;
  const obj = event.data?.object || {};

  if (type === "checkout.session.completed") {
    const userId = obj.client_reference_id || obj.metadata?.supabase_user_id;
    const customerId = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
    const resolved = await resolveUserId(admin, { userId, customerId, email: obj.customer_details?.email });
    if (await alreadyProcessed(admin, event.id, resolved, type)) return { skipped: true };
    if (!resolved) return { ignored: true, reason: "no user" };
    await attachCustomer(admin, resolved, customerId);

    const planKey = obj.metadata?.price_key || (obj.mode === "payment" ? "lifetime" : null);
    const lifetime = obj.mode === "payment" || planKey === "lifetime";
    await upsertEntitlement(admin, resolved, {
      is_active: true,
      plan_key: lifetime ? "lifetime" : planKey,
      product_id: lifetime ? "lifetime" : obj.metadata?.price_key || null,
      stripe_subscription_id: typeof obj.subscription === "string" ? obj.subscription : null,
      stripe_price_id: null,
      expires_at: lifetime ? null : null,
      environment: obj.livemode ? "live" : "test",
    });
    return { ok: true };
  }

  if (
    type === "customer.subscription.created" ||
    type === "customer.subscription.updated" ||
    type === "customer.subscription.deleted"
  ) {
    const customerId = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
    const userId = obj.metadata?.supabase_user_id;
    const resolved = await resolveUserId(admin, { userId, customerId });
    if (await alreadyProcessed(admin, event.id, resolved, type)) return { skipped: true };
    if (!resolved) return { ignored: true, reason: "no user" };
    await attachCustomer(admin, resolved, customerId);

    const item = obj.items?.data?.[0];
    const status = obj.status;
    const active = status === "active" || status === "trialing" || status === "past_due";
    const planKey =
      obj.metadata?.price_key ||
      (item?.price?.recurring?.interval === "year" ? "yearly" : item?.price?.recurring?.interval === "month" ? "monthly" : null);

    await upsertEntitlement(admin, resolved, {
      is_active: type === "customer.subscription.deleted" ? false : active,
      plan_key: planKey,
      product_id: item?.price?.id || null,
      stripe_subscription_id: obj.id,
      stripe_price_id: item?.price?.id || null,
      expires_at: unixToIso(obj.current_period_end),
      environment: status === "trialing" ? "trialing" : obj.livemode ? "live" : "test",
    });
    return { ok: true };
  }

  if (type === "invoice.paid" || type === "invoice.payment_failed") {
    const customerId = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
    const resolved = await resolveUserId(admin, { customerId });
    if (await alreadyProcessed(admin, event.id, resolved, type)) return { skipped: true };
    if (!resolved) return { ignored: true, reason: "no user" };
    if (type === "invoice.payment_failed") {
      await upsertEntitlement(admin, resolved, {
        is_active: false,
        environment: obj.livemode ? "live" : "test",
      });
    }
    return { ok: true };
  }

  return { ignored: true, reason: type };
}

export async function ensureStripeCustomer({ userId, email }) {
  const { getStripe } = await import("./stripe");
  const stripe = getStripe();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  if (profile?.stripe_customer_id) return profile.stripe_customer_id;
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { supabase_user_id: userId },
  });
  await admin.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}
