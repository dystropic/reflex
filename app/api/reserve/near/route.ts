import { NextResponse } from "next/server";
import { IS_PROD } from "@/hooks/appMode";
import { coinById, unitsForCents, unitsForUsdAtPrice } from "@/hooks/coins";
import { CONSTRAINTS, fundable } from "@/hooks/constraints";
import { prisma } from "@/hooks/db";
import { nearPriceUsd } from "@/hooks/nearPrice";
import { currentUser } from "@/hooks/session";

interface NearAction {
  Transfer?: { deposit: string };
  FunctionCall?: { method_name: string; args: string; deposit: string };
}

export const POST = async (req: Request) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  if (!IS_PROD) {
    return NextResponse.json({ error: "only anvil counts in test mode" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const txHash = typeof body?.txHash === "string" ? body.txHash : "";
  const senderId = typeof body?.senderId === "string" ? body.senderId.toLowerCase() : "";
  const optionId = typeof body?.optionId === "string" ? body.optionId : "";
  const code = typeof body?.code === "string" ? body.code : "";
  const cents = Number(body?.cents);
  const option = coinById(optionId);
  const constraint = CONSTRAINTS.find((c) => c.code === code) ?? null;
  const treasury = (process.env.NEAR_TREASURY ?? "").toLowerCase();
  if (!treasury) {
    return NextResponse.json({ error: "near treasury isn't set up here" }, { status: 500 });
  }
  if (
    !option ||
    (option.kind !== "near-native" && option.kind !== "near-ft") ||
    !constraint ||
    !fundable(constraint) ||
    !/^[1-9A-HJ-NP-Za-km-z]{40,50}$/.test(txHash) ||
    !/^[a-z0-9._-]{2,64}$/.test(senderId) ||
    !Number.isInteger(cents) ||
    cents < 1
  ) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  const existing = await prisma.reserveFunding.findUnique({ where: { txHash } });
  if (existing) {
    return NextResponse.json({ error: "that transaction already landed" }, { status: 409 });
  }
  const rpc = process.env.NEAR_RPC ?? "https://rpc.mainnet.near.org";
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "tx",
      params: { tx_hash: txHash, sender_account_id: senderId, wait_until: "FINAL" },
    }),
  });
  const data = await res.json().catch(() => null);
  const status = data?.result?.status;
  if (!data || data.error || !status || typeof status.SuccessValue === "undefined") {
    return NextResponse.json({ error: "the chain never confirmed that" }, { status: 400 });
  }
  const tx = data.result.transaction;
  const actions: NearAction[] = tx?.actions ?? [];
  let paid = false;
  if (option.kind === "near-native") {
    if ((tx?.receiver_id ?? "").toLowerCase() === treasury) {
      const price = await nearPriceUsd();
      const expected = unitsForUsdAtPrice(cents / 100, price, 24);
      const tolerated = expected - expected / 20n;
      paid = actions.some(
        (action) => action.Transfer && BigInt(action.Transfer.deposit) >= tolerated,
      );
    }
  } else {
    if ((tx?.receiver_id ?? "") === option.contract) {
      const expected = unitsForCents(cents, option.decimals);
      paid = actions.some((action) => {
        if (!action.FunctionCall || action.FunctionCall.method_name !== "ft_transfer") return false;
        try {
          const args = JSON.parse(Buffer.from(action.FunctionCall.args, "base64").toString("utf8"));
          return (
            (args.receiver_id ?? "").toLowerCase() === treasury &&
            BigInt(args.amount ?? "0") >= expected
          );
        } catch {
          return false;
        }
      });
    }
  }
  if (!paid) {
    return NextResponse.json(
      { error: `no ${option.asset} reached the treasury in that transaction` },
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
      txHash,
      status: "completed",
    },
  });
  const sum = await prisma.reserveFunding.aggregate({
    where: { userId: user.id, code, status: "completed" },
    _sum: { amountCents: true },
  });
  return NextResponse.json({ ok: true, code, cents, totalCents: sum._sum.amountCents ?? cents });
};
