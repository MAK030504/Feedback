import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const formatLabel = (value) =>
  value
    ?.split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") ?? "-";

const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) {
    return text ?? "";
  }

  return `${text.slice(0, maxLength - 1)}…`;
};

const buildSubmissionSummary = (submission) => {
  const typeLabel = formatLabel(submission.type);
  const categoryLabel = formatLabel(submission.category);
  const title = submission.title?.trim() || "Untitled submission";

  return {
    typeLabel,
    categoryLabel,
    title,
    subject: `[MLSA] New ${typeLabel}: ${truncate(title, 80)}`,
    headline: `New ${typeLabel}`,
  };
};

const discordColor = (type) => {
  if (type === "complaint") {
    return 0xef4444;
  }

  if (type === "suggestion") {
    return 0x38bdf8;
  }

  return 0x64748b;
};

const isDiscordConfigured = () => Boolean(env.DISCORD_WEBHOOK_URL?.trim());

const parseDiscordIdList = (raw) =>
  (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((id) => /^\d{17,20}$/.test(id));

/** @returns {{ content: string, allowed_mentions: object } | null} */
export const buildDiscordMentionPayload = () => {
  const userIds = parseDiscordIdList(env.DISCORD_MENTION_USER_IDS);
  const roleIds = parseDiscordIdList(env.DISCORD_MENTION_ROLE_IDS);

  if (userIds.length === 0 && roleIds.length === 0) {
    return null;
  }

  const mentionText = [
    ...userIds.map((id) => `<@${id}>`),
    ...roleIds.map((id) => `<@&${id}>`),
  ].join(" ");

  const allowedMentions = { parse: [] };
  if (userIds.length > 0) {
    allowedMentions.users = userIds;
  }
  if (roleIds.length > 0) {
    allowedMentions.roles = roleIds;
  }

  return {
    content: mentionText,
    allowed_mentions: allowedMentions,
  };
};

const isEmailConfigured = () =>
  Boolean(env.ADMIN_NOTIFY_EMAIL?.trim() && env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASS?.trim());

export const isAdminNotifyConfigured = () => isDiscordConfigured() || isEmailConfigured();

let mailTransporter = null;

const getMailTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return mailTransporter;
};

const sendDiscordNotification = async (submission) => {
  const { typeLabel, categoryLabel, title, headline } = buildSubmissionSummary(submission);
  const dashboardLink = env.ADMIN_DASHBOARD_URL?.trim();

  const embed = {
    title: `${headline}: ${truncate(title, 200)}`,
    color: discordColor(submission.type),
    fields: [
      { name: "Ticket", value: submission.ticketId, inline: true },
      { name: "Type", value: typeLabel, inline: true },
      { name: "Category", value: categoryLabel, inline: true },
    ],
    footer: { text: "MLSA Anonymous Feedback" },
    timestamp: new Date().toISOString(),
  };

  if (dashboardLink) {
    embed.description = `[Open admin dashboard](${dashboardLink})`;
  }

  const mentions = buildDiscordMentionPayload();
  const payload = {
    username: "MLSA Feedback",
    embeds: [embed],
  };

  if (mentions) {
    payload.content = `${mentions.content}\n**${headline}** — new submission needs review.`;
    payload.allowed_mentions = mentions.allowed_mentions;
  }

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord webhook failed (${response.status}): ${body}`);
  }
};

const sendEmailNotification = async (submission) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    return;
  }

  const { typeLabel, categoryLabel, title, subject, headline } = buildSubmissionSummary(submission);
  const recipients = env.ADMIN_NOTIFY_EMAIL.split(",").map((email) => email.trim()).filter(Boolean);
  const dashboardLink = env.ADMIN_DASHBOARD_URL?.trim();

  const textLines = [
    headline,
    "",
    `Ticket: ${submission.ticketId}`,
    `Type: ${typeLabel}`,
    `Category: ${categoryLabel}`,
    `Title: ${title}`,
  ];

  if (dashboardLink) {
    textLines.push("", `Admin dashboard: ${dashboardLink}`);
  }

  const htmlLines = [
    `<p><strong>${headline}</strong></p>`,
    "<ul>",
    `<li><strong>Ticket:</strong> ${submission.ticketId}</li>`,
    `<li><strong>Type:</strong> ${typeLabel}</li>`,
    `<li><strong>Category:</strong> ${categoryLabel}</li>`,
    `<li><strong>Title:</strong> ${title}</li>`,
    "</ul>",
  ];

  if (dashboardLink) {
    htmlLines.push(`<p><a href="${dashboardLink}">Open admin dashboard</a></p>`);
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: recipients,
    subject,
    text: textLines.join("\n"),
    html: htmlLines.join(""),
  });
};

export const notifyAdminsOfNewSubmission = async (submission) => {
  if (!submission || (submission.type !== "complaint" && submission.type !== "suggestion")) {
    return { discord: "skipped", email: "skipped" };
  }

  const results = { discord: "skipped", email: "skipped" };
  const failures = [];

  if (isDiscordConfigured()) {
    try {
      await sendDiscordNotification(submission);
      results.discord = "sent";
    } catch (error) {
      results.discord = "failed";
      failures.push({ channel: "discord", error });
    }
  }

  if (isEmailConfigured()) {
    try {
      await sendEmailNotification(submission);
      results.email = "sent";
    } catch (error) {
      results.email = "failed";
      failures.push({ channel: "email", error });
    }
  }

  if (failures.length > 0) {
    const summary = failures.map(({ channel, error }) => `${channel}: ${error.message}`).join("; ");
    throw new Error(summary);
  }

  return results;
};
