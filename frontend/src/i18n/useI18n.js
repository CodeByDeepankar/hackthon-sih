"use client";
import { useEffect, useMemo, useState } from "react";
import { translations } from "@/i18n/translations";

export function useI18n() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "or" || saved === "hi") setLang(saved);
    } catch {}
    const handler = (e) => {
      const next = e?.detail;
      if (next === "en" || next === "or" || next === "hi") setLang(next);
    };
    window.addEventListener("language:change", handler);
    return () => window.removeEventListener("language:change", handler);
  }, []);

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    const interpolate = (str, vars) =>
      typeof str === "string" && vars
        ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""))
        : str;

    const makeProxy = (obj) =>
      new Proxy(obj, {
        get(target, prop) {
          const value = target[prop];
          if (value === undefined) {
            // Missing key: return a function that echos the prop name for visibility
            return (vars) => interpolate(String(prop), vars);
          }
          if (value !== null && typeof value === "object") {
            return makeProxy(value);
          }
          if (typeof value === "function") {
            return value;
          }
          return (vars) => interpolate(String(value), vars);
        },
      });

    return makeProxy(dict);
  }, [lang]);

  return { lang, t };
}
