//QuizHistory.jsx - Add this as a separate component
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Target, Search, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import {
  getCourseName,
  getQuizTypeLabel,
  formatDate,
  filterByDateRange,
  sortItems,
} from "../utility/historyConstants";

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

  const openDetailModal = (item) => {
    setShowDetailModal(true);
    setDetailModalData({ ...item, type: "quiz" });
    setLoadingDetails(false);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailModalData(null);
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
              <p className="text-gray-600">No quizzes found with current filters</p>
            </div>
          ) : (
            Object.entries(groupedQuizzes).map(([courseName, lessons]) => (
              <motion.div
                key={courseName}
                className="bg-white rounded-lg border border-[#6B708D] overflow-hidden"
              >
                <div className="bg-[#F9F8FE] px-6 py-4 border-b border-[#6B708D]">
                  <h3 className="text-xl font-semibold text-[#4C5173]">{courseName}</h3>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {quizzes.map((quiz, index) => (
                                <motion.div
                                  key={quiz.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">
                                      {quiz.score}/{quiz.total_questions}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                      quiz.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {quiz.percentage >= 60 ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                  <div className="mb-3">
                                    <div className="text-lg font-semibold text-[#4C5173]">
                                      {quiz.percentage}%
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar size={12} />
                                      {formatDate(quiz.completed_at)}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <motion.button
                                      onClick={() => openDetailModal(quiz)}
                                      className="flex-1 px-3 py-1 bg-[#4C5173] text-white text-xs rounded hover:bg-[#3a3f5c]"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Details
                                    </motion.button>
                                    <motion.button
                                      onClick={() =>
                                        setShowFeedback(
                                          showFeedback === `quiz-${quiz.id}` ? null : `quiz-${quiz.id}`
                                        )
                                      }
                                      className="px-3 py-1 border border-[#4C5173] text-[#4C5173] text-xs rounded hover:bg-gray-50"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Feedback
                                    </motion.button>
                                  </div>
                                  <AnimatePresence>
                                    {showFeedback === `quiz-${quiz.id}` && (
                                      <motion.div 
                                        className="mt-3 p-3 bg-gray-50 rounded border text-xs"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <div className="mb-2">
                                          <p className="font-medium mb-2">Was this quiz helpful?</p>
                                          <div className="flex gap-2">
                                            <motion.button
                                              onClick={() => handleFeedback(quiz.id, "quiz", true, "")}
                                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded"
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                            >
                                              <ThumbsUp size={12} />
                                              Yes
                                            </motion.button>
                                            <motion.button
                                              onClick={() => handleFeedback(quiz.id, "quiz", false, "")}
                                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded"
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
                                                handleFeedback(quiz.id, "quiz", null, e.target.value);
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

      {/* Enhanced Modal */}
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
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
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
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Quiz Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Course:</span>
                        <span className="ml-2 font-medium">{getCourseName(detailModalData.course_id)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Lesson:</span>
                        <span className="ml-2 font-medium">Lesson {detailModalData.lesson_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quiz Type:</span>
                        <span className="ml-2 font-medium">{getQuizTypeLabel(detailModalData.quiz_type)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 font-medium ${
                          detailModalData.percentage >= 60 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {detailModalData.percentage >= 60 ? '✅ Passed' : '❌ Failed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-medium">{formatDate(detailModalData.completed_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Correct Answers:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {detailModalData.score} out of {detailModalData.total_questions}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Performance Analysis</p>
                        <p className="text-sm text-blue-700">
                          {detailModalData.percentage >= 90 ? 'Excellent work! You have mastered this quiz.' :
                           detailModalData.percentage >= 75 ? 'Good job! You have a solid understanding.' :
                           detailModalData.percentage >= 60 ? 'You passed, but there is room for improvement.' :
                           'Keep practicing. Review the lesson materials and try again.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Detailed question-by-question analysis is not available for quizzes. 
                      Only overall scores are recorded. To see which questions you got right or wrong, 
                      you'll need to retake the quiz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <motion.button
                  onClick={closeDetailModal}
                  className="px-6 py-2 bg-[#4C5173] text-white font-semibold rounded-lg hover:bg-[#3a3f5c] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizHistory;