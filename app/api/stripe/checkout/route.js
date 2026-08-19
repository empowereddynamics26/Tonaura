import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, priceIdFor, siteUrl } from "@/lib/stripe";
import { ensureStripeCustomer } from "@/lib/entitlement";

export async function POST(request) {
  try {
    const { priceKey } = await request.json();
    if (!["monthly", "yearly", "lifetime"].includes(priceKey)) {
      return NextResponse.json({ error: "Choose a plan." }, { status: 400 });
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const stripe = getStripe();
    const customerId = await ensureStripeCustomer({ userId: user.id, email: user.email });
    const lifetime = priceKey === "lifetime";
    const base = {
      mode: lifetime ? "payment" : "subscription",
      customer: customerId,
      client_reference_id: user.id,
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/account`,
      line_items: [{ price: priceIdFor(priceKey), quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      custom_text: {
        submit: {
          message: "Premium unlocks in the Tonaura app after you sign in with this same account.",
        },
      },
      metadata: { supabase_user_id: user.id, price_key: priceKey },
      ...(lifetime
        ? {
            payment_intent_data: {
              metadata: { supabase_user_id: user.id, price_key: priceKey },
            },
          }
        : {
            subscription_data: {
              metadata: { supabase_user_id: user.id, price_key: priceKey },
            },
          }),
    };
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ...base,
        consent_collection: { terms_of_service: "required" },
        custom_text: {
          ...base.custom_text,
          terms_of_service_acceptance: {
            message:
              "If you start using Premium immediately, you acknowledge that digital content is supplied and the 14-day cooling-off right may not apply to that use. See our Billing Policy.",
          },
        },
      });
    } catch (err) {
      if (!/terms of service/i.test(err.message || "")) throw err;
      session = await stripe.checkout.sessions.create(base);
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Checkout failed." }, { status: 500 });
  }
}
