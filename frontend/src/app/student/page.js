"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import DashboardV2 from "@/student/pages/DashboardV2";

<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import LanguageToggle from "@/components/LanguageToggle";
import OfflineNotice from "@/components/OfflineNotice";
import { useRouter } from "next/navigation";
import OnlineBadge from "@/components/OnlineBadge";
import FooterNav from "@/components/FooterNav";
import { useStreak } from "@/hooks/useStreak";
import StreakWidget, { StreakStats } from "@/components/StreakWidget";

const t = {
  en: {
    title: "STEM Learn",
    mySubjects: "My Subjects",
    continue: "Continue Game / Quiz",
    achievements: "Achievements",
    progress: "My Progress",
    install: "Install App",
  },
  or: {
    title: "ଷ୍ଟେମ୍ ଲର୍ଣ୍ଣ",
    mySubjects: "ମୋ ବିଷୟ",
    continue: "ଖେଳ/କ୍ୱିଜ୍ ଚାଲୁରଖନ୍ତୁ",
    achievements: "ସଫଳତା",
    progress: "ମୋ ପ୍ରଗତି",
    install: "ଆପ୍ ସ୍ଥାପନ କରନ୍ତୁ",
  },
  hi: {
    title: "STEM सीखें",
    mySubjects: "मेरे विषय",
    continue: "गेम/क्विज़ जारी रखें",
    achievements: "उपलब्धियां",
    progress: "मेरी प्रगति",
    install: "ऐप स्थापित करें",
  },
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [language, setLanguage] = useState("en");
  const dict = useMemo(() => t[language] ?? t.en, [language]);
  const [installEvent, setInstallEvent] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Use the streak hook for real-time streak data
  const {
    streakData,
    recordQuizCompletion,
    simulateQuizCompletion,
    refreshData,
    isStreakActive,
    needsDailyQuiz,
    streakMessage
  } = useStreak(user?.id);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
  const onOff = () => setIsOffline(!navigator.onLine);
  window.addEventListener("online", onOff);
  window.addEventListener("offline", onOff);
  onOff();
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    setInstallEvent(null);
  }

  // Mock data placeholders; could be loaded from PouchDB/Backend
  const subjects = [
    { key: "math", name: "Math", progress: 35 },
    { key: "science", name: "Science", progress: 60 },
  ];
  const lastSession = { title: "Fractions Quiz", subject: "Math", percent: 40 };
  const badges = [
    { key: "math-star", name: "Math Star" },
    { key: "lvl1", name: "Level 1 Completed" },
  ];
  const weekly = { thisWeek: 68, lastWeek: 52, timeThisWeekMin: 95 };
  const level = 2;
  const spark = [20, 35, 40, 55, 38, 60, 68];

  // Handler for simulating quiz completion (for testing)
  const handleTestQuizCompletion = async () => {
    try {
      const result = await simulateQuizCompletion();
      alert(`Quiz completed! Your streak is now ${result.currentStreak} days.`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <SignedIn>
        <OfflineNotice />
  {/* Header is handled globally for student routes; no local top bar here */}

        {/* Greeting header strip */}
        <div className="max-w-5xl mx-auto px-4 mt-3">
          <div className="rounded-2xl p-4 text-white bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-lg font-semibold">Welcome back!</div>
              <div className="opacity-90 text-sm">
                {streakData.loading ? "Loading..." : streakMessage}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>🔥</span>
              <span className="font-semibold">
                {streakData.loading ? "..." : `${streakData.currentStreak} day streak`}
              </span>
            </div>
          </div>
          
          {/* Daily Challenge Status */}
          {!streakData.loading && (
            <div className="mt-3 p-3 rounded-xl bg-white border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {streakData.completedToday ? "✅ Daily challenge completed!" : "📚 Daily challenge pending"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {streakData.completedToday 
                      ? `${streakData.todayQuizzes} quiz${streakData.todayQuizzes !== 1 ? 'es' : ''} completed today`
                      : "Complete at least 1 quiz to maintain your streak"
                    }
                  </div>
                </div>
                {!streakData.completedToday && (
                  <button
                    onClick={handleTestQuizCompletion}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                  >
                    Test Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="p-4 grid gap-4 max-w-5xl mx-auto">
          {/* My Subjects */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-3">{dict.mySubjects}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => (
                <button
                  key={s.key}
                  className="text-left border rounded-xl p-3 hover:shadow bg-gradient-to-br from-white to-green-50"
                  onClick={() => router.push(`/subjects/${s.key}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-200 rounded" aria-hidden />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="text-sm">{s.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-green-600 h-2 rounded transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <span className="px-2 py-1 text-xs border rounded bg-white">
                      {s.progress > 0 ? "Resume" : "Start"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Continue Game / Quiz */}
      <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-2">{dict.continue}</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{lastSession.title}</div>
                <div className="text-sm text-gray-600">{lastSession.subject} · {lastSession.percent}%</div>
              </div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-full shadow">Resume</button>
            </div>
          </section>

          {/* Achievements */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-3">{dict.achievements}</h2>
            <div className="flex gap-3 flex-wrap">
              {badges.map((b) => (
                <div key={b.key} className="border rounded-xl p-3 min-w-[140px] bg-gradient-to-br from-white to-yellow-50">
                  <div className="w-10 h-10 bg-yellow-300 rounded-full mb-2 shadow-sm" aria-hidden />
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-green-600 h-2 rounded" style={{ width: `40%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <div className="px-3 py-1 border rounded-full bg-white">Level: {level}</div>
              <StreakStats userId={user?.id} />
            </div>
          </section>

          {/* Daily Streak Tracker */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-3">🔥 Daily Learning Streak</h2>
            <StreakWidget userId={user?.id} />
          </section>

          {/* My Progress */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-3">{dict.progress}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600">Overall Score</div>
                <div className="text-2xl font-bold">{weekly.thisWeek}%</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-bold">
                  {streakData.loading ? "..." : `${streakData.currentStreak} days`}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600">Today&apos;s Quizzes</div>
                <div className="text-2xl font-bold">
                  {streakData.loading ? "..." : streakData.todayQuizzes}
                </div>
              </div>
            </div>
            
            {/* Today's Stats */}
            {!streakData.loading && streakData.todayQuizzes > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-2">Today&apos;s Performance</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Time Spent:</span>
                    <span className="font-medium ml-1">
                      {Math.floor(streakData.todayTimeSpent / 60)}m {streakData.todayTimeSpent % 60}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium ml-1">{streakData.todayAverageScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Lightweight sparkline chart */}
            <svg className="mt-4 w-full h-16" viewBox="0 0 120 40" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={spark
                  .map((v, i) => `${(i / (spark.length - 1)) * 120},${40 - (v / 100) * 40}`)
                  .join(" ")}
              />
            </svg>
          </section>
        </main>

  {/* Footer / Nav */}
  <FooterNav />
  <div className="h-14" aria-hidden />
=======
export default function Page() {
  return (
    <>
      <SignedIn>
        <DashboardV2 />
>>>>>>> Swastik-purohit-coder-frontend-design
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
