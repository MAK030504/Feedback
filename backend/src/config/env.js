import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: toNumber(process.env.PORT, 5000),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "12h",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? "mlsa-admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "mlsa-secure-password",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  IP_HASH_SALT: process.env.IP_HASH_SALT ?? "mlsa-anonymous-salt",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  SUBMISSION_RATE_LIMIT_WINDOW_MS: toNumber(process.env.SUBMISSION_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  SUBMISSION_RATE_LIMIT_MAX: toNumber(process.env.SUBMISSION_RATE_LIMIT_MAX, 8),
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? "",
  ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL ?? "",
  ADMIN_DASHBOARD_URL: process.env.ADMIN_DASHBOARD_URL ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: toNumber(process.env.SMTP_PORT, 587),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "MLSA Feedback <noreply@localhost>",
};

export const isProduction = env.NODE_ENV === "production";
