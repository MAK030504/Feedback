import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";

export const ensureAdminSeeded = async () => {
  const existing = await prisma.admin.findUnique({
    where: {
      username: env.ADMIN_USERNAME,
    },
  });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  await prisma.admin.create({
    data: {
      username: env.ADMIN_USERNAME,
      passwordHash,
    },
  });
};
