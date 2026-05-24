import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { moderateSubmission } from "./moderation.service.js";
import { uploadAttachment } from "./attachment.service.js";
import { buildAnonymousAlias, buildTicketId } from "../utils/ticket.js";
import { compareSecretToken, generateSecretToken, hashIp } from "../utils/security.js";

const feedbackPublicSelect = {
  ticketId: true,
  type: true,
  category: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  anonymousAlias: true,
  createdAt: true,
  updatedAt: true,
  attachments: {
    select: {
      url: true,
      fileType: true,
    },
  },
  messages: {
    where: {
      OR: [{ sender: "admin" }, { sender: "user", isPublicComment: false }],
    },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
};

const adminFeedbackSelect = {
  id: true,
  ticketId: true,
  type: true,
  category: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  isPublic: true,
  anonymousAlias: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      messages: true,
      suggestionVotes: true,
    },
  },
};

const toAdminFilter = ({ status, type, category, search }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { ticketId: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const createFeedbackSubmission = async ({ payload, file, request }) => {
  const { plainToken, hashedToken } = await generateSecretToken();
  const moderation = await moderateSubmission(payload);
  const hashedIp = hashIp(request);

  const createdFeedback = await prisma.$transaction(async (tx) => {
    const initialRecord = await tx.feedback.create({
      data: {
        ticketId: `TEMP-${crypto.randomUUID()}`,
        secretToken: hashedToken,
        type: payload.type,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        isPublic: payload.type === "suggestion" ? (payload.isPublic ?? false) : false,
        anonymousAlias: "Anonymous Member",
        hashedIp,
        aiFlags: moderation,
      },
    });

    const ticketId = buildTicketId(initialRecord.id);
    const anonymousAlias = buildAnonymousAlias(initialRecord.id);

    const feedback = await tx.feedback.update({
      where: { id: initialRecord.id },
      data: { ticketId, anonymousAlias },
    });

    if (file) {
      const attachmentUrl = await uploadAttachment(file.buffer, file.mimetype);
      await tx.attachment.create({
        data: {
          feedbackId: feedback.id,
          url: attachmentUrl,
          fileType: file.mimetype,
        },
      });
    }

    return feedback;
  });

  return {
    ticketId: createdFeedback.ticketId,
    secretToken: plainToken,
    anonymousAlias: createdFeedback.anonymousAlias,
  };
};

export const getFeedbackForTicket = async ({ ticketId, secretToken }) => {
  const feedback = await prisma.feedback.findUnique({
    where: { ticketId },
    select: {
      id: true,
      secretToken: true,
      ...feedbackPublicSelect,
    },
  });

  if (!feedback) {
    return null;
  }

  const isValid = await compareSecretToken(secretToken, feedback.secretToken);

  if (!isValid) {
    return false;
  }

  const { id: _id, secretToken: _secretToken, ...publicFeedback } = feedback;
  return publicFeedback;
};

export const addUserMessage = async ({ ticketId, secretToken, message }) => {
  const feedback = await prisma.feedback.findUnique({
    where: { ticketId },
    select: {
      id: true,
      secretToken: true,
    },
  });

  if (!feedback) {
    return null;
  }

  const isValid = await compareSecretToken(secretToken, feedback.secretToken);

  if (!isValid) {
    return false;
  }

  const createdMessage = await prisma.message.create({
    data: {
      feedbackId: feedback.id,
      sender: "user",
      message,
    },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
  });

  return createdMessage;
};

export const listPublicSuggestions = async () => {
  const suggestions = await prisma.feedback.findMany({
    where: {
      type: "suggestion",
      isPublic: true,
    },
    select: {
      id: true,
      ticketId: true,
      title: true,
      description: true,
      anonymousAlias: true,
      createdAt: true,
      _count: {
        select: {
          suggestionVotes: true,
        },
      },
      messages: {
        where: {
          isPublicComment: true,
        },
        select: {
          id: true,
          sender: true,
          message: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
    orderBy: [{ suggestionVotes: { _count: "desc" } }, { createdAt: "desc" }],
  });

  return suggestions.map((item) => ({
    ...item,
    votes: item._count.suggestionVotes,
  }));
};

export const upvoteSuggestion = async ({ feedbackId, request }) => {
  const voteHash = hashIp(request);

  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      type: "suggestion",
      isPublic: true,
    },
    select: { id: true },
  });

  if (!feedback) {
    return null;
  }

  try {
    await prisma.suggestionVote.create({
      data: {
        feedbackId,
        voteHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }

    throw error;
  }

  return prisma.suggestionVote.count({ where: { feedbackId } });
};

export const addPublicSuggestionComment = async ({ feedbackId, message }) => {
  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      type: "suggestion",
      isPublic: true,
    },
    select: { id: true },
  });

  if (!feedback) {
    return null;
  }

  return prisma.message.create({
    data: {
      feedbackId,
      sender: "user",
      message,
      isPublicComment: true,
    },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
  });
};

export const listAdminFeedback = async ({ page, pageSize, filters }) => {
  const where = toAdminFilter(filters);

  const [items, total] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,
      select: adminFeedbackSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getAdminFeedbackById = async (id) => {
  return prisma.feedback.findUnique({
    where: { id },
    select: {
      ...adminFeedbackSelect,
      attachments: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
      suggestionVotes: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateAdminFeedback = async ({ id, payload }) => {
  return prisma.feedback.update({
    where: { id },
    data: {
      status: payload.status,
      priority: payload.priority,
      isPublic: payload.isPublic,
      internalNotes: payload.internalNotes,
    },
    select: adminFeedbackSelect,
  });
};

export const addAdminMessage = async ({ id, message }) => {
  return prisma.message.create({
    data: {
      feedbackId: id,
      sender: "admin",
      message,
    },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
  });
};

export const analyticsSummary = async () => {
  const [statusCounts, categoryCounts, monthlyCounts] = await Promise.all([
    prisma.feedback.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),
    prisma.feedback.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    }),
    prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
             COUNT(*)::int AS count
      FROM "Feedback"
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `,
  ]);

  return { statusCounts, categoryCounts, monthlyCounts };
};

export const exportFeedbackRows = async () => {
  return prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      ticketId: true,
      type: true,
      category: true,
      title: true,
      status: true,
      priority: true,
      isPublic: true,
      anonymousAlias: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
