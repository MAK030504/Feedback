import { clsx } from "clsx";

export const ModerationBadge = ({ aiFlags }) => {
  if (!aiFlags?.needsManualReview) {
    return null;
  }

  return (
    <span
      className={clsx(
        "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900",
        "dark:bg-amber-900/50 dark:text-amber-200",
      )}
      title="Flagged by moderation rules for manual review"
    >
      Needs review
    </span>
  );
};

export const ModerationPanel = ({ aiFlags }) => {
  if (!aiFlags) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/20">
      <p className="font-medium text-amber-900 dark:text-amber-200">Moderation flags</p>
      <ul className="mt-2 space-y-1 text-amber-800 dark:text-amber-100">
        <li>Sentiment: {aiFlags.sentiment ?? "unknown"}</li>
        <li>Spam score: {aiFlags.spamScore ?? 0}</li>
        <li>Toxicity score: {aiFlags.toxicityScore ?? 0}</li>
        {aiFlags.needsManualReview ? <li>Manual review recommended</li> : null}
      </ul>
    </div>
  );
};
