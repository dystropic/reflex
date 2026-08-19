import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { clientIp, rateLimit } from "@/hooks/rateLimit";

export const POST = async (req: Request) => {
  if (!rateLimit(`near-nonce:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "too many tries · wait a minute" },
      { status: 429 },
    );
  }
  const key = randomBytes(16).toString("hex");
  const nonce = randomBytes(32).toString("base64");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  await prisma.walletNonce.create({
    data: { address: `near-${key}`, nonce, expiresAt },
  });
  return NextResponse.json({ key, nonce });
};
