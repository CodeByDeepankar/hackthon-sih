import { useState, useEffect, useCallback } from 'react';
import { useQuiz, useQuizResponses } from '@/hooks/useApi';

const QuizAttempt = ({ quiz, onBack, onComplete, userId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz?.timeLimit || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const { quiz: fullQuiz, loading: quizLoading } = useQuiz(quiz?.id, false);
  const { submitResponse } = useQuizResponses(userId);

  // Timer countdown
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const startTime = quiz?.timeLimit || 300;
      const timeSpent = startTime - timeRemaining;
      
      const result = await submitResponse({
        quizId: quiz.id,
        studentId: userId,
        answers,
        timeSpent
      });

      onComplete(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quiz, timeRemaining, submitResponse, userId, answers, onComplete]);

  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, handleSubmitQuiz]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(quiz?.timeLimit || 300);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (fullQuiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 30) return 'text-red-600';
    if (timeRemaining <= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fullQuiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
          Quiz not found
        </h3>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Quiz Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Quizzes</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {fullQuiz.title}
            </h1>
            
            {fullQuiz.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {fullQuiz.description}
              </p>
            )}

            {/* Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {fullQuiz.questions?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Questions
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatTime(fullQuiz.timeLimit || 300)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Time Limit
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 capitalize">
                  {fullQuiz.difficulty || 'Medium'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Difficulty
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Instructions:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can navigate between questions using the Next/Previous buttons</li>
                <li>• Make sure to submit your quiz before time runs out</li>
                <li>• Your progress will be saved automatically</li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = fullQuiz.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (fullQuiz.questions?.length || 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {fullQuiz.title}
          </h1>
          
          <div className={`text-lg font-mono font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Question {currentQuestionIndex + 1} of {fullQuiz.questions?.length || 0}
          </span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <span className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex space-x-4">
          {currentQuestionIndex === (fullQuiz.questions?.length || 0) - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
