//QuizHistory.jsx - Enhanced with Question-Level Details
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Target, Search, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import {
  getCourseName,
  getQuizTypeLabel,
  formatDate,
  filterByDateRange,
  sortItems,
} from "../../utility/historyConstants";
import API_URL from '../../config/api';

const QuizHistory = ({
  data,
  filters,
  showFeedback,
  setShowFeedback,
  showDetailModal,
  setShowDetailModal,
  detailModalData,
  setDetailModalData,
  loadingDetails,
  setLoadingDetails,
  handleFeedback,
}) => {
  // State for quiz questions and responses
  const [detailQuestions, setDetailQuestions] = React.useState([]);
  const [detailResponses, setDetailResponses] = React.useState([]);

  const filteredQuizzes = (() => {
    let filtered = [...data];
    if (filters.course !== "all") {
      filtered = filtered.filter((q) => q.course_id === parseInt(filters.course));
    }
    if (filters.quizType !== "all") {
      filtered = filtered.filter((q) => q.quiz_type === filters.quizType);
    }
    filtered = filterByDateRange(filtered, filters.dateRange, "completed_at");
    return sortItems(filtered, filters.sortBy, "percentage", "completed_at");
  })();

  const groupedQuizzes = (() => {
    const grouped = {};
    filteredQuizzes.forEach((quiz) => {
      const courseName = getCourseName(quiz.course_id);
      const lessonKey = `Lesson ${quiz.lesson_id}`;
      if (!grouped[courseName]) grouped[courseName] = {};
      if (!grouped[courseName][lessonKey]) grouped[courseName][lessonKey] = {};
      const quizTypeLabel = getQuizTypeLabel(quiz.quiz_type);
      if (!grouped[courseName][lessonKey][quizTypeLabel]) {
        grouped[courseName][lessonKey][quizTypeLabel] = [];
      }
      grouped[courseName][lessonKey][quizTypeLabel].push(quiz);
    });
    return grouped;
  })();

  // Open detail modal with question-level data
  const openDetailModal = async (item) => {
    setShowDetailModal(true);
    setDetailModalData({ ...item, type: "quiz" });
    setLoadingDetails(true);
    setDetailQuestions([]);
    setDetailResponses([]);

    try {
      // Fetch questions and responses for this quiz attempt
      const [questionsRes, responsesRes] = await Promise.all([
        fetch(`${API_URL}/quiz/questions/${item.result_id}`),
        fetch(`${API_URL}/quiz/responses/${item.result_id}`)
      ]);

      if (questionsRes.ok) {
        const questions = await questionsRes.json();
        setDetailQuestions(questions.questions || []);
      } else {
        console.error('Failed to fetch quiz questions:', await questionsRes.text());
      }

      if (responsesRes.ok) {
        const responses = await responsesRes.json();
        setDetailResponses(responses.responses || []);
      } else {
        console.error('Failed to fetch quiz responses:', await responsesRes.text());
      }

    } catch (err) {
      console.error('Error loading quiz details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailModalData(null);
    setDetailQuestions([]);
    setDetailResponses([]);
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <motion.div
        key="quizzes"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <div className="space-y-6">
          {Object.keys(groupedQuizzes).length === 0 ? (
            <div className="bg-white rounded-lg border border-[#6B708D] p-8 text-center">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xs md:text-sm text-gray-600">No quizzes found with current filters</p>
            </div>
          ) : (
            Object.entries(groupedQuizzes).map(([courseName, lessons]) => (
              <motion.div
                key={courseName}
                className="bg-white rounded-lg border border-[#6B708D] overflow-hidden"
              >
                <div className="bg-[#F9F8FE] px-4 md:px-6 py-3 md:py-4 border-b border-[#6B708D]">
                  <h3 className="text-lg md:text-xl font-semibold text-[#4C5173]">{courseName}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(lessons).map(([lessonName, quizTypes]) => (
                    <div key={lessonName} className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">{lessonName}</h4>
                      <div className="space-y-4">
                        {Object.entries(quizTypes).map(([quizTypeName, quizzes]) => (
                          <div key={quizTypeName}>
                            <div className="flex items-center gap-2 mb-3">
                              <Target size={16} className="text-[#4C5173]" />
                              <h5 className="font-medium text-[#4C5173]">{quizTypeName}</h5>
                              <span className="text-sm text-gray-500">({quizzes.length} attempts)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                              {quizzes.map((quiz, index) => (
                                <motion.div
                                  key={quiz.result_id}
                                  className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs md:text-sm text-gray-600">
                                      {quiz.score}/{quiz.total_questions}
                                    </span>
                                    <span className={`px-2 py-0.5 md:py-1 rounded text-xs font-semibold ${quiz.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                      {quiz.percentage >= 60 ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>

                                  <div className="mb-3">
                                    <div className="text-lg md:text-xl font-semibold text-[#4C5173]">
                                      {quiz.percentage}%
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar size={12} />
                                      <span className="truncate">{formatDate(quiz.completed_at)}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <motion.button
                                      onClick={() => openDetailModal(quiz)}
                                      className="flex-1 px-3 py-1.5 bg-[#4C5173] text-white text-xs md:text-sm rounded hover:bg-[#3a3f5c] transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      View Details
                                    </motion.button>
                                    <motion.button
                                      onClick={() =>
                                        setShowFeedback(
                                          showFeedback === `quiz-${quiz.result_id}` ? null : `quiz-${quiz.result_id}`
                                        )
                                      }
                                      className="flex-1 px-3 py-1.5 border border-[#4C5173] text-[#4C5173] text-xs md:text-sm rounded hover:bg-gray-50 transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Feedback
                                    </motion.button>
                                  </div>

                                  <AnimatePresence>
                                    {showFeedback === `quiz-${quiz.result_id}` && (
                                      <motion.div
                                        className="mt-3 p-2 md:p-3 bg-gray-50 rounded border text-xs"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <div className="mb-2">
                                          <p className="font-medium mb-2">Was this quiz helpful?</p>
                                          <div className="flex gap-2">
                                            <motion.button
                                              onClick={() => handleFeedback(quiz.result_id, "quiz", true, "")}
                                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                            >
                                              <ThumbsUp size={12} />
                                              Yes
                                            </motion.button>
                                            <motion.button
                                              onClick={() => handleFeedback(quiz.result_id, "quiz", false, "")}
                                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                            >
                                              <ThumbsDown size={12} />
                                              No
                                            </motion.button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">
                                            What was difficult?
                                          </label>
                                          <textarea
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs resize-none"
                                            rows="2"
                                            placeholder="Optional feedback..."
                                            onBlur={(e) => {
                                              if (e.target.value.trim()) {
                                                handleFeedback(quiz.result_id, "quiz", null, e.target.value);
                                              }
                                            }}
                                          />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Modal with Question Details */}
      <AnimatePresence>
        {showDetailModal && detailModalData && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div
              className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white p-6 relative">
                <motion.button
                  onClick={closeDetailModal}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Quiz Results</h2>
                    <p className="text-lg opacity-90">{getQuizTypeLabel(detailModalData.quiz_type)}</p>
                  </div>
                </div>

                {/* Score Summary */}
                {!loadingDetails && (
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-lg p-3 text-center flex-1">
                      <div className="text-2xl font-bold">
                        {detailModalData.score}/{detailModalData.total_questions}
                      </div>
                      <div className="text-sm opacity-80">Score</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center flex-1">
                      <div className="text-2xl font-bold">{detailModalData.percentage}%</div>
                      <div className="text-sm opacity-80">Percentage</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center flex-1">
                      <div className="text-lg font-bold">{formatTime(detailModalData.time_taken)}</div>
                      <div className="text-sm opacity-80">Time Taken</div>
                    </div>

                    {detailResponses.length > 0 && (
                      <div className="bg-white/20 rounded-lg p-3 text-center flex-1">
                        <div className="text-2xl font-bold text-green-300">
                          {detailResponses.filter(r => r.is_correct).length}
                        </div>
                        <div className="text-sm opacity-80">Correct</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-[#4C5173] border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-lg text-gray-600">Loading quiz details...</p>
                  </div>
                ) : detailQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {detailQuestions.map((question, index) => {
                      const userResponse = detailResponses.find(r => r.question_id === question.question_id);

                      return (
                        <motion.div
                          key={question.question_id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#4C5173] text-white px-3 py-1 rounded-full text-sm font-bold">
                                  Q{index + 1}
                                </span>
                                {userResponse && (
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${userResponse.is_correct
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {userResponse.is_correct ? (
                                      <>
                                        <CheckCircle size={16} />
                                        Correct
                                      </>
                                    ) : (
                                      <>
                                        <XCircle size={16} />
                                        Incorrect
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                                {question.question_text}
                              </p>
                            </div>
                          </div>

                          {/* Question Image (if exists) */}
                          {question.media_url && (
                            <div className="mb-4 flex justify-center">
                              <img
                                src={question.media_url}
                                alt="Question illustration"
                                className="max-w-md max-h-64 object-contain rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {/* Answer Options */}
                          {question.options && question.options.length > 0 && (
                            <div className="space-y-3 mt-4">
                              {question.options.map((option, optionIndex) => {
                                const isCorrectAnswer = option === question.correct_answer ||
                                  (typeof option === 'object' && option.image === question.correct_answer);
                                const isUserChoice = userResponse && (
                                  option === userResponse.selected_answer ||
                                  (typeof option === 'object' && option.image === userResponse.selected_answer)
                                );

                                return (
                                  <motion.div
                                    key={optionIndex}
                                    className={`p-4 rounded-lg border-2 transition-all ${isCorrectAnswer
                                      ? 'bg-green-50 border-green-300'
                                      : isUserChoice
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-white border-gray-200'
                                      }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + optionIndex * 0.05 }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                                          {String.fromCharCode(65 + optionIndex)}
                                        </span>

                                        {/* Option content - handle both text and image */}
                                        {typeof option === 'object' && option.image ? (
                                          <img
                                            src={option.image}
                                            alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                            className="w-20 h-20 object-contain rounded border"
                                          />
                                        ) : (
                                          <span className={`text-gray-800 ${isCorrectAnswer ? 'font-semibold' : ''}`}>
                                            {typeof option === 'object' ? (option.text || option.label || 'Option') : option}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {isCorrectAnswer && (
                                          <motion.div
                                            className="flex items-center gap-1 text-green-700 font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                          >
                                            <CheckCircle className="w-5 h-5" />
                                            Correct
                                          </motion.div>
                                        )}

                                        {isUserChoice && !isCorrectAnswer && (
                                          <motion.div
                                            className="flex items-center gap-1 text-red-700 font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                          >
                                            <XCircle className="w-5 h-5" />
                                            Your Answer
                                          </motion.div>
                                        )}

                                        {isUserChoice && isCorrectAnswer && (
                                          <motion.div
                                            className="flex items-center gap-1 text-green-700 font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                          >
                                            <CheckCircle className="w-5 h-5" />
                                            Your Correct Answer
                                          </motion.div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}

                          {/* Answer Status */}
                          {!userResponse?.selected_answer && (
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                              <span className="text-gray-500 text-sm">No answer was recorded for this question</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 mb-2">No detailed information available</p>
                    <p className="text-sm text-gray-500">Question-level tracking was not available for this quiz attempt</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!loadingDetails && detailQuestions.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total Questions: {detailQuestions.length} |
                      Correct: {detailResponses.filter(r => r.is_correct).length} |
                      Incorrect: {detailResponses.filter(r => !r.is_correct).length}
                    </div>
                    <motion.button
                      onClick={closeDetailModal}
                      className="px-6 py-2 bg-[#4C5173] text-white font-semibold rounded-lg hover:bg-[#3a3f5c] transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizHistory;