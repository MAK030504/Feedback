import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDiscordMentionPayload,
  isAdminNotifyConfigured,
  notifyAdminsOfNewSubmission,
} from "../src/services/admin-notify.service.js";
import { env } from "../src/config/env.js";

describe("admin notifications", () => {
  it("skips when no channels are configured", async () => {
    const result = await notifyAdminsOfNewSubmission({
      id: 1,
      ticketId: "MLSA-000001",
      type: "complaint",
      category: "communication",
      title: "Test complaint",
    });

    assert.deepEqual(result, { discord: "skipped", email: "skipped" });
    assert.equal(isAdminNotifyConfigured(), false);
  });

  it("builds Discord user and role mentions from env", () => {
    const previousUsers = env.DISCORD_MENTION_USER_IDS;
    const previousRoles = env.DISCORD_MENTION_ROLE_IDS;

    env.DISCORD_MENTION_USER_IDS = "123456789012345678,not-an-id";
    env.DISCORD_MENTION_ROLE_IDS = "987654321098765432";

    const payload = buildDiscordMentionPayload();
    assert.equal(payload.content, "<@123456789012345678> <@&987654321098765432>");
    assert.deepEqual(payload.allowed_mentions.users, ["123456789012345678"]);
    assert.deepEqual(payload.allowed_mentions.roles, ["987654321098765432"]);

    env.DISCORD_MENTION_USER_IDS = previousUsers;
    env.DISCORD_MENTION_ROLE_IDS = previousRoles;
  });

  it("returns null when no Discord mention IDs are configured", () => {
    const previousUsers = env.DISCORD_MENTION_USER_IDS;
    const previousRoles = env.DISCORD_MENTION_ROLE_IDS;

    env.DISCORD_MENTION_USER_IDS = "";
    env.DISCORD_MENTION_ROLE_IDS = "";

    assert.equal(buildDiscordMentionPayload(), null);

    env.DISCORD_MENTION_USER_IDS = previousUsers;
    env.DISCORD_MENTION_ROLE_IDS = previousRoles;
  });

  it("ignores non-complaint/suggestion types", async () => {
    const result = await notifyAdminsOfNewSubmission({
      id: 2,
      ticketId: "MLSA-000002",
      type: "feedback",
      category: "event_management",
      title: "Workshop was great",
    });

    assert.deepEqual(result, { discord: "skipped", email: "skipped" });
  });
});
