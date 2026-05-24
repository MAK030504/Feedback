import { useEffect, useState } from "react";

const STORAGE_KEY = "mlsa_theme";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => window.localStorage.getItem(STORAGE_KEY) ?? "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
};
