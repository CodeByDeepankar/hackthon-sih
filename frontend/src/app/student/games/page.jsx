"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/student/components/ui/card";
import { Button } from "@/student/components/ui/button";
import { useI18n } from "@/i18n/useI18n";
import { Gamepad2, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function GamesHome() {
  const { t } = useI18n();
  const games = [
    { id: "math-blitz", title: t.games.titles.mathBlitz(), href: "/student/games/math-blitz", emoji: "🔢" },
    { id: "science-quest", title: t.games.titles.scienceQuest(), href: "/student/games/science-quest", emoji: "🔬" },
    { id: "stem-quiz", title: t.games.titles.stemQuiz ? t.games.titles.stemQuiz() : t.games.titles.scienceQuest(), href: "/student/games/stem-quiz", emoji: "🧪" },
  ];
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-semibold mb-4 light:text-black flex items-center gap-2"><Gamepad2 className="w-5 h-5" /> {t.nav.games()}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {games.map((g, idx) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className={g.disabled ? "opacity-60" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><span className="text-lg">{g.emoji}</span>{g.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {g.disabled ? (
                      <Button disabled size="sm" className="gap-2 light:text-black"><Play className="w-4 h-4" /> {t.common.play()}</Button>
                    ) : (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex">
                        <Button asChild size="sm" className="gap-2 light:text-black">
                          <Link href={g.href} className="inline-flex items-center">
                            <Play className="w-4 h-4" /> {t.common.play()}
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
