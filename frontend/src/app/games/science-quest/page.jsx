"use client";
import { useEffect } from "react";
import ScienceQuestGame from "@/components/phaser/ScienceQuestGame";

export const metadata = {
  title: "🔬 Science Quest",
  description: "Play Science Quest (Phaser)",
};

export default function ScienceQuestPublic() {
  useEffect(() => {
    const assets = [
      "/student/game-assets/bg/chemestry-lab.png",
      "/student/game-assets/objects/star.png",
      "/student/game-assets/characters/student.png",
      "/student/game-assets/sounds/Background%20Music.mp3",
      "/student/game-assets/sounds/correct-answer.mp3",
    ];
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "warm-cache", urls: assets });
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">🔬 Science Quest</h1>
        <div className="rounded-lg overflow-hidden border bg-white dark:bg-neutral-900 shadow p-2">
          <ScienceQuestGame />
        </div>
      </div>
    </div>
  );
}
