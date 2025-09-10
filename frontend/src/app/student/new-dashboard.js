"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import LanguageToggle from "@/components/LanguageToggle";
import OfflineNotice from "@/components/OfflineNotice";
import { useRouter } from "next/navigation";
import OnlineBadge from "@/components/OnlineBadge";
import FooterNav from "@/components/FooterNav";
import { useStreak } from "@/hooks/useStreak";
import StreakWidget, { StreakStats } from "@/components/StreakWidget";
import { useSubjects, useQuizzes, useDailyActivity } from "@/hooks/useApi";
import QuizAttempt from "@/components/QuizAttempt";

const StudentDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentView, setCurrentView] = useState('subjects'); // subjects, quizzes, quiz
  
  // API hooks
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { quizzes, loading: quizzesLoading } = useQuizzes({ 
    subjectId: selectedSubject?.id 
  });
  const { activity, loading: activityLoading } = useDailyActivity(user?.id);
  
  // Streak hook
  const {
    streakData,
    quizHistory,
    loadStreakData,
    loadQuizHistory,
    markQuizCompleted
  } = useStreak(user?.id);

  useEffect(() => {
    if (user?.id) {
      loadStreakData();
      loadQuizHistory();
    }
  }, [user?.id, loadStreakData, loadQuizHistory]);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('quizzes');
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quiz');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setCurrentView('subjects');
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setCurrentView('quizzes');
  };

  const renderSubjectsView = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Student'}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Daily Progress and Streak */}
      <div className="grid md:grid-cols-2 gap-6">
        <StreakWidget userId={user?.id} />
        <StreakStats 
          activity={activity}
          loading={activityLoading}
        />
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Choose a Subject
        </h2>
        
        {subjectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={() => handleSubjectSelect(subject)}
              />
            ))}
          </div>
        )}

        {!subjectsLoading && subjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No subjects available yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Ask your teacher to add some subjects to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuizzesView = () => (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToSubjects}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Subjects</span>
        </button>
      </div>

      {/* Subject header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {selectedSubject?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {selectedSubject?.description || 'Select a quiz to get started'}
        </p>
      </div>

      {/* Quizzes Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Available Quizzes
        </h2>
        
        {quizzesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => handleQuizSelect(quiz)}
              />
            ))}
          </div>
        )}

        {!quizzesLoading && quizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No quizzes available yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your teacher hasn&apos;t added any quizzes for this subject yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuizView = () => (
    <QuizAttempt
      quiz={selectedQuiz}
      onBack={handleBackToQuizzes}
      onComplete={(result) => {
        markQuizCompleted(selectedQuiz.id, result.score);
        handleBackToQuizzes();
      }}
      userId={user?.id}
    />
  );

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Student Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <OnlineBadge />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OfflineNotice />
          
          {currentView === 'subjects' && renderSubjectsView()}
          {currentView === 'quizzes' && renderQuizzesView()}
          {currentView === 'quiz' && renderQuizView()}
        </main>

        {/* Footer Navigation */}
        <FooterNav />
      </div>
    </SignedIn>
  );
};

// Subject Card Component
const SubjectCard = ({ subject, onClick }) => {
  const subjectColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600'
  ];
  
  const colorClass = subjectColors[Math.abs(subject.name.charCodeAt(0)) % subjectColors.length];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 p-6 text-left w-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative">
        <div className="text-2xl mb-3">📖</div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {subject.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Class {subject.class}
        </p>
        {subject.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {subject.description}
          </p>
        )}
      </div>
    </button>
  );
};

// Quiz Card Component
const QuizCard = ({ quiz, onClick }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTimeLimit = (seconds) => {
    if (seconds >= 3600) {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    } else if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}m`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 p-6 text-left w-full"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {quiz.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty || 'medium'}
        </span>
      </div>
      
      {quiz.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTimeLimit(quiz.timeLimit || 300)}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {quiz.questions?.length || 0} questions
          </span>
        </div>
        
        <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 font-medium">
          Start Quiz →
        </span>
      </div>
    </button>
  );
};

export default function Page() {
  return (
    <>
      <SignedIn>
        <StudentDashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
