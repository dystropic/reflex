import { NextResponse } from "next/server";
import { prisma } from "@/hooks/db";
import { clientIp, rateLimit } from "@/hooks/rateLimit";
import { issueEmailVerification } from "@/hooks/verification";

export const POST = async (req: Request) => {
  if (!rateLimit(`verify-resend:${clientIp(req)}`, 3, 900_000)) {
    return NextResponse.json(
      { error: "too many tries · wait a while" },
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
  if (user?.passwordHash && !user.emailVerifiedAt) {
    await issueEmailVerification(user.id, email);
  }
  return NextResponse.json({
    ok: true,
    message: "if that email needs a link, a fresh one is on its way",
  });
};
