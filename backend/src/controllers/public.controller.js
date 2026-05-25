import { z } from "zod";
import {
  addPublicSuggestionComment,
  addUserMessage,
  createFeedbackSubmission,
  getFeedbackForTicket,
  listPublicSuggestions,
  upvoteSuggestion,
} from "../services/feedback.service.js";
import { emitAdminUpdate } from "../services/socket.service.js";
import { trackTicketSchema } from "../utils/validators.js";

const upvoteParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const submitFeedback = async (request, response, next) => {
  try {
    const data = await createFeedbackSubmission({
      payload: request.body,
      file: request.file,
      request,
    });

    emitAdminUpdate("feedback:new", {
      ticketId: data.ticketId,
      type: request.body.type,
      category: request.body.category,
    });

    response.status(201).json({
      message: "Feedback submitted anonymously.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const trackTicket = async (request, response, next) => {
  try {
    const { token } = trackTicketSchema.parse({ token: request.query.token });

    const result = await getFeedbackForTicket({
      ticketId: request.params.ticketId.toUpperCase(),
      secretToken: token,
    });

    if (result === null) {
      return response.status(404).json({ message: "Ticket not found" });
    }

    if (result === false) {
      return response.status(401).json({ message: "Invalid ticket token" });
    }

    return response.json({ data: result });
  } catch (error) {
    return next(error);
  }
};

export const addTicketMessage = async (request, response, next) => {
  try {
    const result = await addUserMessage({
      ticketId: request.params.ticketId.toUpperCase(),
      secretToken: request.body.token,
      message: request.body.message,
    });

    if (result === null) {
      return response.status(404).json({ message: "Ticket not found" });
    }

    if (result === false) {
      return response.status(401).json({ message: "Invalid ticket token" });
    }

    emitAdminUpdate("feedback:message", {
      ticketId: request.params.ticketId.toUpperCase(),
      sender: "user",
    });

    return response.status(201).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

export const getPublicSuggestions = async (_request, response, next) => {
  try {
    const suggestions = await listPublicSuggestions();
    response.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
};

export const upvotePublicSuggestion = async (request, response, next) => {
  try {
    const { id } = upvoteParamsSchema.parse(request.params);
    const result = await upvoteSuggestion({ feedbackId: id, request });

    if (result === null) {
      return response.status(404).json({ message: "Suggestion not found" });
    }

    if (result === false) {
      return response.status(409).json({ message: "Already upvoted from this source" });
    }

    return response.json({ votes: result });
  } catch (error) {
    return next(error);
  }
};

export const addSuggestionComment = async (request, response, next) => {
  try {
    const { id } = upvoteParamsSchema.parse(request.params);
    const comment = await addPublicSuggestionComment({
      feedbackId: id,
      message: request.body.message,
    });

    if (!comment) {
      return response.status(404).json({ message: "Suggestion not found" });
    }

    return response.status(201).json({ data: comment });
  } catch (error) {
    return next(error);
  }
};
