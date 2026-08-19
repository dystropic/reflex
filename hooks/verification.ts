import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/hooks/db";
import { sendEmailVerification } from "@/hooks/mailer";

export const issueEmailVerification = async (userId: string, email: string) => {
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerification.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmailVerification(email, `${origin}/verify?token=${token}`);
};
