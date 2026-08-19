import { NextResponse } from "next/server";
import { nearPriceUsd } from "@/hooks/nearPrice";

export const GET = async () => {
  try {
    const usd = await nearPriceUsd();
    return NextResponse.json({ usd });
  } catch {
    return NextResponse.json({ error: "near price unavailable" }, { status: 502 });
  }
};
