import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { currentUser } from "@/hooks/session";

export const GET = async () => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ totals: {}, history: {} });
  const rows = await prisma.reserveFunding.groupBy({
    by: ["code"],
    where: { userId: user.id, status: "completed" },
    _sum: { amountCents: true },
  });
  const totals: Record<string, number> = {};
  for (const row of rows) {
    totals[row.code] = row._sum.amountCents ?? 0;
  }
  const recent = await prisma.reserveFunding.findMany({
    where: { userId: user.id, status: "completed" },
    orderBy: { createdAt: "desc" },
  });
  const history: Record<
    string,
    { cents: number; method: string; createdAt: string; txHash: string | null; chainId: number | null }[]
  > = {};
  for (const row of recent) {
    if (!history[row.code]) history[row.code] = [];
    history[row.code].push({
      cents: row.amountCents,
      method: row.method,
      createdAt: row.createdAt.toISOString(),
      txHash: row.txHash,
      chainId: row.chainId,
    });
  }
  return NextResponse.json({ totals, history });
};
