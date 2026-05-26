import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAdminNotifyConfigured,
  notifyAdminsOfNewSubmission,
} from "../src/services/admin-notify.service.js";

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
