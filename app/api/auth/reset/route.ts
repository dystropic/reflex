import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/hooks/db";
import { createSession } from "@/hooks/session";

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "a password of 8 or more" },
      { status: 400 },
    );
  }
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "that link is dead or expired · ask for a new one" },
      { status: 400 },
    );
  }
  const passwordHash = await hash(password, 10);
  const owner = await prisma.user.findUnique({ where: { id: reset.userId } });
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: owner?.emailVerifiedAt
        ? { passwordHash }
        : { passwordHash, emailVerifiedAt: new Date() },
    }),
    prisma.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);
  await createSession(reset.userId);
  return NextResponse.json({ ok: true });
};
