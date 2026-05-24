import { clsx } from "clsx";
import { formatEnum } from "../utils/constants";

const styleMap = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  under_review: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

export const StatusBadge = ({ value }) => {
  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", styleMap[value])}>
      {formatEnum(value)}
    </span>
  );
};
