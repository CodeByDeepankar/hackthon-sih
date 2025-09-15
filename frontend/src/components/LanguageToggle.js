"use client";
import { useEffect, useState } from "react";
import { FaGlobeAsia } from "react-icons/fa";

export default function LanguageToggle({ setLanguage, allowed = ["en", "or", "hi"] }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved) setLang(saved);
    } catch {}
  }, []);

  const cycle = () => {
    const idx = Math.max(0, allowed.indexOf(lang));
    const next = allowed[(idx + 1) % allowed.length] || "en";
    setLang(next);
    try {
      localStorage.setItem("lang", next);
      window.dispatchEvent(new CustomEvent("language:change", { detail: next }));
    } catch {}
    if (typeof setLanguage === "function") setLanguage(next);
  };

  return (
    <button
      onClick={cycle}
      title={lang === "en" ? "Switch to Odia" : lang === "or" ? "Switch to Hindi" : "Switch to English"}
      className="px-3 py-1 border rounded inline-flex items-center gap-2"
    >
      <FaGlobeAsia />
      <span className="text-sm">{lang === "en" ? "EN" : lang === "or" ? "OR" : "HI"}</span>
    </button>
  );
}
