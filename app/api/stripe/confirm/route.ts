import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/hooks/db";
import { currentUser } from "@/hooks/session";

export const POST = async (req: Request) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "cards aren't set up here" }, { status: 500 });
  }
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  if (!session || session.payment_status !== "paid") {
    return NextResponse.json({ error: "stripe never confirmed that" }, { status: 400 });
  }
  if (session.metadata?.userId !== user.id) {
    return NextResponse.json({ error: "that checkout isn't yours" }, { status: 403 });
  }
  const code = session.metadata?.code ?? "";
  const cents = session.amount_total ?? Number(session.metadata?.cents) ?? 0;
  if (!code || cents < 1) {
    return NextResponse.json({ error: "that checkout was missing details" }, { status: 400 });
  }
  const already = await prisma.reserveFunding.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (!already) {
    await prisma.reserveFunding.create({
      data: {
        userId: user.id,
        code,
        method: "card",
        asset: "USD · Stripe",
        amountCents: cents,
        stripeSessionId: session.id,
        status: "completed",
      },
    });
  }
  const sum = await prisma.reserveFunding.aggregate({
    where: { userId: user.id, code, status: "completed" },
    _sum: { amountCents: true },
  });
  return NextResponse.json({
    ok: true,
    code,
    cents,
    totalCents: sum._sum.amountCents ?? cents,
  });
};
