import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const hashIp = (request) => {
  const source = `${request.ip}|${request.headers["user-agent"] ?? "unknown"}|${env.IP_HASH_SALT}`;
  return crypto.createHash("sha256").update(source).digest("hex");
};

export const generateSecretToken = async () => {
  const plainToken = String(crypto.randomInt(0, 10_000)).padStart(4, "0");
  const hashedToken = await bcrypt.hash(plainToken, 10);

  return { plainToken, hashedToken };
};

export const compareSecretToken = async (plainToken, hashedToken) => {
  if (!plainToken || !hashedToken) {
    return false;
  }

  return bcrypt.compare(plainToken, hashedToken);
};
