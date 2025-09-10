"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useSubjects, useQuizzes, useUserRole, useSchoolProgress, useStudentsBySchool } from "@/hooks/useApi";
import LanguageToggle from "@/components/LanguageToggle";
import OnlineBadge from "@/components/OnlineBadge";

const TeacherDashboard = () => {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState('subjects'); // subjects, quizzes, create-subject, create-quiz, quiz-management, student-progress
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  // API hooks
  const { subjects, loading: subjectsLoading, createSubject, deleteSubject } = useSubjects();
  const { quizzes, loading: quizzesLoading, createQuiz } = useQuizzes({ 
    createdBy: user?.id 
  });
  const { userRole, loading: roleLoading } = useUserRole(user?.id);
  const { schoolProgress, loading: progressLoading } = useSchoolProgress(userRole?.schoolId);
  const { students, loading: studentsLoading } = useStudentsBySchool(userRole?.schoolId);

  // Check if user is authorized
  if (!roleLoading && userRole?.role !== 'teacher' && userRole?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You need teacher or admin privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const renderSubjectsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Manage Subjects
        </h2>
        <button
          onClick={() => setCurrentView('create-subject')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Subject
        </button>
      </div>

      {/* Subjects List */}
      {subjectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectManagementCard
              key={subject.id}
              subject={subject}
              onEdit={() => {
                setSelectedSubject(subject);
                setCurrentView('edit-subject');
              }}
              onDelete={async () => {
                if (confirm('Are you sure you want to delete this subject?')) {
                  await deleteSubject(subject.id, user.id);
                }
              }}
              onViewQuizzes={() => {
                setSelectedSubject(subject);
                setCurrentView('quizzes');
              }}
            />
          ))}
        </div>
      )}

      {!subjectsLoading && subjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            No subjects created yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first subject to get started!
          </p>
          <button
            onClick={() => setCurrentView('create-subject')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Subject
          </button>
        </div>
      )}
    </div>
  );

  const renderQuizzesView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setCurrentView('subjects')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Subjects</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {selectedSubject?.name} - Quizzes
          </h2>
        </div>
        <button
          onClick={() => setCurrentView('create-quiz')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Quiz
        </button>
      </div>

      {/* Quizzes List */}
      {quizzesLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes
            .filter(quiz => quiz.subjectId === selectedSubject?.id)
            .map((quiz) => (
              <QuizManagementCard key={quiz.id} quiz={quiz} />
            ))
          }
        </div>
      )}
    </div>
  );

  const renderQuizManagementView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Quiz Management
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('create-subject')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            New Subject
          </button>
          <button
            onClick={() => {
              if (subjects.length > 0) {
                setSelectedSubject(subjects[0]);
                setCurrentView('create-quiz');
              } else {
                alert('Please create a subject first');
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            New Quiz
          </button>
        </div>
      </div>

      {/* Quiz Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subjects</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Quizzes by Subject */}
      <div className="space-y-6">
        {subjects.map((subject) => {
          const subjectQuizzes = quizzes.filter(quiz => quiz.subjectId === subject.id);
          
          return (
            <div key={subject.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {subject.name} - Class {subject.class}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subjectQuizzes.length} quiz{subjectQuizzes.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubject(subject);
                      setCurrentView('create-quiz');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Add Quiz
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {subjectQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 dark:text-gray-400">No quizzes created yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectQuizzes.map((quiz) => (
                      <QuizManagementCard 
                        key={quiz.id} 
                        quiz={quiz} 
                        onView={() => {
                          setSelectedQuiz(quiz);
                          // Could add a detailed quiz view
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No subjects created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first subject to start adding quizzes!
            </p>
            <button
              onClick={() => setCurrentView('create-subject')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentProgressView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Student Progress Overview
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          School: {userRole?.schoolId || 'Not set'}
        </div>
      </div>

      {/* School Statistics */}
      {progressLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : schoolProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{schoolProgress.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{schoolProgress.studentsWithActivity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">School Average</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(schoolProgress.schoolAverage)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {schoolProgress.totalStudents > 0 
                    ? Math.round((schoolProgress.studentsWithActivity / schoolProgress.totalStudents) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Progress Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Individual Student Progress
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {progressLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : schoolProgress && schoolProgress.students.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quizzes Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Best Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schoolProgress.students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.name || 'Unnamed Student'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {student.studentId.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.class || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.totalQuizzes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.averageScore.toFixed(1)}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(student.averageScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.bestScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.lastActivity 
                        ? new Date(student.lastActivity).toLocaleDateString()
                        : 'No activity'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500 dark:text-gray-400">
                No student progress data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Teacher Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <OnlineBadge />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('subjects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView.startsWith('subject') || currentView === 'quizzes' || currentView === 'create-quiz'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Subjects & Quizzes
            </button>
            <button
              onClick={() => setCurrentView('quiz-management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'quiz-management'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Quiz Management
            </button>
            <button
              onClick={() => setCurrentView('student-progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'student-progress'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Student Progress
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'subjects' && renderSubjectsView()}
        {currentView === 'quizzes' && renderQuizzesView()}
        {currentView === 'quiz-management' && renderQuizManagementView()}
        {currentView === 'student-progress' && renderStudentProgressView()}
        {currentView === 'create-subject' && (
          <CreateSubjectForm
            onCancel={() => setCurrentView('subjects')}
            onSuccess={() => setCurrentView('subjects')}
            createSubject={createSubject}
            userId={user?.id}
          />
        )}
        {currentView === 'create-quiz' && (
          <CreateQuizForm
            subject={selectedSubject}
            onCancel={() => setCurrentView('quizzes')}
            onSuccess={() => setCurrentView('quizzes')}
            createQuiz={createQuiz}
            userId={user?.id}
          />
        )}
      </main>
    </div>
  );
};

// Subject Management Card Component
const SubjectManagementCard = ({ subject, onEdit, onDelete, onViewQuizzes }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
            {subject.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Class {subject.class}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 dark:text-red-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {subject.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {subject.description}
        </p>
      )}
      
      <button
        onClick={onViewQuizzes}
        className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        View Quizzes
      </button>
    </div>
  );
};

// Quiz Management Card Component
const QuizManagementCard = ({ quiz, onView }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {quiz.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty || 'medium'}
            </span>
          </div>
          {quiz.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {quiz.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Time: {Math.floor((quiz.timeLimit || 300) / 60)}m</span>
            <span>Questions: {quiz.questionsCount || 0}</span>
            <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button className="text-green-600 hover:text-green-800 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button className="text-red-600 hover:text-red-800 dark:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Subject Form Component
const CreateSubjectForm = ({ onCancel, onSuccess, createSubject, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.class) return;

    console.log('Creating subject with data:', { ...formData, createdBy: userId });
    setIsSubmitting(true);
    try {
      const result = await createSubject({
        ...formData,
        createdBy: userId
      });
      console.log('Subject created successfully:', result);
      onSuccess();
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Error creating subject: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New Subject
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Mathematics, Science, English"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class *
            </label>
            <input
              type="text"
              required
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 10, 11, 12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the subject..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.class}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Quiz Form Component  
const CreateQuizForm = ({ subject, onCancel, onSuccess, createQuiz, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeLimit: 300,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.correctAnswer) return;
    
    const filteredOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('Please provide at least 2 options for the question.');
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, {
        ...currentQuestion,
        options: filteredOptions
      }]
    });

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.questions.length === 0) return;

    setIsSubmitting(true);
    try {
      await createQuiz({
        ...formData,
        subjectId: subject.id,
        createdBy: userId
      });
      onSuccess();
    } catch (error) {
      alert('Error creating quiz: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create Quiz for {subject?.name}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Chapter 1 Quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 300 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="60"
                max="3600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the quiz..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Questions Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Questions ({formData.questions.length})
            </h3>

            {/* Add Question Form */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-4">Add New Question</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">Select correct answer</option>
                    {currentQuestion.options.filter(opt => opt.trim()).map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={!currentQuestion.text || !currentQuestion.correctAnswer}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {formData.questions.length > 0 && (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        Question {index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 mb-2">{question.text}</p>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Options:</strong> {question.options.join(', ')}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <strong>Correct:</strong> {question.correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || formData.questions.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <>
      <SignedIn>
        <TeacherDashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
