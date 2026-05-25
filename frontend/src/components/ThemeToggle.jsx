export const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
};
