import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.honey || body._honey) return NextResponse.json({ ok: true });
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from("waitlist").insert({ email, source: body.source || "website" });
    if (error && error.code === "23505") return NextResponse.json({ ok: true, already: true });
    if (error) return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
  }
}
