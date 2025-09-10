import { useState, useEffect, useCallback } from 'react';
import { StreakService } from '../../lib/streakService';

// Custom hook for managing daily streak functionality
export function useStreak(userId) {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    completedToday: false,
    todayQuizzes: 0,
    todayTimeSpent: 0,
    todayAverageScore: 0,
    loading: true,
    error: null
  });

  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load streak data
  const loadStreakData = useCallback(async () => {
    if (!userId) return;

    try {
      setStreakData(prev => ({ ...prev, loading: true, error: null }));
      const stats = await StreakService.getStreakStats(userId);
      setStreakData(prev => ({
        ...prev,
        ...stats,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading streak data:', error);
      setStreakData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [userId]);

  // Load quiz history
  const loadQuizHistory = useCallback(async (options = {}) => {
    if (!userId) return;

    try {
      setHistoryLoading(true);
      const history = await StreakService.getQuizHistory(userId, options);
      setQuizHistory(history.completions || []);
    } catch (error) {
      console.error('Error loading quiz history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  // Record a quiz completion and update streak
  const recordQuizCompletion = useCallback(async (quizData) => {
    if (!userId) return;

    try {
      const result = await StreakService.recordQuizCompletion(userId, quizData);
      
      // Update streak data immediately
      setStreakData(prev => ({
        ...prev,
        currentStreak: result.currentStreak,
        completedToday: true,
        todayQuizzes: prev.todayQuizzes + 1,
        todayTimeSpent: prev.todayTimeSpent + (quizData.timeSpent || 0)
      }));

      // Refresh full data
      await loadStreakData();
      
      return result;
    } catch (error) {
      console.error('Error recording quiz completion:', error);
      throw error;
    }
  }, [userId, loadStreakData]);

  // Simulate a quiz completion (for testing)
  const simulateQuizCompletion = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await StreakService.simulateQuizCompletion(userId);
      await loadStreakData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error simulating quiz completion:', error);
      throw error;
    }
  }, [userId, loadStreakData]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadStreakData(),
      loadQuizHistory()
    ]);
  }, [loadStreakData, loadQuizHistory]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadStreakData();
    }
  }, [loadStreakData, userId]);

  return {
    // Streak data
    streakData,
    
    // Quiz history
    quizHistory,
    historyLoading,
    
    // Actions
    recordQuizCompletion,
    simulateQuizCompletion,
    loadQuizHistory,
    refreshData,
    
    // Computed values
    isStreakActive: streakData.currentStreak > 0,
    needsDailyQuiz: !streakData.completedToday,
    streakMessage: getStreakMessage(streakData.currentStreak, streakData.completedToday)
  };
}

// Helper function to generate streak messages
function getStreakMessage(streak, completedToday) {
  if (streak === 0) {
    return "Start your learning streak today! Complete a quiz to begin.";
  }
  
  if (completedToday) {
    if (streak === 1) {
      return "Great start! You've begun your learning streak. Keep it up tomorrow!";
    } else {
      return `Amazing! You're on a ${streak}-day streak! Keep the momentum going.`;
    }
  } else {
    if (streak === 1) {
      return "You have a 1-day streak. Complete a quiz today to continue!";
    } else {
      return `You have a ${streak}-day streak. Don't break it - complete a quiz today!`;
    }
  }
}

// Hook for daily activity tracking
export function useDailyActivity(userId, date = null) {
  const [activity, setActivity] = useState({
    totalQuizzes: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    hasCompletedDaily: false,
    currentStreak: 0,
    completions: [],
    loading: true,
    error: null
  });

  const loadActivity = useCallback(async () => {
    if (!userId) return;

    try {
      setActivity(prev => ({ ...prev, loading: true, error: null }));
      const data = await StreakService.getDailyActivity(userId, date);
      setActivity(prev => ({
        ...prev,
        ...data,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading daily activity:', error);
      setActivity(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [userId, date]);

  useEffect(() => {
    if (userId) {
      loadActivity();
    }
  }, [loadActivity, userId]);

  return {
    activity,
    loadActivity,
    refreshActivity: loadActivity
  };
}
