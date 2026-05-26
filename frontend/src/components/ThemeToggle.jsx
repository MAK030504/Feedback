export const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-yellow-300 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/30"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
};
