"use client";

export default function LanguageToggle({ setLanguage }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage("en")}
        className="px-3 py-1 border rounded"
      >
        English
      </button>
      <button
        onClick={() => setLanguage("or")}
        className="px-3 py-1 border rounded"
      >
        ଓଡିଆ
      </button>
      <button
        onClick={() => setLanguage("hi")}
        className="px-3 py-1 border rounded"
      >
        हिन्दी
      </button>
    </div>
  );
}
