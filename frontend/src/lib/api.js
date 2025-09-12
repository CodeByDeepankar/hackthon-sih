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
        let detail = '';
        try {
          const data = await response.json();
            detail = data.error || data.message || JSON.stringify(data).slice(0,200);
        } catch {
          try { detail = (await response.text()).slice(0,200); } catch {}
        }
        if (response.status === 503) {
          throw new Error('Service unavailable: ' + detail);
        }
        if (response.status >= 500) {
          throw new Error('Server error: ' + detail);
        }
        if (response.status === 404) {
          throw new Error('Not found: ' + detail);
        }
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Handle network errors (backend not running)
      if (error.message === 'Failed to fetch' || error.message.includes('fetch') || error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start the backend server at http://localhost:4000');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      throw new Error('Backend health check failed: ' + error.message);
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
  // AI STUDY BUDDY
  // ===========================================
  async askStudyBuddy({ question, mode = 'answer', history = [] }) {
    try {
      return await this.request('/ai/study-buddy', {
        method: 'POST',
        body: { question, mode, history }
      });
    } catch (e) {
      console.error('askStudyBuddy failed', e);
      throw e;
    }
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

  // ===========================================
  // STUDENT PROGRESS API
  // ===========================================

  async getStudentsBySchool(schoolId) {
    return this.request(`/students/school/${schoolId}`);
  }

  async getStudentProgress(studentId, limit = 50) {
    return this.request(`/students/${studentId}/progress?limit=${limit}`);
  }

  async getSchoolProgress(schoolId) {
    return this.request(`/progress/school/${schoolId}`);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Named exports (bind methods so 'this' is preserved if destructured)
export const getSubjects = apiClient.getSubjects.bind(apiClient);
export const createSubject = apiClient.createSubject.bind(apiClient);
export const updateSubject = apiClient.updateSubject.bind(apiClient);
export const deleteSubject = apiClient.deleteSubject.bind(apiClient);
export const getQuizzes = apiClient.getQuizzes.bind(apiClient);
export const getQuiz = apiClient.getQuiz.bind(apiClient);
export const createQuiz = apiClient.createQuiz.bind(apiClient);
export const submitQuizResponse = apiClient.submitQuizResponse.bind(apiClient);
export const getStudentResponses = apiClient.getStudentResponses.bind(apiClient);
export const getStreak = apiClient.getStreak.bind(apiClient);
export const getDailyActivity = apiClient.getDailyActivity.bind(apiClient);
export const getQuizHistory = apiClient.getQuizHistory.bind(apiClient);
export const recordQuizCompletion = apiClient.recordQuizCompletion.bind(apiClient);
export const getLeaderboard = apiClient.getLeaderboard.bind(apiClient);
export const askStudyBuddy = apiClient.askStudyBuddy.bind(apiClient);
export const getUserRole = apiClient.getUserRole.bind(apiClient);
export const setUserRole = apiClient.setUserRole.bind(apiClient);
export const setupViews = apiClient.setupViews.bind(apiClient);
export const getStudentsBySchool = apiClient.getStudentsBySchool.bind(apiClient);
export const getStudentProgress = apiClient.getStudentProgress.bind(apiClient);
export const getSchoolProgress = apiClient.getSchoolProgress.bind(apiClient);
