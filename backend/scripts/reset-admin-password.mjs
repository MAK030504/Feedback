import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma/client.js";

const password = process.argv[2];
const username = process.env.ADMIN_USERNAME ?? "mlsa-admin";

if (!password || password.length < 12) {
  console.error("Usage: node scripts/reset-admin-password.mjs <password-min-12-chars>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.admin.upsert({
  where: { username },
  update: { passwordHash },
  create: { username, passwordHash },
});

await prisma.$disconnect();
console.log(`Admin password updated for: ${username}`);
