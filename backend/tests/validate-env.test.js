import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { validateProductionEnv } from "../src/config/validate-env.js";

describe("validateProductionEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows development defaults", () => {
    process.env.NODE_ENV = "development";
    process.env.JWT_SECRET = "change-me-in-production";

    assert.doesNotThrow(() => validateProductionEnv());
  });

  it("rejects weak production secrets", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "change-me-in-production";
    process.env.ADMIN_PASSWORD = "mlsa-secure-password";
    process.env.IP_HASH_SALT = "mlsa-anonymous-salt";

    assert.throws(() => validateProductionEnv(), /Invalid production environment/);
  });

  it("accepts strong production secrets", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "a".repeat(40);
    process.env.ADMIN_PASSWORD = "very-strong-admin-password";
    process.env.IP_HASH_SALT = "unique-production-salt-value";

    assert.doesNotThrow(() => validateProductionEnv());
  });
});
