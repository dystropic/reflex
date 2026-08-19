import { NextResponse } from "next/server";
import { currentUser } from "@/hooks/session";

export const GET = async () => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
    },
  });
};
