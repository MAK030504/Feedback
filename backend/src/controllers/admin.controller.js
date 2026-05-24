import { z } from "zod";
import {
  addAdminMessage,
  analyticsSummary,
  exportFeedbackRows,
  getAdminFeedbackById,
  listAdminFeedback,
  updateAdminFeedback,
} from "../services/feedback.service.js";
import { toCsv } from "../utils/csv.js";
import { emitAdminUpdate } from "../services/socket.service.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(10),
  status: z.enum(["pending", "under_review", "resolved", "rejected"]).optional(),
  type: z.enum(["complaint", "suggestion", "feedback"]).optional(),
  category: z
    .enum([
      "event_management",
      "team_coordination",
      "leadership_issue",
      "technical_workshop",
      "communication",
      "other",
    ])
    .optional(),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const getAdminFeedbackList = async (request, response, next) => {
  try {
    const query = listQuerySchema.parse(request.query);

    const data = await listAdminFeedback({
      page: query.page,
      pageSize: query.pageSize,
      filters: {
        status: query.status,
        type: query.type,
        category: query.category,
        search: query.search,
      },
    });

    response.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getAdminFeedbackDetail = async (request, response, next) => {
  try {
    const { id } = idParamSchema.parse(request.params);
    const feedback = await getAdminFeedbackById(id);

    if (!feedback) {
      return response.status(404).json({ message: "Feedback not found" });
    }

    return response.json({ data: feedback });
  } catch (error) {
    return next(error);
  }
};

export const patchAdminFeedback = async (request, response, next) => {
  try {
    const { id } = idParamSchema.parse(request.params);
    const updated = await updateAdminFeedback({ id, payload: request.body });

    emitAdminUpdate("feedback:updated", {
      feedbackId: id,
      status: updated.status,
      priority: updated.priority,
    });

    return response.json({ data: updated });
  } catch (error) {
    return next(error);
  }
};

export const postAdminReply = async (request, response, next) => {
  try {
    const { id } = idParamSchema.parse(request.params);
    const message = await addAdminMessage({ id, message: request.body.message });

    emitAdminUpdate("feedback:message", {
      feedbackId: id,
      sender: "admin",
    });

    return response.status(201).json({ data: message });
  } catch (error) {
    return next(error);
  }
};

export const getAnalytics = async (_request, response, next) => {
  try {
    const data = await analyticsSummary();
    response.json({ data });
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (_request, response, next) => {
  try {
    const rows = await exportFeedbackRows();
    const csv = toCsv(rows, [
      { key: "ticketId", label: "Ticket ID" },
      { key: "type", label: "Type" },
      { key: "category", label: "Category" },
      { key: "title", label: "Title" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "isPublic", label: "Public Suggestion" },
      { key: "anonymousAlias", label: "Anonymous Alias" },
      { key: "createdAt", label: "Created At" },
      { key: "updatedAt", label: "Updated At" },
    ]);

    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", "attachment; filename=mlsa-feedback-report.csv");
    response.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
