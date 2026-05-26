const accentStyles = {
  blue: "border-l-sky-400 bg-sky-50/80 dark:bg-sky-950/30",
  yellow: "border-l-yellow-400 bg-yellow-50/80 dark:bg-yellow-950/20",
  green: "border-l-green-400 bg-green-50/80 dark:bg-green-950/20",
  red: "border-l-red-400 bg-red-50/80 dark:bg-red-950/20",
};

export const StatCard = ({ label, value, accent }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        accent ? `border-l-4 ${accentStyles[accent]}` : ""
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
};
