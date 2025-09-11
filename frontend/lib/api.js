// API client for the learning dashboard
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ===========================================
  // SUBJECTS API
  // ===========================================

  async getSubjects(classFilter = null) {
    const params = classFilter ? `?class=${encodeURIComponent(classFilter)}` : '';
    return this.request(`/subjects${params}`);
  }

  async createSubject(subjectData) {
    return this.request('/subjects', {
      method: 'POST',
      body: subjectData,
    });
  }

  async updateSubject(id, subjectData) {
    return this.request(`/subjects/${id}`, {
      method: 'PUT',
      body: subjectData,
    });
  }

  async deleteSubject(id, deletedBy) {
    return this.request(`/subjects/${id}`, {
      method: 'DELETE',
      body: { deletedBy },
    });
  }

  // ===========================================
  // QUIZZES API
  // ===========================================

  async getQuizzes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);
    
    const queryString = params.toString();
    return this.request(`/quizzes${queryString ? '?' + queryString : ''}`);
  }

  async getQuiz(id, includeAnswers = false) {
    const params = includeAnswers ? '?includeAnswers=true' : '';
    return this.request(`/quizzes/${id}${params}`);
  }

  async createQuiz(quizData) {
    return this.request('/quizzes', {
      method: 'POST',
      body: quizData,
    });
  }

  // ===========================================
  // QUIZ RESPONSES API
  // ===========================================

  async submitQuizResponse(responseData) {
    return this.request('/responses', {
      method: 'POST',
      body: responseData,
    });
  }

  async getStudentResponses(studentId, limit = 50) {
    return this.request(`/responses/student/${studentId}?limit=${limit}`);
  }

  // ===========================================
  // STREAK AND PROGRESS API
  // ===========================================

  async getStreak(userId) {
    return this.request(`/streak/${userId}`);
  }

  async getDailyActivity(userId, date = null) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/daily-activity/${userId}${params}`);
  }

  async getQuizHistory(userId, limit = 50, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/quiz-history/${userId}?${params.toString()}`);
  }

  async recordQuizCompletion(completionData) {
    return this.request('/quiz-completion', {
      method: 'POST',
      body: completionData,
    });
  }

  // ===========================================
  // LEADERBOARD API
  // ===========================================

  async getLeaderboard(filters = {}) {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.timeframe) params.append('timeframe', filters.timeframe);
    
    const queryString = params.toString();
    return this.request(`/leaderboard${queryString ? '?' + queryString : ''}`);
  }

  // ===========================================
  // USER MANAGEMENT API
  // ===========================================

  async getUserRole(userId) {
    return this.request(`/users/${userId}/role`);
  }

  async setUserRole(roleData) {
    return this.request('/users/role', {
      method: 'POST',
      body: roleData,
    });
  }

  // ===========================================
  // SETUP AND MAINTENANCE
  // ===========================================

  async setupViews() {
    return this.request('/setup-views', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Named exports for convenience
export const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getQuizzes,
  getQuiz,
  createQuiz,
  submitQuizResponse,
  getStudentResponses,
  getStreak,
  getDailyActivity,
  getQuizHistory,
  recordQuizCompletion,
  getLeaderboard,
  getUserRole,
  setUserRole,
  setupViews,
} = apiClient;
