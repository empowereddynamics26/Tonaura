import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentLinkUrl } from "@/lib/stripe";

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

    const url = paymentLinkUrl(priceKey, { userId: user.id, email: user.email });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Checkout failed." }, { status: 500 });
  }
}
