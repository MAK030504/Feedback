import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareSecretToken, generateSecretToken } from "../src/utils/security.js";

describe("ticket secret tokens", () => {
  it("generates tokens that validate with bcrypt", async () => {
    const { plainToken, hashedToken } = await generateSecretToken();

    assert.equal(typeof plainToken, "string");
    assert.equal(plainToken.length >= 16, true);
    assert.equal(await compareSecretToken(plainToken, hashedToken), true);
    assert.equal(await compareSecretToken("wrong-token", hashedToken), false);
  });
});
