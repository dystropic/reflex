import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/hooks/db";
import { clientIp, rateLimit } from "@/hooks/rateLimit";
import { createSession } from "@/hooks/session";

export const POST = async (req: Request) => {
  if (!rateLimit(`login:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "too many tries · wait a minute" },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "no account with that email · switch to create account" },
      { status: 404 },
    );
  }
  if (!(await compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "wrong password · try again" }, { status: 401 });
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      {
        error: "verify your email first · check your inbox",
        unverified: true,
      },
      { status: 403 },
    );
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
};
