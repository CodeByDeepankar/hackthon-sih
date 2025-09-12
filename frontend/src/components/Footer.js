"use client";
import { useTheme } from "@/components/ThemeProvider";

export default function Footer() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const style = isLight
    ? { backgroundColor: "#ebffeb", color: "#000000" }
    : { backgroundColor: "#000000", color: "#f8fafc" };
  return (
    <footer className="text-center p-4 mt-8 w-full" style={style}>
      © 2025 Gamified STEM Learning. All rights reserved.
    </footer>
  );
}
