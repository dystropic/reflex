import { NextResponse } from "next/server";
import Stripe from "stripe";
import { CONSTRAINTS, fundable } from "@/hooks/constraints";
import { currentUser } from "@/hooks/session";

export const POST = async (req: Request) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const cents = Number(body?.cents);
  const constraint = CONSTRAINTS.find((c) => c.code === code) ?? null;
  if (!constraint || !fundable(constraint) || !Number.isInteger(cents) || cents < 50) {
    return NextResponse.json(
      { error: "cards start at $0.50 · that floor is stripe's, not ours" },
      { status: 400 },
    );
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "cards aren't set up here" }, { status: 500 });
  }
  const stripe = new Stripe(key);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: cents,
          product_data: { name: `RCA reserve · ${code}` },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?rs=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?rs=0`,
    metadata: { userId: user.id, code, cents: String(cents) },
  });
  return NextResponse.json({ url: session.url });
};
