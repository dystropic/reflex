import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { IS_PROD } from "@/hooks/appMode";
import { coinById, unitsForCents } from "@/hooks/coins";
import { CONSTRAINTS, fundable } from "@/hooks/constraints";
import { prisma } from "@/hooks/db";
import { currentUser } from "@/hooks/session";

interface ParsedTokenTransfer {
  program?: string;
  parsed?: {
    type?: string;
    info?: {
      destination?: string;
      amount?: string;
      tokenAmount?: { amount?: string };
    };
  };
}

export const POST = async (req: Request) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  if (!IS_PROD) {
    return NextResponse.json({ error: "only anvil counts in test mode" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const signature = typeof body?.signature === "string" ? body.signature : "";
  const optionId = typeof body?.optionId === "string" ? body.optionId : "";
  const code = typeof body?.code === "string" ? body.code : "";
  const cents = Number(body?.cents);
  const option = coinById(optionId);
  const constraint = CONSTRAINTS.find((c) => c.code === code) ?? null;
  const treasuryOwner = process.env.SOLANA_TREASURY_ADDRESS ?? "";
  if (!treasuryOwner) {
    return NextResponse.json({ error: "solana isn't set up here" }, { status: 500 });
  }
  if (
    !option ||
    option.kind !== "sol-spl" ||
    !option.contract ||
    !constraint ||
    !fundable(constraint) ||
    !/^[1-9A-HJ-NP-Za-km-z]{60,100}$/.test(signature) ||
    !Number.isInteger(cents) ||
    cents < 1
  ) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const existing = await prisma.reserveFunding.findUnique({ where: { txHash: signature } });
  if (existing) {
    return NextResponse.json({ error: "that transaction already landed" }, { status: 409 });
  }
  const destination = getAssociatedTokenAddressSync(
    new PublicKey(option.contract),
    new PublicKey(treasuryOwner),
  ).toBase58();
  const connection = new Connection(
    process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  );
  let tx = null;
  for (let i = 0; i < 30; i++) {
    tx = await connection
      .getParsedTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      })
      .catch(() => null);
    if (tx) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (!tx || tx.meta?.err) {
    return NextResponse.json({ error: "the chain never confirmed that" }, { status: 400 });
  }
  const expected = unitsForCents(cents, option.decimals);
  const instructions = tx.transaction.message.instructions as ParsedTokenTransfer[];
  const paid = instructions.some((ix) => {
    if (ix.program !== "spl-token") return false;
    const type = ix.parsed?.type;
    if (type !== "transfer" && type !== "transferChecked") return false;
    if (ix.parsed?.info?.destination !== destination) return false;
    const raw =
      type === "transferChecked" ? ix.parsed?.info?.tokenAmount?.amount : ix.parsed?.info?.amount;
    if (!raw) return false;
    return BigInt(raw) >= expected;
  });
  if (!paid) {
    return NextResponse.json(
      { error: `no ${option.asset} reached the treasury` },
      { status: 400 },
    );
  }
  await prisma.reserveFunding.create({
    data: {
      userId: user.id,
      code,
      method: "coin",
      asset: `${option.asset} · ${option.chain}`,
      amountCents: cents,
      txHash: signature,
      status: "completed",
    },
  });
  const sum = await prisma.reserveFunding.aggregate({
    where: { userId: user.id, code, status: "completed" },
    _sum: { amountCents: true },
  });
  return NextResponse.json({ ok: true, code, cents, totalCents: sum._sum.amountCents ?? cents });
};
