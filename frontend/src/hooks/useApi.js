import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api';

// Custom hook for subjects data
export function useSubjects(classFilter = null) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSubjects(classFilter);
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError(err.message);
      // Fallback to empty array if backend is not available
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const createSubject = useCallback(async (subjectData) => {
    try {
      const result = await apiClient.createSubject(subjectData);
      await fetchSubjects(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchSubjects]);

  const updateSubject = useCallback(async (id, subjectData) => {
    try {
      const result = await apiClient.updateSubject(id, subjectData);
      await fetchSubjects(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchSubjects]);

  const deleteSubject = useCallback(async (id, deletedBy) => {
    try {
      const result = await apiClient.deleteSubject(id, deletedBy);
      await fetchSubjects(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}

// Custom hook for quizzes data
export function useQuizzes(filters = {}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subjectId, createdBy } = filters;

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getQuizzes({ subjectId, createdBy });
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.message);
      // Fallback to empty array if backend is not available
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, createdBy]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const createQuiz = useCallback(async (quizData) => {
    try {
      const result = await apiClient.createQuiz(quizData);
      await fetchQuizzes(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchQuizzes]);

  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    createQuiz,
  };
}

// Custom hook for a single quiz with questions
export function useQuiz(quizId, includeAnswers = false) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getQuiz(quizId, includeAnswers);
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [quizId, includeAnswers]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    loading,
    error,
    fetchQuiz,
  };
}

// Custom hook for quiz responses and submissions
export function useQuizResponses(studentId) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResponses = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getStudentResponses(studentId);
      setResponses(data.responses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const submitResponse = useCallback(async (responseData) => {
    try {
      const result = await apiClient.submitQuizResponse(responseData);
      await fetchResponses(); // Refresh responses
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchResponses]);

  return {
    responses,
    loading,
    error,
    fetchResponses,
    submitResponse,
  };
}

// Custom hook for daily activity and progress
export function useDailyActivity(userId, date = null) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDailyActivity(userId, date);
      setActivity(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, date]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    fetchActivity,
  };
}

// Custom hook for leaderboard data
export function useLeaderboard(filters = {}) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subjectId, timeframe } = filters;

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getLeaderboard({ subjectId, timeframe });
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId, timeframe]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
  };
}

// Custom hook for user role management
export function useUserRole(userId) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserRole = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUserRole(userId);
      setUserRole(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const setRole = useCallback(async (roleData) => {
    try {
      const result = await apiClient.setUserRole(roleData);
      await fetchUserRole(); // Refresh user data
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchUserRole]);

  return {
    userRole,
    loading,
    error,
    fetchUserRole,
    setRole,
  };
}

// Custom hook for student progress data
export function useStudentProgress(studentId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getStudentProgress(studentId);
      setProgress(data);
    } catch (err) {
      console.error('Failed to fetch student progress:', err);
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
  };
}

// Custom hook for school progress data
export function useSchoolProgress(schoolId) {
  const [schoolProgress, setSchoolProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchoolProgress = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSchoolProgress(schoolId);
      setSchoolProgress(data);
    } catch (err) {
      console.error('Failed to fetch school progress:', err);
      setError(err.message);
      setSchoolProgress(null);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchoolProgress();
  }, [fetchSchoolProgress]);

  return {
    schoolProgress,
    loading,
    error,
    fetchSchoolProgress,
  };
}

// Custom hook for students in a school
export function useStudentsBySchool(schoolId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getStudentsBySchool(schoolId);
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
  };
}
