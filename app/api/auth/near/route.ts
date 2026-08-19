import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { serialize } from "borsh";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { prisma } from "@/hooks/db";
import { NEAR_MESSAGE, NEAR_RECIPIENT } from "@/hooks/nearMessage";
import { createSession } from "@/hooks/session";

const PAYLOAD_SCHEMA = {
  struct: {
    tag: "u32",
    message: "string",
    nonce: { array: { type: "u8", len: 32 } },
    recipient: "string",
    callbackUrl: { option: "string" },
  },
};

const fullAccessKeyOnChain = async (accountId: string, publicKey: string) => {
  const rpc = process.env.NEAR_RPC ?? "https://rpc.mainnet.near.org";
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "query",
      params: {
        request_type: "view_access_key",
        finality: "final",
        account_id: accountId,
        public_key: publicKey,
      },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!data || data.error || data.result?.error) return false;
  return data.result?.permission === "FullAccess";
};

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const accountId = typeof body?.accountId === "string" ? body.accountId.toLowerCase() : "";
  const publicKey = typeof body?.publicKey === "string" ? body.publicKey : "";
  const signature = typeof body?.signature === "string" ? body.signature : "";
  const callbackUrl =
    typeof body?.callbackUrl === "string" && body.callbackUrl.length <= 300
      ? body.callbackUrl
      : null;
  if (
    !/^[0-9a-f]{32}$/.test(key) ||
    !/^[a-z0-9._-]{2,64}$/.test(accountId) ||
    !publicKey.startsWith("ed25519:") ||
    !signature
  ) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const record = await prisma.walletNonce.findUnique({
    where: { address: `near-${key}` },
  });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "that took too long · try again" }, { status: 400 });
  }
  const nonceBytes = Buffer.from(record.nonce, "base64");
  if (nonceBytes.length !== 32) {
    return NextResponse.json({ error: "that took too long · try again" }, { status: 400 });
  }
  let valid = false;
  try {
    const payload = serialize(PAYLOAD_SCHEMA, {
      tag: 2147484061,
      message: NEAR_MESSAGE,
      nonce: Array.from(nonceBytes),
      recipient: NEAR_RECIPIENT,
      callbackUrl,
    });
    const hash = createHash("sha256").update(payload).digest();
    valid = nacl.sign.detached.verify(
      new Uint8Array(hash),
      new Uint8Array(Buffer.from(signature, "base64")),
      bs58.decode(publicKey.slice("ed25519:".length)),
    );
  } catch (e) {
    console.log("near verify error", e);
  }
  if (!valid) {
    return NextResponse.json({ error: "that signature didn't check out" }, { status: 401 });
  }
  if (!(await fullAccessKeyOnChain(accountId, publicKey))) {
    return NextResponse.json(
      { error: "that key doesn't belong to that account" },
      { status: 401 },
    );
  }
  await prisma.walletNonce.delete({ where: { address: `near-${key}` } });
  const user =
    (await prisma.user.findUnique({ where: { walletAddress: accountId } })) ??
    (await prisma.user.create({ data: { walletAddress: accountId } }));
  await createSession(user.id);
  return NextResponse.json({ ok: true });
};
