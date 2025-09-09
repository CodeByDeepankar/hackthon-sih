"use client";
import { useEffect, useState } from "react";

export default function OnlineBadge() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
        online ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
      }`}
      title={online ? "Online" : "Offline"}
    >
      <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500" : "bg-yellow-500"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}
