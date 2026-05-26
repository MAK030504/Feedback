import { clsx } from "clsx";
import { formatEnum } from "../utils/constants";

const styleMap = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
  under_review: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  low: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  urgent: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100",
};

export const StatusBadge = ({ value }) => {
  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", styleMap[value])}>
      {formatEnum(value)}
    </span>
  );
};
