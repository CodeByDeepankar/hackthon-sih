"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/student/components/ui/card";
import { Button } from "@/student/components/ui/button";
import { Progress } from "@/student/components/ui/progress";
import { useI18n } from "@/i18n/useI18n";
import { AlertCircle, CheckCircle2, XCircle, Award } from "lucide-react";
import quizData from "@/lib/data/mathQuiz.json";
import { AnimatePresence, motion } from "framer-motion";
import api, { recordQuizCompletion } from "@/lib/api";

const STORAGE_KEY = "quiz-state-v1";

export default function QuizPage() {
  const { t, lang } = useI18n();
  const classes = useMemo(() => [6, 7, 8, 9, 10, 11, 12], []);
  const [selectedClass, setSelectedClass] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null); // 'correct' | 'incorrect' | null
  const [answers, setAnswers] = useState({}); // { [qIndex]: { choice, correct } }
  const [justEarnedBadge, setJustEarnedBadge] = useState(null); // { key, title } | null

  const questions = useMemo(() => {
    const k = String(selectedClass ?? "");
    return (quizData?.[k] ?? []).slice(0, 10);
  }, [selectedClass]);

  // Load state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && classes.includes(saved.selectedClass)) {
          setSelectedClass(saved.selectedClass);
          setIndex(Math.min(saved.index ?? 0, 9));
          setScore(saved.score ?? 0);
        }
      }
    } catch {}
  }, [classes]);

  // Persist state
  useEffect(() => {
    try {
      const payload = { selectedClass, index, score };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [selectedClass, index, score]);

  function resetAll() {
    setIndex(0);
    setScore(0);
    setAnswered(null);
  }

  function chooseClass(cls) {
    setSelectedClass(cls);
    resetAll();
  }

  function onAnswer(choice) {
    if (!questions[index]) return;
    const correct = questions[index].answer;
    const ok = choice === correct;
    setAnswered(ok ? "correct" : "incorrect");
    setAnswers(prev => ({ ...prev, [index]: { choice, correct: ok, correctAnswer: correct } }));
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setAnswered(null);
    }
  }

  function restart() {
    resetAll();
    setJustEarnedBadge(null);
    setAnswers({});
  }

  function changeClass() {
    setSelectedClass(null);
    resetAll();
  }

  const completed = selectedClass != null && index >= questions.length - 1 && answered !== null;

  // On completion, notify backend (once)
  useEffect(() => {
    async function notifyCompletion() {
      if (!completed) return;
      try {
        // Simulate userId retrieval (in real app, get from Clerk or session)
        const userId = localStorage.getItem('userId') || 'demo-student';
        const payload = {
          userId,
          quizId: `generic-math-quiz:class-${selectedClass}`,
          score: Math.round((score / questions.length) * 100),
          timeSpent: 0,
          subject: 'math'
        };
        const res = await recordQuizCompletion(payload);
        // If perfect score, show badge UI
        if (score === questions.length) {
          setJustEarnedBadge({ key: 'badge:math:perfect-10', title: 'Math Whiz' });
        }
      } catch (e) {
        console.warn('Completion notify failed', e.message);
      }
    }
    notifyCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t.quiz.title()}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!selectedClass && (
                <motion.div
                  key="class-select"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-gray-600 mb-2">{t.quiz.game.selectClass()}</div>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c, i) => (
                      <motion.div key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Button variant="outline" onClick={() => chooseClass(c)}>{c}</Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedClass && !completed && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Class {selectedClass}</span>
                    <span>{t.quiz.game.question({ n: index + 1, total: questions.length })}</span>
                  </div>
                  <Progress value={((index + (answered ? 1 : 0)) / questions.length) * 100} className="h-2" />
                  <div className="text-base font-medium light:text-black">{questions[index]?.q}</div>
                  <div className="grid gap-2">
                    {questions[index]?.options.map((opt, i) => (
                      <motion.div key={opt} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Button
                          variant="outline"
                          className={`justify-start ${answered ? (opt === questions[index].answer ? 'border-green-500' : '') : ''}`}
                          disabled={!!answered}
                          onClick={() => onAnswer(opt)}
                        >
                          {opt}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {answered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-2 text-sm ${answered === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                      {answered === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{answered === 'correct' ? t.quiz.game.correct() : t.quiz.game.incorrect()}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-600">{t.leaderboard.title()}: {score}</div>
                    <div className="flex gap-2">
                      {index < questions.length - 1 && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button onClick={next} disabled={!answered}>{t.quiz.game.next()}</Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedClass && completed && (
                <motion.div
                  key="quiz-results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {justEarnedBadge && (
                    <div className="flex items-center gap-2 text-green-700">
                      <Award className="w-5 h-5" />
                      <span>Badge earned: {justEarnedBadge.title}</span>
                    </div>
                  )}
                  <div className="text-lg font-semibold light:text-black">{t.quiz.game.yourScore()}</div>
                  <div className="text-sm text-gray-700">{t.quiz.game.scoreMsg({ score, total: questions.length })}</div>
                  {/* Review list */}
                  <div className="border rounded-md p-3 bg-white/60">
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
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={restart}>{t.quiz.game.restart()}</Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" onClick={changeClass}>{t.quiz.game.changeClass()}</Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="secondary" onClick={restart}>Play Again</Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
