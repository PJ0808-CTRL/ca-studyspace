"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ca-campus-theme", next); } catch { /* Storage can be unavailable. */ }
    setTheme(next);
  }

  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
  </button>;
}
