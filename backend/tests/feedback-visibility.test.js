import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isVisibleOnTicketThread,
  stripSensitiveFeedbackFields,
} from "../src/utils/feedback-privacy.js";

describe("public feedback visibility", () => {
  it("removes internal ids and secret tokens from tracked ticket responses", () => {
    const sanitized = stripSensitiveFeedbackFields({
      id: 42,
      secretToken: "hashed-token-value",
      ticketId: "MLSA-000042",
      title: "Sample",
      description: "Details",
    });

    assert.equal(sanitized.ticketId, "MLSA-000042");
    assert.equal("id" in sanitized, false);
    assert.equal("secretToken" in sanitized, false);
  });

  it("shows admin replies and private user messages on ticket threads", () => {
    assert.equal(isVisibleOnTicketThread({ sender: "admin", isPublicComment: false }), true);
    assert.equal(isVisibleOnTicketThread({ sender: "user", isPublicComment: false }), true);
    assert.equal(isVisibleOnTicketThread({ sender: "user", isPublicComment: true }), false);
  });
});
