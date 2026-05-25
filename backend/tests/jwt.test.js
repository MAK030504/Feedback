import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { verifyAdminToken } from "../src/utils/jwt.js";

describe("verifyAdminToken", () => {
  it("accepts a valid admin JWT", () => {
    const token = jwt.sign({ adminId: 1, username: "mlsa-admin" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const payload = verifyAdminToken(token);

    assert.equal(payload.adminId, 1);
    assert.equal(payload.username, "mlsa-admin");
  });

  it("rejects missing or invalid tokens", () => {
    assert.throws(() => verifyAdminToken(undefined), /Missing admin token/);
    assert.throws(() => verifyAdminToken("not-a-real-token"));
  });
});
