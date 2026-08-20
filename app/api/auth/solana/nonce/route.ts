import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { clientIp, rateLimit } from "@/hooks/rateLimit";
import { solanaWalletMessage } from "@/hooks/walletMessage";

export const POST = async (req: Request) => {
  if (!rateLimit(`sol-nonce:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "too many tries · wait a minute" },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address : "";
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: "that address doesn't look right" }, { status: 400 });
  }
  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  await prisma.walletNonce.upsert({
    where: { address },
    update: { nonce, expiresAt },
    create: { address, nonce, expiresAt },
  });
  return NextResponse.json({ nonce, message: solanaWalletMessage(address, nonce) });
};
