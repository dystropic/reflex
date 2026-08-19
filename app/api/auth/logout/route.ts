import { NextResponse } from "next/server";
import { destroySession } from "@/hooks/session";

export const POST = async () => {
  await destroySession();
  return NextResponse.json({ ok: true });
};
