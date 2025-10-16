"use client";
import Link from "next/link";
import { useEffect } from "react";
import ScienceQuestGame from "@/components/phaser/ScienceQuestGame";

export default function ScienceQuestStudent() {
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/student/games" className="text-sm text-blue-500 hover:underline">← Back to Games</Link>
        </div>
        <div className="rounded-lg overflow-hidden border bg-white dark:bg-neutral-900 shadow p-2">
          <ScienceQuestGame />
        </div>
      </div>
    </div>
  );
}
