import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PLANS = new Set(["monthly", "yearly", "lifetime"]);

export async function POST(request) {
  const { ok, user } = await requireAdmin(request);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const userId = body?.user_id;
  const action = body?.action;
  const planKey = PLANS.has(body?.plan_key) ? body.plan_key : "monthly";

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "user_id required." }, { status: 400 });
  }
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ error: "action must be grant or revoke." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (action === "revoke") {
    const { error } = await admin
      .from("entitlement_cache")
      .upsert(
        {
          user_id: userId,
          is_active: false,
          source: "manual",
          updated_at: new Date().toISOString(),
          plan_key: planKey,
          environment: "admin",
        },
        { onConflict: "user_id" }
      );
    if (error) return NextResponse.json({ error: "Could not revoke." }, { status: 500 });
    return NextResponse.json({ ok: true, action: "revoke", by: user.email });
  }

  const expires =
    planKey === "lifetime"
      ? null
      : new Date(Date.now() + (planKey === "yearly" ? 365 : 31) * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await admin.from("entitlement_cache").upsert(
    {
      user_id: userId,
      is_active: true,
      source: "manual",
      plan_key: planKey,
      expires_at: expires,
      environment: "admin",
      updated_at: new Date().toISOString(),
      product_id: `manual_${planKey}`,
      store: "web",
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message || "Could not grant." }, { status: 500 });
  return NextResponse.json({ ok: true, action: "grant", plan_key: planKey, by: user.email });
}
