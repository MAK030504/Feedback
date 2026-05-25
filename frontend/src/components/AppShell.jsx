import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const navItemClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export const AppShell = ({ children, theme, onToggleTheme }) => {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">MLSA GIKI Internal</p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Anonymous Feedback System
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navItemClass}>
              Home
            </NavLink>
            <NavLink to="/submit" className={navItemClass}>
              Submit
            </NavLink>
            <NavLink to="/track" className={navItemClass}>
              Track Ticket
            </NavLink>
            <NavLink to="/suggestions" className={navItemClass}>
              Suggestions
            </NavLink>
            <NavLink to="/admin/login" className={navItemClass}>
              Admin
            </NavLink>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
};
