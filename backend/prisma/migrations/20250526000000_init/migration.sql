-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('complaint', 'suggestion', 'feedback');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('event_management', 'team_coordination', 'leadership_issue', 'technical_workshop', 'communication', 'other');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('pending', 'under_review', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "ticketId" TEXT NOT NULL,
    "secretToken" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'pending',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'medium',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "anonymousAlias" TEXT NOT NULL,
    "hashedIp" TEXT,
    "internalNotes" TEXT,
    "aiFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "feedbackId" INTEGER NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "message" TEXT NOT NULL,
    "isPublicComment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "feedbackId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuggestionVote" (
    "id" SERIAL NOT NULL,
    "feedbackId" INTEGER NOT NULL,
    "voteHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_ticketId_key" ON "Feedback"("ticketId");

-- CreateIndex
CREATE INDEX "Feedback_status_category_type_idx" ON "Feedback"("status", "category", "type");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Message_feedbackId_createdAt_idx" ON "Message"("feedbackId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SuggestionVote_feedbackId_voteHash_key" ON "SuggestionVote"("feedbackId", "voteHash");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionVote" ADD CONSTRAINT "SuggestionVote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
