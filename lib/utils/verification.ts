import { randomBytes } from "crypto";
import prisma from "../prisma";

const TOKEN_EXPIRY_HOURS = 1;

export async function createVerificationToken(email: string): Promise<string> {
  await prisma.verification.deleteMany({
    where: {
      identifier: email,
    },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  await prisma.verification.create({
    data: {
      id: randomBytes(16).toString("hex"),
      identifier: email,
      value: token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyToken(
  email: string,
  token: string
): Promise<{ valid: boolean; expired?: boolean }> {
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: email,
      value: token,
    },
  });

  if (!verification) {
    return { valid: false };
  }

  if (verification.expiresAt < new Date()) {
    return { valid: false, expired: true };
  }

  await prisma.$transaction([
    prisma.verification.delete({
      where: {
        id: verification.id,
      },
    }),
    prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    }),
  ]);

  return { valid: true };
}

export async function canResendVerification(email: string): Promise<boolean> {
  const recentVerification = await prisma.verification.findFirst({
    where: {
      identifier: email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!recentVerification) {
    return true;
  }

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  return recentVerification.createdAt < oneHourAgo;
}
