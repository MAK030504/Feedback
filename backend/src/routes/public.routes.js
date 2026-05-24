import { Router } from "express";
import {
  addSuggestionComment,
  addTicketMessage,
  getPublicSuggestions,
  submitFeedback,
  trackTicket,
  upvotePublicSuggestion,
} from "../controllers/public.controller.js";
import { validate } from "../middleware/validate.js";
import { submissionRateLimit } from "../middleware/rate-limit.js";
import { uploadAttachment } from "../middleware/upload.js";
import {
  addMessageSchema,
  createFeedbackSchema,
  suggestionCommentSchema,
} from "../utils/validators.js";

const router = Router();

router.post(
  "/feedback",
  submissionRateLimit,
  uploadAttachment.single("attachment"),
  validate(createFeedbackSchema),
  submitFeedback,
);

router.get("/track/:ticketId", trackTicket);
router.post("/track/:ticketId/messages", validate(addMessageSchema), addTicketMessage);

router.get("/suggestions", getPublicSuggestions);
router.post("/suggestions/:id/upvote", submissionRateLimit, upvotePublicSuggestion);
router.post(
  "/suggestions/:id/comments",
  submissionRateLimit,
  validate(suggestionCommentSchema),
  addSuggestionComment,
);

export default router;
