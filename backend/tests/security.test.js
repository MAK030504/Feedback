import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareSecretToken, generateSecretToken } from "../src/utils/security.js";

describe("ticket secret tokens", () => {
  it("generates tokens that validate with bcrypt", async () => {
    const { plainToken, hashedToken } = await generateSecretToken();

    assert.match(plainToken, /^\d{4}$/);
    assert.equal(await compareSecretToken(plainToken, hashedToken), true);
    assert.equal(await compareSecretToken("0000", hashedToken), false);
  });
});
