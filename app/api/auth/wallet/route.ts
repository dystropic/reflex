import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { prisma } from "@/hooks/db";
import { createSession } from "@/hooks/session";
import { walletMessage } from "@/hooks/walletMessage";

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.toLowerCase() : "";
  const signature = typeof body?.signature === "string" ? body.signature : "";
  if (!/^0x[0-9a-f]{40}$/.test(address) || !signature.startsWith("0x")) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const record = await prisma.walletNonce.findUnique({ where: { address } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "that took too long · try again" }, { status: 400 });
  }
  const valid = await verifyMessage({
    address: address as `0x${string}`,
    message: walletMessage(address, record.nonce),
    signature: signature as `0x${string}`,
  });
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
