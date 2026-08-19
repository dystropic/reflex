import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { sendPasswordReset } from "@/hooks/mailer";
import { clientIp, rateLimit } from "@/hooks/rateLimit";

export const POST = async (req: Request) => {
  if (!rateLimit(`forgot:${clientIp(req)}`, 3, 900_000)) {
    return NextResponse.json(
      { error: "too many reset requests · wait a while" },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email.includes("@")) {
    return NextResponse.json({ error: "type a real email" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendPasswordReset(email, `${origin}/reset?token=${token}`);
  }
  return NextResponse.json({
    ok: true,
    message: "if that email has an account, a link is on its way",
  });
};
