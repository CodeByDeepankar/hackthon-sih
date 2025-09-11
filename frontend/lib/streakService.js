// Frontend service for handling daily streaks and quiz completions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class StreakService {
  // Record a quiz completion
  static async recordQuizCompletion(userId, quizData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...quizData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error recording quiz completion:', error);
      throw error;
    }
  }

  // Get current streak for a user
  static async getCurrentStreak(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/streak/${userId}`);

      // If the backend doesn't have a streak record yet, treat as zero
      if (response.status === 404) return 0;

      if (!response.ok) {
        console.warn(`Streak API responded with ${response.status}`);
        return 0;
      }

      const data = await response.json();
      return data.currentStreak || 0;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0; // Return 0 on error to avoid breaking UI
    }
  }

  // Get quiz completion history
  static async getQuizHistory(userId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.startDate) queryParams.append('startDate', options.startDate);
      if (options.endDate) queryParams.append('endDate', options.endDate);

      const url = `${API_BASE_URL}/quiz-history/${userId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting quiz history:', error);
      return { userId, completions: [], total: 0 };
    }
  }

  // Get daily activity summary
  static async getDailyActivity(userId, date = null) {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);

      const url = `${API_BASE_URL}/daily-activity/${userId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting daily activity:', error);
      return {
        userId,
        date: date || new Date().toISOString().split('T')[0],
        totalQuizzes: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        hasCompletedDaily: false,
        currentStreak: 0,
        completions: []
      };
    }
  }

  // Setup database views (call once during app initialization)
  static async setupViews() {
    try {
      const response = await fetch(`${API_BASE_URL}/setup-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting up views:', error);
      return { message: 'Setup failed', error: error.message };
    }
  }

  // Check if user has completed daily requirement
  static async hasCompletedDailyRequirement(userId, date = null) {
    try {
      const activity = await this.getDailyActivity(userId, date);
      return activity.hasCompletedDaily;
    } catch (error) {
      console.error('Error checking daily requirement:', error);
      return false;
    }
  }

  // Get streak statistics for display
  static async getStreakStats(userId) {
    try {
      const [currentStreak, todayActivity] = await Promise.all([
        this.getCurrentStreak(userId),
        this.getDailyActivity(userId)
      ]);

      return {
        currentStreak,
        completedToday: todayActivity.hasCompletedDaily,
        todayQuizzes: todayActivity.totalQuizzes,
        todayTimeSpent: todayActivity.totalTimeSpent,
        todayAverageScore: todayActivity.averageScore
      };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      return {
        currentStreak: 0,
        completedToday: false,
        todayQuizzes: 0,
        todayTimeSpent: 0,
        todayAverageScore: 0
      };
    }
  }

  // Simulate a quiz completion (for testing)
  static async simulateQuizCompletion(userId, quizId = 'test-quiz') {
    const mockQuizData = {
      quizId,
      score: Math.floor(Math.random() * 100) + 1, // Random score 1-100
      timeSpent: Math.floor(Math.random() * 300) + 60, // Random time 60-360 seconds
      subject: ['Math', 'Science', 'English'][Math.floor(Math.random() * 3)]
    };

    return this.recordQuizCompletion(userId, mockQuizData);
  }
}

// Utility functions for date handling
export const dateUtils = {
  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  },

  getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
};
