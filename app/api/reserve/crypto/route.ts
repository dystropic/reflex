import { NextResponse } from "next/server";
import { createPublicClient, erc20Abi, http, parseEventLogs } from "viem";
import { IS_PROD } from "@/hooks/appMode";
import { coinById, EVM_CHAINS, unitsForCents } from "@/hooks/coins";
import { CONSTRAINTS, fundable } from "@/hooks/constraints";
import { prisma } from "@/hooks/db";
import { currentUser } from "@/hooks/session";

const rpcFor = (chainId: number) => {
  const url =
    chainId === 31337
      ? (process.env.ANVIL_RPC ?? "http://127.0.0.1:8545")
      : chainId === 1
        ? (process.env.RPC_ETH || process.env.NEXT_PUBLIC_RPC_ETH)
        : chainId === 137
          ? (process.env.RPC_POLYGON || process.env.NEXT_PUBLIC_RPC_POLYGON)
          : chainId === 8453
            ? (process.env.RPC_BASE || process.env.NEXT_PUBLIC_RPC_BASE)
            : chainId === 42161
              ? (process.env.RPC_ARBITRUM || process.env.NEXT_PUBLIC_RPC_ARBITRUM)
              : undefined;
  return url || undefined;
};

export const POST = async (req: Request) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const txHash = typeof body?.txHash === "string" ? body.txHash : "";
  const optionId = typeof body?.optionId === "string" ? body.optionId : "";
  const code = typeof body?.code === "string" ? body.code : "";
  const cents = Number(body?.cents);
  const option = coinById(optionId);
  const constraint = CONSTRAINTS.find((c) => c.code === code) ?? null;
  if (
    !option ||
    (option.kind !== "evm-native" && option.kind !== "evm-erc20") ||
    option.chainId === null ||
    !constraint ||
    !fundable(constraint) ||
    !/^0x[0-9a-fA-F]{64}$/.test(txHash) ||
    !Number.isInteger(cents) ||
    cents < 1
  ) {
    return NextResponse.json({ error: "that request was missing something" }, { status: 400 });
  }
  if (IS_PROD && option.chainId === 31337) {
    return NextResponse.json({ error: "test coins don't count in production" }, { status: 400 });
  }
  if (!IS_PROD && option.chainId !== 31337) {
    return NextResponse.json({ error: "only anvil counts in test mode" }, { status: 400 });
  }
  const existing = await prisma.reserveFunding.findUnique({ where: { txHash } });
  if (existing) {
    return NextResponse.json({ error: "that transaction already landed" }, { status: 409 });
  }
  const treasury = (
    option.chainId === 31337
      ? (process.env.ANVIL_TREASURY_ADDRESS ?? "")
      : (process.env.TREASURY_ADDRESS ?? "")
  ).toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(treasury)) {
    return NextResponse.json({ error: "treasury isn't set up here" }, { status: 500 });
  }
  const chain = EVM_CHAINS[option.chainId];
  const client = createPublicClient({ chain, transport: http(rpcFor(option.chainId)) });
  const receipt = await client
    .waitForTransactionReceipt({ hash: txHash as `0x${string}`, timeout: 180_000 })
    .catch(() => null);
  if (!receipt || receipt.status !== "success") {
    return NextResponse.json({ error: "the chain never confirmed that" }, { status: 400 });
  }
  const expected = unitsForCents(cents, option.decimals);
  let paid = false;
  if (option.kind === "evm-native") {
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` }).catch(() => null);
    paid = !!tx && (tx.to ?? "").toLowerCase() === treasury && tx.value >= expected;
  } else {
    const transfers = parseEventLogs({ abi: erc20Abi, logs: receipt.logs, eventName: "Transfer" });
    paid = transfers.some(
      (log) =>
        log.address.toLowerCase() === (option.contract ?? "").toLowerCase() &&
        log.args.to.toLowerCase() === treasury &&
        log.args.value >= expected,
    );
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
      chainId: option.chainId,
      amountCents: cents,
      txHash,
      status: "completed",
    },
  });
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
