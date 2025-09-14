"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {}, toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Initialize from localStorage or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        return;
      }
    } catch {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Apply class to html element and persist
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Toggle dark class
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");

  // Maintain a 'light' class for explicit light-mode overrides
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");

    // Apply requested light theme overrides
    const setVar = (name, value) => root.style.setProperty(name, value);
    const delVar = (name) => root.style.removeProperty(name);

    if (theme === "light") {
      // Page background and global text color (neutral light theme)
      body.style.backgroundColor = "#ffffff"; // white page bg
      body.style.color = "#000000"; // make content text black

      // Token-based variables used across the UI system
      setVar("--background", "#ffffff");
      setVar("--foreground", "#000000");
      // Keep existing light component tokens for now unless overridden locally
      setVar("--card", "#d4ffd4");
      setVar("--card-foreground", "#000000");
      setVar("--popover", "#d4ffd4");
      setVar("--popover-foreground", "#000000");
      setVar("--secondary", "#d4ffd4");
      setVar("--secondary-foreground", "#000000");
      setVar("--muted", "#d4ffd4");
      setVar("--muted-foreground", "#000000");
      setVar("--accent", "#d4ffd4");
      setVar("--accent-foreground", "#000000");
      setVar("--input-background", "#d4ffd4");
      setVar("--switch-background", "#d4ffd4");
      setVar("--border", "#e5e7eb"); // neutral gray border (Tailwind slate-200)
    } else {
      // Clean up inline overrides for dark or other themes
      body.style.removeProperty("background-color");
      body.style.removeProperty("color");
      [
        "--background",
        "--foreground",
        "--card",
        "--card-foreground",
        "--popover",
        "--popover-foreground",
        "--secondary",
        "--secondary-foreground",
        "--muted",
        "--muted-foreground",
        "--accent",
        "--accent-foreground",
        "--input-background",
        "--switch-background",
        "--border",
      ].forEach(delVar);
    }

    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
