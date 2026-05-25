const WEAK_JWT_SECRETS = new Set(["change-me-in-production", "super-secret-change-me"]);
const WEAK_ADMIN_PASSWORDS = new Set(["mlsa-secure-password"]);
const WEAK_IP_HASH_SALTS = new Set(["mlsa-anonymous-salt"]);

export const validateProductionEnv = () => {
  if ((process.env.NODE_ENV ?? "development") !== "production") {
    return;
  }

  const errors = [];
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const jwtSecret = process.env.JWT_SECRET ?? "change-me-in-production";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "mlsa-secure-password";
  const ipHashSalt = process.env.IP_HASH_SALT ?? "mlsa-anonymous-salt";

  if (!databaseUrl) {
    errors.push("DATABASE_URL is required in production");
  }

  if (!jwtSecret || jwtSecret.length < 32 || WEAK_JWT_SECRETS.has(jwtSecret)) {
    errors.push("JWT_SECRET must be set to a strong unique value (at least 32 characters)");
  }

  if (!adminPassword || adminPassword.length < 12 || WEAK_ADMIN_PASSWORDS.has(adminPassword)) {
    errors.push("ADMIN_PASSWORD must be set to a strong unique value (at least 12 characters)");
  }

  if (!ipHashSalt || ipHashSalt.length < 16 || WEAK_IP_HASH_SALTS.has(ipHashSalt)) {
    errors.push("IP_HASH_SALT must be set to a unique value (at least 16 characters)");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid production environment:\n- ${errors.join("\n- ")}`);
  }
};
