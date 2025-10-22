// QuizPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import CourseNavbar from './courseNavbar';
import { useUser } from '../context/UserContext';
import QuizQuestionCard from '../components/QuizQuestionCard';
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

const QUIZ_TIME_LIMIT = 300; // 5 minutes in seconds for all quizzes

const QuizPage = () => {
  const { courseName, courseId, lessonId, quizType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // Get data passed from LessonList
  const { quizData, formattedTitle } = location.state || {};

  // Quiz states
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining, quizCompleted]);

  // Fetch quiz data when component mounts
  useEffect(() => {
    if (courseId && lessonId && quizType) {
      fetchQuizData();
    }
  }, [courseId, lessonId, quizType]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${baseURL}/quiz/${courseId}/${lessonId}/${quizType}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }

      const data = await response.json();

      // Override time limit to always be 5 minutes
      const quizWithFixedTime = {
        ...data.quiz,
        time_limit: QUIZ_TIME_LIMIT
      };

      setQuiz(quizWithFixedTime); // ✅ Only set once with fixed time
      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(null));
      setTimeRemaining(QUIZ_TIME_LIMIT); // Always 5 minutes
      setError(null);
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizStartTime(Date.now());
  };

  const handleAnswerChange = (answerData) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerData;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitCurrentQuestion = () => {
    console.log('handleSubmitCurrentQuestion called'); // Debug log
    console.log('Current question index:', currentQuestionIndex);
    console.log('Current answer:', userAnswers[currentQuestionIndex]);

    // Check if current question has an answer
    const currentAnswer = userAnswers[currentQuestionIndex];
    if (!currentAnswer || currentAnswer.toString().trim() === '') {
      console.log('No answer provided, not submitting'); // Debug log
      return;
    }

    // If this is the last question, submit the entire quiz
    if (currentQuestionIndex === questions.length - 1) {
      console.log('Last question - submitting quiz'); // Debug log
      submitQuiz();
    } else {
      console.log('Moving to next question'); // Debug log
      handleNextQuestion();
    }
  };

  const handleTimeUp = () => {
    // Auto-submit quiz when time runs out
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Calculate actual time taken in seconds
      const actualTimeTaken = quizStartTime
        ? Math.floor((Date.now() - quizStartTime) / 1000)
        : QUIZ_TIME_LIMIT - Math.max(0, timeRemaining);

      // Cap the time at the quiz limit
      const timeTaken = Math.min(actualTimeTaken, QUIZ_TIME_LIMIT);

      console.log('=== QUIZ SUBMISSION DEBUG (Frontend) ===');
      console.log('Quiz Type:', quiz.quiz_type);
      console.log('Total Questions:', questions.length);
      console.log('Raw User Answers:', userAnswers);

      // Format answers based on quiz type - FIXED VERSION
      const formattedAnswers = userAnswers.map((answer, index) => {
        const question = questions[index];

        console.log(`\nFormatting Question ${index + 1}:`);
        console.log('  Question Type:', question.type);
        console.log('  Raw Answer:', answer);
        console.log('  Correct Answer:', question.correct_answer);

        // Handle image-based multiple choice questions
        if (question && (question.type === 'multiple_choice' || question.type === 'image_mcq')) {
          // If answer is already a string (image path), return it directly
          if (typeof answer === 'string') {
            console.log('  ✅ Returning string answer:', answer);
            return answer;
          }

          // If answer is an object with image property
          if (typeof answer === 'object' && answer !== null) {
            const extracted = answer.image || answer.text || answer;
            console.log('  ✅ Extracted from object:', extracted);
            return extracted;
          }

          console.log('  ⚠️ Answer format unexpected:', answer);
          return answer;
        }

        // Handle typing questions
        else if (question && question.type === 'typing') {
          const stringAnswer = typeof answer === 'string' ? answer : String(answer || '');
          console.log('  ✅ Typing answer:', stringAnswer);
          return stringAnswer;
        }

        // Handle drag and drop questions
        else if (question && question.type === 'drag_drop') {
          console.log('  ✅ Drag-drop answer:', answer);
          return answer;
        }

        // Fallback
        console.log('  ⚠️ Using fallback for answer:', answer);
        return answer;
      });

      console.log('\n📤 Formatted Answers Being Sent:', formattedAnswers);
      console.log('📋 Question IDs:', questions.map(q => q.question_id));

      const submissionData = {
        answers: formattedAnswers,
        time_taken: timeTaken,
        question_ids: questions.map(q => q.question_id)
      };

      console.log('\n🚀 Final Submission Data:', JSON.stringify(submissionData, null, 2));
      console.log('=========================================\n');

      const response = await fetch(
        `${baseURL}/quiz/submit/${quiz.quiz_id}/${user.user_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Quiz submission failed:', response.status, errorText);
        throw new Error(`Failed to submit quiz: ${response.status} - ${errorText}`);
      }

      const results = await response.json();
      console.log('✅ Quiz Results:', results);

      setQuizResults(results);
      setQuizCompleted(true);

    } catch (error) {
      console.error('💥 Error submitting quiz:', error);
      setError(`Failed to submit quiz: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredQuestionsCount = () => {
    return userAnswers.filter(answer => answer !== null && answer !== undefined).length;
  };

  const canSubmitQuiz = () => {
    return getAnsweredQuestionsCount() === questions.length;
  };

  const goBackToLessonList = () => {
    navigate(`/courses/${courseName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C5173] mb-4"></div>
          <p className="text-lg font-semibold text-[#4C5173]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Load Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goBackToLessonList}
            className="px-6 py-3 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <p className="text-xl text-gray-800">No quiz data available</p>
          <button
            onClick={goBackToLessonList}
            className="mt-4 px-6 py-3 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] text-black flex flex-col">
      <CourseNavbar courseTitle={formattedTitle || courseName} />

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile by default, can be toggled */}
        <div className="hidden lg:flex lg:w-[320px] bg-[#BFC4D7] border-r border-gray-200 shadow-lg flex-col">
          <div className="p-6 border-b border-gray-100">
            <button
              onClick={goBackToLessonList}
              className="flex items-center gap-2 text-[#4C5173] hover:text-[#3a3f5c] transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              <span className="font-semibold">Back to Lessons</span>
            </button>

            <div className="flex items-center gap-4">
              <img
                src={placeholderimg}
                alt="Quiz"
                className="w-16 h-16 rounded-full border-2 border-[#4C5173] shadow-sm"
              />
              <div>
                <h2 className="text-xl font-bold text-[#4C5173]">{quiz.title}</h2>
                <p className="text-sm text-gray-600">{quiz.quiz_type.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Quiz Progress */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold text-[#4C5173] mb-3">Quiz Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions Answered</span>
                  <span>{getAnsweredQuestionsCount()}/{questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#B6C44D] to-[#4C5173] h-2 rounded-full transition-all"
                    style={{
                      width: `${(getAnsweredQuestionsCount() / questions.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timer */}
            {quizStarted && !quizCompleted && timeRemaining !== null && (
              <div className="mb-6 p-4 bg-white/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-[#4C5173]" />
                  <span className="font-semibold text-[#4C5173]">Time Remaining</span>
                </div>
                <div className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-600' : 'text-[#4C5173]'}`}>
                  {formatTime(timeRemaining)}
                </div>
                {timeRemaining <= 60 && (
                  <p className="text-sm text-red-600 mt-1">Hurry up! Time is running out!</p>
                )}
              </div>
            )}

            {/* Question Navigation */}
            {quizStarted && !quizCompleted && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#4C5173] mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${index === currentQuestionIndex
                        ? 'bg-[#4C5173] text-white'
                        : userAnswers[index] !== null && userAnswers[index] !== undefined
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Top Bar - Compact info shown on mobile */}
        <div className="lg:hidden bg-[#BFC4D7] border-b border-gray-200 p-4">
          <button
            onClick={goBackToLessonList}
            className="flex items-center gap-2 text-[#4C5173] hover:text-[#3a3f5c] transition-colors mb-3"
          >
            <ChevronLeft size={18} />
            <span className="font-semibold text-sm">Back to Lessons</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={placeholderimg}
                alt="Quiz"
                className="w-12 h-12 rounded-full border-2 border-[#4C5173] shadow-sm"
              />
              <div>
                <h2 className="text-base font-bold text-[#4C5173]">{quiz.title}</h2>
                <p className="text-xs text-gray-600">{quiz.quiz_type.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            {/* Timer on mobile */}
            {quizStarted && !quizCompleted && timeRemaining !== null && (
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={14} className="text-[#4C5173]" />
                  <span className="text-xs font-semibold text-[#4C5173]">Time</span>
                </div>
                <div className={`text-lg font-bold ${timeRemaining <= 60 ? 'text-red-600' : 'text-[#4C5173]'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-[#4C5173] font-semibold">{getAnsweredQuestionsCount()}/{questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#B6C44D] to-[#4C5173] h-2 rounded-full transition-all"
                style={{
                  width: `${(getAnsweredQuestionsCount() / questions.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 flex flex-col overflow-y-auto">
          <AnimatePresence mode="wait">
            {!quizStarted ? (
              /* Quiz Introduction */
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto w-full"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-[#4C5173] mb-4 md:mb-6 text-center">
                  Ready to Start?
                </h1>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm md:text-base">Quiz Type:</span>
                    <span className="text-[#4C5173] font-bold text-sm md:text-base">{quiz.quiz_type.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm md:text-base">Questions:</span>
                    <span className="text-[#4C5173] font-bold text-sm md:text-base">{quiz.total_questions}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm md:text-base">Time Limit:</span>
                    <span className="text-[#4C5173] font-bold text-sm md:text-base">{formatTime(QUIZ_TIME_LIMIT)}</span>
                  </div>

                  {quiz.difficulty && (
                    <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700 text-sm md:text-base">Difficulty:</span>
                      <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {quiz.difficulty.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={startQuiz}
                    className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#B6C44D] to-[#4C5173] text-white font-bold text-base md:text-lg rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Quiz
                  </button>
                </div>
              </motion.div>
            ) : quizCompleted ? (
              /* Quiz Results */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-[#4C5173] mb-2">
                    Quiz Completed!
                  </h1>
                  <p className="text-gray-600">Great job finishing the quiz!</p>
                </div>

                {quizResults && (
                  <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-[#4C5173]">
                          {quizResults.score}/{quizResults.total_questions}
                        </div>
                        <div className="text-sm text-gray-600">Correct Answers</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-[#4C5173]">
                          {quizResults.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-[#4C5173]">
                        {quizResults.time_taken ? formatTime(quizResults.time_taken) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Time Taken</div>
                    </div>

                    <div className={`p-4 rounded-lg text-center font-bold text-lg ${quizResults.passed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {quizResults.passed ? '🎉 PASSED!' : '❌ Try Again'}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={goBackToLessonList}
                    className="px-6 py-3 bg-[#4C5173] text-white font-semibold rounded-lg hover:bg-[#3a3f5c] transition-colors"
                  >
                    Back to Lessons
                  </button>

                  {quizResults && !quizResults.passed && (
                    <button
                      onClick={() => {
                        setQuizStarted(false);
                        setQuizCompleted(false);
                        setQuizResults(null);
                        setCurrentQuestionIndex(0);
                        setUserAnswers(new Array(questions.length).fill(null));
                        setTimeRemaining(QUIZ_TIME_LIMIT);
                        setQuizStartTime(null);
                      }}
                      className="px-6 py-3 bg-[#B6C44D] text-black font-semibold rounded-lg hover:bg-[#a5b83d] transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Quiz Questions */
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col"
              >
                {/* Question Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#4C5173] mb-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#B6C44D] to-[#4C5173] h-2 rounded-full transition-all"
                      style={{
                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 mb-6">
                  <QuizQuestionCard
                    question={questions[currentQuestionIndex]}
                    userAnswer={userAnswers[currentQuestionIndex]}
                    onAnswerChange={handleAnswerChange}
                    quizType={quiz.quiz_type}
                    onSubmit={handleSubmitCurrentQuestion}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all ${currentQuestionIndex === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] hover:scale-105 shadow-lg"
                      }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-4">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={submitQuiz}
                        disabled={!canSubmitQuiz() || isSubmitting}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${canSubmitQuiz() && !isSubmitting
                          ? "bg-gradient-to-r from-[#B6C44D] to-[#A5B83D] text-black hover:from-[#a5b83d] hover:to-[#94A535] hover:scale-105 shadow-lg"
                          : "bg-gray-400 text-white cursor-not-allowed"
                          }`}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Quiz"}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] hover:scale-105 shadow-lg transition-all"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit Warning */}
                {currentQuestionIndex === questions.length - 1 && !canSubmitQuiz() && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                    <p className="text-yellow-800 text-sm">
                      Please answer all questions before submitting the quiz.
                      ({getAnsweredQuestionsCount()}/{questions.length} answered)
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;