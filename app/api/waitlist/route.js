import { NextResponse } from "next/server";

/** Waitlist is retired — product is live. */
export async function POST() {
  return NextResponse.json(
    { error: "Early access signup is closed. Create an account instead.", redirect: "/signup" },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Early access signup is closed. Create an account instead.", redirect: "/signup" },
    { status: 410 }
  );
}
