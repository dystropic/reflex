import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/hooks/db";

const COOKIE = "rca_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const createSession = async (userId: string) => {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
};

export const currentSession = async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
};

export const currentUser = async () => (await currentSession())?.user ?? null;

export const destroySession = async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  jar.delete(COOKIE);
};
