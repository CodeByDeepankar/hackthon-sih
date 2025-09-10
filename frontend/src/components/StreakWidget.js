"use client";
import { useState } from 'react';
import { useStreak } from '@/hooks/useStreak';

export default function StreakWidget({ userId, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    streakData,
    simulateQuizCompletion,
    isStreakActive,
    needsDailyQuiz,
    streakMessage
  } = useStreak(userId);

  const handleTestQuiz = async () => {
    try {
      const result = await simulateQuizCompletion();
      alert(`Quiz completed! Your streak is now ${result.currentStreak} days.`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (streakData.loading) {
    return (
      <div className={`animate-pulse ${compact ? 'p-2' : 'p-4'}`}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="font-semibold">{streakData.currentStreak}</span>
        <span className="text-sm text-gray-600">days</span>
        {needsDailyQuiz && (
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Daily quiz pending"></div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="font-bold text-lg">{streakData.currentStreak} Days</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="mb-3">
        <div className={`text-sm ${needsDailyQuiz ? 'text-orange-600' : 'text-green-600'}`}>
          {streakMessage}
        </div>
      </div>

      {needsDailyQuiz && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium text-orange-800">Daily Challenge</div>
              <div className="text-orange-600">Complete a quiz to maintain your streak</div>
            </div>
            <button
              onClick={handleTestQuiz}
              className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm hover:bg-orange-700 transition-colors"
            >
              Quick Quiz
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="border-t pt-3 mt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600">Today&apos;s Quizzes</div>
              <div className="font-semibold">{streakData.todayQuizzes}</div>
            </div>
            <div>
              <div className="text-gray-600">Time Spent</div>
              <div className="font-semibold">
                {Math.floor(streakData.todayTimeSpent / 60)}m {streakData.todayTimeSpent % 60}s
              </div>
            </div>
            <div>
              <div className="text-gray-600">Avg Score</div>
              <div className="font-semibold">{streakData.todayAverageScore.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-600">Status</div>
              <div className={`font-semibold ${streakData.completedToday ? 'text-green-600' : 'text-orange-600'}`}>
                {streakData.completedToday ? 'Complete' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak visualization */}
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-600 mb-2">Last 7 days</div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const dayNumber = 7 - i;
            const isActive = dayNumber <= streakData.currentStreak;
            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${
                  isActive ? 'bg-green-500' : 'bg-gray-200'
                }`}
                title={`Day ${dayNumber}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Streak stats component for dashboard summary
export function StreakStats({ userId }) {
  const { streakData } = useStreak(userId);

  if (streakData.loading) {
    return (
      <div className="flex gap-4">
        <div className="animate-pulse h-12 bg-gray-200 rounded w-24"></div>
        <div className="animate-pulse h-12 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-sm">
      <div className="px-3 py-1 border rounded-full bg-white">
        🔥 Streak: {streakData.currentStreak}d
      </div>
      {streakData.completedToday && (
        <div className="px-3 py-1 border rounded-full bg-green-50 text-green-700">
          ✅ Daily Goal Met
        </div>
      )}
      {!streakData.completedToday && streakData.currentStreak > 0 && (
        <div className="px-3 py-1 border rounded-full bg-orange-50 text-orange-700">
          ⏰ Quiz Pending
        </div>
      )}
    </div>
  );
}
