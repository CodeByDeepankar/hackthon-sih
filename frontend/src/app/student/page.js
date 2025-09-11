"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { fetchUserRole } from "@/lib/users";
import LanguageToggle from "@/components/LanguageToggle";
import OfflineNotice from "@/components/OfflineNotice";
import { useRouter } from "next/navigation";
import OnlineBadge from "@/components/OnlineBadge";
import FooterNav from "@/components/FooterNav";
import { useStreak } from "@/hooks/useStreak";
import apiClient from "@/lib/api";
import { useToast } from "@/components/ToastHub";
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
  const { user, isLoaded } = useUser();
  const [roleChecked, setRoleChecked] = useState(false);
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

  // Ensure only real students can access
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;
    (async () => {
      const record = await fetchUserRole(user.id).catch(()=>null);
      if (!record || record.role === 'unassigned' || record.provisional || record.role !== 'student') {
        router.replace('/role-select');
      } else {
        setRoleChecked(true);
      }
    })();
  }, [isLoaded, user, router]);

  // (Keep hooks above; perform gating render below after hooks declared)

  function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    setInstallEvent(null);
  }

  const gatingPending = isLoaded && user && !roleChecked;

  // Dynamic academic data
  const [subjects, setSubjects] = useState([]); // [{key,name,class,schoolId,progress,attempted,totalQuizzes}]
  const [quizzes, setQuizzes] = useState([]);   // all quizzes (filtered by schoolId)
  const [recentActivity, setRecentActivity] = useState([]); // last quiz attempts
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const toast = useToast();

  const refreshAcademicData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setDataLoading(true); setDataError(null);
      const role = await apiClient.getUserRole(user.id).catch(() => null);
      setRoleInfo(role);
      const classFilter = role?.class;
      const schoolId = role?.schoolId;

      // Parallel fetch
      const [subjectsStats, quizzesRaw, progressRaw] = await Promise.all([
        apiClient.getSubjectStats({ class: classFilter, schoolId, studentId: user.id }).catch(()=>null),
        apiClient.getQuizzes(schoolId ? { schoolId } : {}),
        apiClient.getStudentProgress(user.id).catch(() => null)
      ]);

      const responses = progressRaw?.recentActivity || [];
      setRecentActivity(responses.slice(0, 5));

      // Build quiz lookup for attempted
      const attemptedQuizIds = new Set(responses.map(r => r.quizId));
  const quizzesFiltered = quizzesRaw.filter(q => !schoolId || !q.schoolId || q.schoolId === schoolId);
      setQuizzes(quizzesFiltered);

      // Count quizzes per subject
      const quizzesBySubject = quizzesFiltered.reduce((acc, q) => {
        acc[q.subjectId] = (acc[q.subjectId] || 0) + 1; return acc;
      }, {});

      // Attempt counts per subject
      const attemptsBySubject = responses.reduce((acc, r) => {
        // Need quiz subject; find quiz in quizzesFiltered
        const quiz = quizzesFiltered.find(q => q.id === r.quizId);
        if (quiz) {
          acc[quiz.subjectId] = (acc[quiz.subjectId] || 0) + 1;
        }
        return acc;
      }, {});

      let filteredSubjects;
      if (subjectsStats?.subjects) {
        filteredSubjects = subjectsStats.subjects.map(s => ({
          key: s.id,
          name: s.name,
          class: s.class,
            schoolId: s.schoolId,
          attempted: s.attempted,
          totalQuizzes: s.quizCount,
          progress: s.progress
        }));
      } else {
        filteredSubjects = [];
      }
      setSubjects(filteredSubjects);
    } catch (e) {
      console.error('Academic data load error', e);
      setDataError(e.message);
    } finally {
      setDataLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { refreshAcademicData(); }, [refreshAcademicData]);
  // Poll every 30s for newly added subjects/quizzes by teachers in same school
  useEffect(() => {
    if (!roleInfo?.schoolId) return;
    const interval = setInterval(() => refreshAcademicData(), 30000);
    return () => clearInterval(interval);
  }, [roleInfo?.schoolId, refreshAcademicData]);

  // WebSocket real-time updates (fallback to existing 30s polling)
  useEffect(() => {
    if (!roleInfo?.schoolId) return;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // Convert http -> ws
    const wsUrl = base.replace(/^http/, 'ws') + '/ws';
    let reconnectAttempts = 0;
    let socket;
    let forceClose = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => { reconnectAttempts = 0; };
      socket.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.event === 'subject.created') {
            const data = msg.data;
            if (data?.schoolId && data.schoolId === roleInfo.schoolId) {
              if (!subjects.find(s => s.key === data.id)) {
                toast?.push(`New subject added: ${data.name}`, { type: 'success' });
                refreshAcademicData();
              }
            }
          } else if (msg.event === 'quiz.created') {
            const data = msg.data;
            if (data?.schoolId && data.schoolId === roleInfo.schoolId) {
              refreshAcademicData();
            }
          } else if (msg.event === 'quiz.attempted') {
            const data = msg.data;
            if (data?.studentId === user?.id) {
              toast?.push(`Quiz scored ${Math.round(data.score)}%`, { type: 'info' });
              refreshAcademicData();
            }
          } else if (msg.event === 'user.provisioned') {
            if (msg.data?.userId === user?.id) {
              toast?.push('Your profile was provisioned.', { type: 'success' });
              refreshAcademicData();
            }
          }
        } catch {}
      };
      socket.onclose = () => {
        if (forceClose) return;
        // Exponential backoff up to ~30s
        reconnectAttempts += 1;
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
        setTimeout(connect, delay);
      };
      socket.onerror = () => { socket.close(); };
    };
    connect();
    return () => { forceClose = true; try { socket && socket.close(); } catch {} };
  }, [roleInfo?.schoolId, subjects, toast, refreshAcademicData, user?.id]);

  // Real-time dashboard data (replace all hardcoded values)
  const [dashboardStats, setDashboardStats] = useState({
    overallScore: 0,
    totalQuizzes: 0,
    completionRate: 0,
    averageScore: 0,
    weeklyProgress: [],
    recentBadges: [],
    currentLevel: 1,
    nextLevelProgress: 0,
    totalTimeSpent: 0,
    weeklyTimeSpent: 0,
    lastSession: null
  });

  // Fetch comprehensive dashboard statistics
  const refreshDashboardStats = useCallback(async () => {
    if (!user?.id || !roleInfo) return;
    
    try {
      // Get student's complete progress and responses
      const [progress, quizHistory, leaderboard] = await Promise.all([
        apiClient.getStudentProgress(user.id).catch(() => ({ summary: {}, recentActivity: [] })),
        apiClient.getQuizHistory(user.id, 100).catch(() => ({ completions: [] })),
        apiClient.getLeaderboard().catch(() => [])
      ]);

      const responses = progress.recentActivity || [];
      const completions = quizHistory.completions || [];
      
      // Calculate comprehensive stats
      const totalQuizzes = responses.length;
      const averageScore = totalQuizzes > 0 ? responses.reduce((sum, r) => sum + r.score, 0) / totalQuizzes : 0;
      const completionRate = subjects.length > 0 ? (subjects.filter(s => s.attempted > 0).length / subjects.length) * 100 : 0;
      
      // Weekly progress (last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = date.toISOString().split('T')[0];
        const dayResponses = responses.filter(r => r.submittedAt && r.submittedAt.startsWith(dayStr));
        const dayScore = dayResponses.length > 0 ? dayResponses.reduce((sum, r) => sum + r.score, 0) / dayResponses.length : 0;
        weeklyData.push(Math.round(dayScore));
      }
      
      // Calculate level based on total quizzes completed
      const currentLevel = Math.floor(totalQuizzes / 10) + 1;
      const nextLevelProgress = ((totalQuizzes % 10) / 10) * 100;
      
      // Time calculations (from completions data)
      const totalTimeSpent = completions.reduce((sum, c) => sum + (c.timeSpent || 0), 0);
      const weeklyCompletions = completions.filter(c => {
        const compDate = new Date(c.completedAt);
        return compDate >= weekAgo;
      });
      const weeklyTimeSpent = weeklyCompletions.reduce((sum, c) => sum + (c.timeSpent || 0), 0);
      
      // Recent badges (based on achievements)
      const recentBadges = [];
      if (currentLevel > 1) recentBadges.push({ key: `level-${currentLevel - 1}`, name: `Level ${currentLevel - 1} Completed` });
      if (averageScore >= 80) recentBadges.push({ key: 'high-scorer', name: 'High Scorer' });
      if (streakData.currentStreak >= 7) recentBadges.push({ key: 'streak-master', name: 'Streak Master' });
      if (totalQuizzes >= 50) recentBadges.push({ key: 'quiz-expert', name: 'Quiz Expert' });
      
      // Last session
      const lastSession = responses.length > 0 ? {
        title: responses[0].quizTitle || 'Recent Quiz',
        subject: subjects.find(s => {
          const quiz = quizzes.find(q => q.id === responses[0].quizId);
          return quiz && s.key === quiz.subjectId;
        })?.name || 'Unknown',
        percent: Math.round(responses[0].score || 0),
        timeAgo: new Date(responses[0].submittedAt).toLocaleDateString()
      } : null;
      
      setDashboardStats({
        overallScore: Math.round(averageScore),
        totalQuizzes,
        completionRate: Math.round(completionRate),
        averageScore: Math.round(averageScore),
        weeklyProgress: weeklyData,
        recentBadges: recentBadges.slice(0, 4),
        currentLevel,
        nextLevelProgress: Math.round(nextLevelProgress),
        totalTimeSpent,
        weeklyTimeSpent,
        lastSession
      });
      
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, [user?.id, roleInfo, subjects, quizzes, streakData.currentStreak]);

  // Refresh dashboard stats when academic data changes
  useEffect(() => {
    refreshDashboardStats();
  }, [refreshDashboardStats, subjects, recentActivity]);

  // Handler for simulating quiz completion (for testing)
  const handleTestQuizCompletion = async () => {
    try {
      const result = await simulateQuizCompletion();
      toast?.push(`Quiz completed! Your streak is now ${result.currentStreak} days.`, { type: 'success' });
      // Refresh all data after test completion
      refreshAcademicData();
      refreshDashboardStats();
    } catch (error) {
      toast?.push(`Error: ${error.message}`, { type: 'error' });
    }
  };

  if (gatingPending) {
    return <div className="p-6">Validating access...</div>;
  }

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
          <section className="bg-white rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{dict.mySubjects}</h2>
              <button onClick={refreshAcademicData} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Refresh</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataLoading && (
                <div className="col-span-full text-sm text-gray-500">Loading...</div>
              )}
              {dataError && (
                <div className="col-span-full text-sm text-red-600">{dataError}</div>
              )}
              {!dataLoading && subjects.length === 0 && !dataError && (
                <div className="col-span-full text-sm text-gray-500">No subjects assigned yet.</div>
              )}
              {subjects.map(s => (
                <button key={s.key} onClick={() => router.push(`/subjects/${s.key}`)}
                  className="text-left border rounded-xl p-3 hover:shadow bg-gradient-to-br from-white to-green-50 focus:outline-none focus:ring-2 focus:ring-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-200 rounded" aria-hidden />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="text-xs text-gray-600">{s.attempted}/{s.totalQuizzes}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-green-600 h-2 rounded transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>{s.progress}% complete</span>
                    <span className="px-2 py-0.5 border rounded bg-white">{s.progress > 0 ? 'Resume' : 'Start'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Available Quizzes */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Available Quizzes</h2>
            {dataLoading && <div className="text-sm text-gray-500">Loading quizzes...</div>}
            {!dataLoading && quizzes.length === 0 && <div className="text-sm text-gray-500">No quizzes yet.</div>}
            {!dataLoading && quizzes.length > 0 && (
              <div className="space-y-2">
                {quizzes.slice(0,6).map(q => {
                  const attempted = recentActivity.some(r => r.quizId === q.id);
                  const subject = subjects.find(s => s.key === q.subjectId);
                  return (
                    <div key={q.id} className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">{q.title}</div>
                        <div className="text-xs text-gray-600">{subject?.name || q.subjectId} · {q.difficulty}</div>
                      </div>
                      <button
                        onClick={() => router.push(`/subjects/${q.subjectId}`)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${attempted ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {attempted ? 'Review' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Recent Activity</h2>
            {dataLoading && <div className="text-sm text-gray-500">Loading activity...</div>}
            {!dataLoading && recentActivity.length === 0 && <div className="text-sm text-gray-500">No quiz attempts yet.</div>}
            {!dataLoading && recentActivity.length > 0 && (
              <div className="space-y-2">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm border rounded px-3 py-2">
                    <div className="truncate pr-3">
                      <div className="font-medium truncate">{a.quizTitle || a.quizId}</div>
                      <div className="text-xs text-gray-500">Score: {Math.round(a.score)}%</div>
                    </div>
                    <div className="text-xs text-gray-600">{new Date(a.submittedAt || a.completedAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Continue Game / Quiz */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-2">{dict.continue}</h2>
            {dashboardStats.lastSession ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{dashboardStats.lastSession.title}</div>
                  <div className="text-sm text-gray-600">{dashboardStats.lastSession.subject} · {dashboardStats.lastSession.percent}% · {dashboardStats.lastSession.timeAgo}</div>
                </div>
                <button 
                  onClick={() => router.push(`/subjects/${subjects.find(s => s.name === dashboardStats.lastSession.subject)?.key || ''}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
                >
                  Resume
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recent quizzes. Start your first quiz!</div>
            )}
          </section>

          {/* Achievements */}
          <section className="bg-white rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
            <h2 className="font-semibold mb-3">{dict.achievements}</h2>
            <div className="flex gap-3 flex-wrap">
              {dashboardStats.recentBadges.length > 0 ? dashboardStats.recentBadges.map((b) => (
                <div key={b.key} className="border rounded-xl p-3 min-w-[140px] bg-gradient-to-br from-white to-yellow-50">
                  <div className="w-10 h-10 bg-yellow-300 rounded-full mb-2 shadow-sm flex items-center justify-center text-lg">
                    {b.key.includes('level') ? '🏆' : b.key.includes('streak') ? '🔥' : b.key.includes('scorer') ? '⭐' : '🎯'}
                  </div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-green-600 h-2 rounded w-full" />
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500">Complete quizzes to earn achievements!</div>
              )}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <div className="px-3 py-1 border rounded-full bg-white">Level: {dashboardStats.currentLevel}</div>
              <div className="px-3 py-1 border rounded-full bg-white">{dashboardStats.nextLevelProgress}% to next level</div>
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
                <div className="text-2xl font-bold">{dashboardStats.overallScore}%</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-bold">
                  {streakData.loading ? "..." : `${streakData.currentStreak} days`}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600">Total Quizzes</div>
                <div className="text-2xl font-bold">{dashboardStats.totalQuizzes}</div>
              </div>
            </div>
            
            {/* Weekly Progress Chart */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">Weekly Performance</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium ml-1">{dashboardStats.completionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Weekly Time:</span>
                  <span className="font-medium ml-1">
                    {Math.floor(dashboardStats.weeklyTimeSpent / 60)}m {dashboardStats.weeklyTimeSpent % 60}s
                  </span>
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
            
            {/* Weekly sparkline chart using real data */}
            <svg className="mt-4 w-full h-16" viewBox="0 0 120 40" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={dashboardStats.weeklyProgress
                  .map((v, i) => `${(i / (dashboardStats.weeklyProgress.length - 1)) * 120},${40 - (v / 100) * 40}`)
                  .join(" ")}
              />
            </svg>
          </section>
        </main>

  {/* Footer / Nav */}
  <FooterNav />
  <div className="h-14" aria-hidden />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
