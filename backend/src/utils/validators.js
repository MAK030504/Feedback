import { z } from "zod";

export const feedbackTypeEnum = z.enum(["complaint", "suggestion", "feedback"]);
export const feedbackCategoryEnum = z.enum([
  "event_management",
  "team_coordination",
  "leadership_issue",
  "technical_workshop",
  "communication",
  "other",
]);
export const feedbackStatusEnum = z.enum(["pending", "under_review", "resolved", "rejected"]);
export const feedbackPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const createFeedbackSchema = z.object({
  type: feedbackTypeEnum,
  category: feedbackCategoryEnum,
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  isPublic: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return false;
      }

      if (typeof value === "boolean") {
        return value;
      }

      return value.toLowerCase() === "true";
    }),
});

export const trackTicketSchema = z.object({
  token: z.string().min(8),
});

export const addMessageSchema = z.object({
  token: z.string().min(8),
  message: z.string().min(2).max(4000),
});

export const adminLoginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});

export const adminFeedbackUpdateSchema = z.object({
  status: feedbackStatusEnum.optional(),
  priority: feedbackPriorityEnum.optional(),
  isPublic: z.boolean().optional(),
  internalNotes: z.string().max(6000).optional(),
});

export const adminReplySchema = z.object({
  message: z.string().min(2).max(4000),
});

export const suggestionCommentSchema = z.object({
  message: z.string().min(2).max(1000),
});
