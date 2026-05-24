// AI moderation scaffold. Replace internals with real ML service calls.
export const moderateSubmission = async ({ title, description }) => {
  const content = `${title} ${description}`.trim();
  const lower = content.toLowerCase();

  return {
    toxicityScore: 0,
    spamScore: 0,
    sentiment: "neutral",
    duplicateGroupKey: null,
    needsManualReview: lower.includes("urgent") || lower.includes("harass"),
  };
};
