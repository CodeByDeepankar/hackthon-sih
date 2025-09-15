"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/student/components/ui/card";
import { Button } from "@/student/components/ui/button";
import { Progress } from "@/student/components/ui/progress";
import { useI18n } from "@/i18n/useI18n";
import quizData from "@/lib/data/mathQuiz.json";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, Award } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { recordQuizCompletion } from "@/lib/api";

const STORAGE_KEY = "math-blitz-state-v1";
const CLASS_KEY = "studentClass"; // assumed provided by login flow elsewhere

export default function MathBlitzPage() {
  const { t } = useI18n();
  const [studentClass, setStudentClass] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null); // 'correct' | 'incorrect' | null
  const [justEarnedBadge, setJustEarnedBadge] = useState(null);
  const [answers, setAnswers] = useState({}); // { [qIndex]: { choice, correct } }
  const [showResults, setShowResults] = useState(false);
  const autoNextTimer = useRef(null);

  // Load class from storage (or let the page be a dead-end if missing)
  useEffect(() => {
    try {
      const cls = parseInt(localStorage.getItem(CLASS_KEY) || "", 10);
      if (cls >= 6 && cls <= 12) setStudentClass(cls);
    } catch {}
  }, []);

  const questions = useMemo(() => {
    if (!studentClass) return [];
    return (quizData?.[String(studentClass)] ?? []).slice(0, 10);
  }, [studentClass]);

  // Load saved quiz progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.studentClass === studentClass) {
          const restoredIndex = Math.min(saved.index ?? 0, 9);
          setIndex(restoredIndex);
          if (saved.answers) setAnswers(saved.answers);
          const s = Object.values(saved.answers || {}).filter(a => a.correct).length;
          setScore(s);
          const prev = saved.answers?.[restoredIndex];
          setAnswered(prev ? (prev.correct ? 'correct' : 'incorrect') : null);
        }
      }
    } catch {}
  }, [studentClass]);

  // Persist state
  useEffect(() => {
    try {
      if (studentClass) {
        const payload = { studentClass, index, score, answers };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {}
  }, [studentClass, index, score, answers]);

  useEffect(() => () => clearTimeout(autoNextTimer.current), []);

  function onAnswer(opt) {
    if (!questions[index]) return;
    const correct = questions[index].answer;
    const ok = opt === correct;
    setAnswered(ok ? "correct" : "incorrect");
    setAnswers(prev => ({ ...prev, [index]: { choice: opt, correct: ok } }));
    // auto move next after short delay
    autoNextTimer.current = setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        setAnswered(null);
      }
    }, 700);
  }

  // derive score from answers map
  useEffect(() => {
    const s = Object.values(answers).filter(a => a.correct).length;
    setScore(s);
  }, [answers]);

  function replay() {
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setJustEarnedBadge(null);
    setAnswers({});
  }

  function goBack() {
    clearTimeout(autoNextTimer.current);
    if (index > 0) {
      const newIdx = index - 1;
      setIndex(newIdx);
      const prev = answers[newIdx];
      setAnswered(prev ? (prev.correct ? 'correct' : 'incorrect') : null);
    }
  }

  // Completed when the last question has been answered
  const completed = (studentClass != null) && questions.length > 0 && (index >= questions.length - 1) && (answered !== null);

  useEffect(() => {
    async function notify() {
      if (!completed || !studentClass) return;
      try {
        const userId = localStorage.getItem('userId') || 'demo-student';
        const payload = {
          userId,
          quizId: `math-blitz:class-${studentClass}`,
          score: Math.round((score / questions.length) * 100),
          timeSpent: 0,
          subject: 'math'
        };
        await recordQuizCompletion(payload);
        if (score === questions.length) setJustEarnedBadge({ key: 'badge:math:perfect-10', title: 'Math Whiz' });
        setShowResults(true);
      } catch (e) {
        console.warn('math-blitz completion post failed', e.message);
      }
    }
    notify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  return (
    <>
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.games.titles.mathBlitz()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!studentClass && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Student class not set. Go back to games.</p>
                <Link href="/student/games" className="inline-flex"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> {t.nav.games()}</Button></Link>
              </div>
            )}
            {studentClass && (
            <>
            <AnimatePresence mode="wait">
              {!completed && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Class {studentClass}</span>
                    <span>{t.quiz.game.question({ n: index + 1, total: questions.length })}</span>
                  </div>
                  <Progress value={(index / questions.length) * 100} className="h-2" />
                  <div className="text-base font-medium light:text-black">{questions[index]?.q}</div>
                  <div className="grid gap-2">
                    {questions[index]?.options.map((opt, i) => (
                      <motion.div key={opt} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Button variant="outline" className="justify-start" onClick={() => onAnswer(opt)} disabled={!!answered}>
                          {opt}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center gap-2 text-sm ${answered === 'correct' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {answered === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{answered === 'correct' ? t.quiz.game.correct() : t.quiz.game.incorrect()}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between pt-1">
                    <motion.div whileHover={{ scale: index > 0 ? 1.02 : 1 }} whileTap={{ scale: index > 0 ? 0.98 : 1 }}>
                      <Button variant="outline" onClick={goBack} disabled={index === 0}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                    </motion.div>
                    <div />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {completed && !showResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {justEarnedBadge && (
                    <div className="flex items-center gap-2 text-green-700">
                      <Award className="w-5 h-5" />
                      <span>Badge earned: {justEarnedBadge.title}</span>
                    </div>
                  )}
                  <div className="text-lg font-semibold light:text-black">{t.quiz.game.yourScore()}</div>
                  <div className="text-sm text-gray-700">{t.quiz.game.scoreMsg({ score, total: questions.length })}</div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={replay}>{t.quiz.game.restart()}</Button>
                    </motion.div>
                    <Link href="/student/games" className="inline-flex">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline">{t.nav.games()}</Button>
                      </motion.div>
                    </Link>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="secondary" onClick={replay}>Play Again</Button>
                    </motion.div>
                  </div>
                  {/* Review list */}
                  <div className="border rounded-md p-3 bg-white/60 mt-3">
                    <div className="text-sm font-medium mb-2">Review</div>
                    <div className="space-y-2">
                      {questions.map((q, qi) => {
                        const ans = answers[qi];
                        const isCorrect = ans?.correct;
                        return (
                          <div key={qi} className="p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <div className="font-medium light:text-black">Q{qi + 1}. {q.q}</div>
                              <div className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </div>
                            </div>
                            <div className="text-sm mt-1">
                              <div>Selected: <span className="font-medium">{ans?.choice ?? '-'}</span></div>
                              {!isCorrect && (
                                <div>Answer: <span className="font-medium">{q.answer}</span></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    {showResults && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowResults(false)} />
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-xl">
          <div className="bg-white rounded-xl shadow-xl border p-5 space-y-3">
            {justEarnedBadge && (
              <div className="flex items-center gap-2 text-green-700">
                <Award className="w-5 h-5" />
                <span>Badge earned: {justEarnedBadge.title}</span>
              </div>
            )}
            <div className="text-lg font-semibold light:text-black">{t.quiz.game.yourScore()}</div>
            <div className="text-sm text-gray-700">{t.quiz.game.scoreMsg({ score, total: questions.length })}</div>
            <div className="border rounded-md p-3 bg-white/60">
              <div className="text-sm font-medium mb-2">Review</div>
              <div className="space-y-2 max-h-80 overflow-auto">
                {questions.map((q, qi) => {
                  const ans = answers[qi];
                  const isCorrect = ans?.correct;
                  return (
                    <div key={qi} className="p-2 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="font-medium light:text-black">Q{qi + 1}. {q.q}</div>
                        <div className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        <div>Selected: <span className="font-medium">{ans?.choice ?? '-'}</span></div>
                        {!isCorrect && (
                          <div>Answer: <span className="font-medium">{q.answer}</span></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={() => setShowResults(false)}>Close</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => { setShowResults(false); replay(); }}>Play Again</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="secondary">
                  <a href="/student/games">Back to Games</a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
