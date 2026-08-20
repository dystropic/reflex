import { NextResponse } from "next/server";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { prisma } from "@/hooks/db";
import { createSession } from "@/hooks/session";
import { solanaWalletMessage } from "@/hooks/walletMessage";

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address : "";
  const signature = typeof body?.signature === "string" ? body.signature : "";
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) || !signature) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const record = await prisma.walletNonce.findUnique({ where: { address } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "that took too long · try again" }, { status: 400 });
  }
  let valid = false;
  try {
    valid = nacl.sign.detached.verify(
      new TextEncoder().encode(solanaWalletMessage(address, record.nonce)),
      bs58.decode(signature),
      bs58.decode(address),
    );
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: "that signature didn't check out" }, { status: 401 });
  }
  await prisma.walletNonce.delete({ where: { address } });
  const user =
    (await prisma.user.findUnique({ where: { walletAddress: address } })) ??
    (await prisma.user.create({ data: { walletAddress: address } }));
  await createSession(user.id);
  return NextResponse.json({ ok: true });
};
