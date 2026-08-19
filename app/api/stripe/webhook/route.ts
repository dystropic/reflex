import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/hooks/db";

export const POST = async (req: Request) => {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!key || !whSecret || !signature) {
    return NextResponse.json({ error: "stripe isn't set up here" }, { status: 500 });
  }
  const stripe = new Stripe(key);
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, whSecret);
  } catch {
    return NextResponse.json({ error: "that signature didn't check out" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const code = session.metadata?.code;
    const cents = Number(session.metadata?.cents);
    if (userId && code && Number.isInteger(cents) && cents > 0) {
      const already = await prisma.reserveFunding.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (!already) {
        await prisma.reserveFunding.create({
          data: {
            userId,
            code,
            method: "card",
            asset: "USD · Stripe",
            amountCents: session.amount_total ?? cents,
            stripeSessionId: session.id,
            status: "completed",
          },
        });
      }
    }
  }
  return NextResponse.json({ received: true });
};
