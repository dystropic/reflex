import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/hooks/db";
import { clientIp, rateLimit } from "@/hooks/rateLimit";
import { issueEmailVerification } from "@/hooks/verification";

export const POST = async (req: Request) => {
  if (!rateLimit(`register:${clientIp(req)}`, 3, 300_000)) {
    return NextResponse.json(
      { error: "too many accounts from here · wait a few minutes" },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "an email, and a password of 8 or more" },
      { status: 400 },
    );
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "that email is already here · switch to log in" },
      { status: 409 },
    );
  }
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });
  await issueEmailVerification(user.id, email);
  return NextResponse.json({
    ok: true,
    verify: true,
    message: "a link is on its way · verify your email to enter",
  });
};
