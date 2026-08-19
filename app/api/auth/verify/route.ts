import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { createSession } from "@/hooks/session";

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json(
      { error: "no token here · use the link from your email" },
      { status: 400 },
    );
  }
  const record = await prisma.emailVerification.findUnique({
    where: { token },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "that link is dead or expired · ask for a new one" },
      { status: 400 },
    );
  }
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerification.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);
  } catch (e) {
    console.log("verify error", e);
    return NextResponse.json(
      { error: "that link is dead or expired · ask for a new one" },
      { status: 400 },
    );
  }
  await createSession(record.userId);
  return NextResponse.json({ ok: true });
};
