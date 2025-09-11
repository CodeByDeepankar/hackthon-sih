// Frontend service for handling daily streaks and quiz completions (migrated from /frontend/lib)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class StreakService {
  static async recordQuizCompletion(userId, quizData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...quizData })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error recording quiz completion:', error);
      throw error;
    }
  }

  static async getCurrentStreak(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/streak/${userId}`);
      if (response.status === 404) return 0;
      if (!response.ok) return 0;
      const data = await response.json();
      return data.currentStreak || 0;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  static async getQuizHistory(userId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.startDate) queryParams.append('startDate', options.startDate);
      if (options.endDate) queryParams.append('endDate', options.endDate);
      const url = `${API_BASE_URL}/quiz-history/${userId}${queryParams.toString() ? '?' + queryParams : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting quiz history:', error);
      return { userId, completions: [], total: 0 };
    }
  }

  static async getDailyActivity(userId, date = null) {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      const url = `${API_BASE_URL}/daily-activity/${userId}${queryParams.toString() ? '?' + queryParams : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting daily activity:', error);
      return { userId, date: date || new Date().toISOString().split('T')[0], totalQuizzes: 0, totalTimeSpent: 0, averageScore: 0, hasCompletedDaily: false, currentStreak: 0, completions: [] };
    }
  }

  static async setupViews() {
    try {
      const response = await fetch(`${API_BASE_URL}/setup-views`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error setting up views:', error);
      return { message: 'Setup failed', error: error.message };
    }
  }

  static async hasCompletedDailyRequirement(userId, date = null) {
    try { const activity = await this.getDailyActivity(userId, date); return activity.hasCompletedDaily; } catch { return false; }
  }

  static async getStreakStats(userId) {
    try {
      const [currentStreak, todayActivity] = await Promise.all([
        this.getCurrentStreak(userId),
        this.getDailyActivity(userId)
      ]);
      return { currentStreak, completedToday: todayActivity.hasCompletedDaily, todayQuizzes: todayActivity.totalQuizzes, todayTimeSpent: todayActivity.totalTimeSpent, todayAverageScore: todayActivity.averageScore };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      return { currentStreak: 0, completedToday: false, todayQuizzes: 0, todayTimeSpent: 0, todayAverageScore: 0 };
    }
  }

  static async simulateQuizCompletion(userId, quizId = 'test-quiz') {
    const mockQuizData = { quizId, score: Math.floor(Math.random() * 100) + 1, timeSpent: Math.floor(Math.random() * 300) + 60, subject: ['Math', 'Science', 'English'][Math.floor(Math.random() * 3)] };
    return this.recordQuizCompletion(userId, mockQuizData);
  }
}

export const dateUtils = {
  getTodayDateString() { return new Date().toISOString().split('T')[0]; },
  getYesterdayDateString() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; },
  formatDate(dateString) { const date = new Date(dateString); return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); },
  getDateDaysAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().split('T')[0]; }
};
