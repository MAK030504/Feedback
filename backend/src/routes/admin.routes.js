import { Router } from "express";
import {
  exportCsv,
  getAdminFeedbackDetail,
  getAdminFeedbackList,
  getAnalytics,
  patchAdminFeedback,
  postAdminReply,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { adminFeedbackUpdateSchema, adminReplySchema } from "../utils/validators.js";

const router = Router();

router.use(authenticateAdmin);

router.get("/feedback", getAdminFeedbackList);
router.get("/feedback/:id", getAdminFeedbackDetail);
router.patch("/feedback/:id", validate(adminFeedbackUpdateSchema), patchAdminFeedback);
router.post("/feedback/:id/messages", validate(adminReplySchema), postAdminReply);
router.get("/analytics", getAnalytics);
router.get("/export/csv", exportCsv);

export default router;
