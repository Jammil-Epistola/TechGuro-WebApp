import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Target, Search, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
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
    setLoadingDetails(true);
    setLoadingDetails(false);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailModalData(null);
  };

  return (
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
                                    className="flex-1 px-3 py-1 bg-[#4C5173] text-white text-xs rounded"
                                  >
                                    Details
                                  </motion.button>
                                  <motion.button
                                    onClick={() =>
                                      setShowFeedback(
                                        showFeedback === `quiz-${quiz.id}` ? null : `quiz-${quiz.id}`
                                      )
                                    }
                                    className="px-3 py-1 border border-[#4C5173] text-[#4C5173] text-xs rounded"
                                  >
                                    Feedback
                                  </motion.button>
                                </div>
                                <AnimatePresence>
                                  {showFeedback === `quiz-${quiz.id}` && (
                                    <motion.div className="mt-3 p-3 bg-gray-50 rounded border text-xs">
                                      <div className="mb-2">
                                        <p className="font-medium mb-2">Was this quiz helpful?</p>
                                        <div className="flex gap-2">
                                          <motion.button
                                            onClick={() => handleFeedback(quiz.id, "quiz", true, "")}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded"
                                          >
                                            <ThumbsUp size={12} />
                                            Yes
                                          </motion.button>
                                          <motion.button
                                            onClick={() => handleFeedback(quiz.id, "quiz", false, "")}
                                            className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded"
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

      {/* Modal */}
      <AnimatePresence>
        {showDetailModal && detailModalData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div className="bg-white rounded-lg max-w-4xl w-full">
              <div className="bg-[#F9F8FE] px-6 py-4 border-b border-[#6B708D] flex justify-between">
                <h3 className="text-xl font-semibold text-[#4C5173]">Quiz Results</h3>
                <motion.button onClick={closeDetailModal} className="text-2xl">
                  ×
                </motion.button>
              </div>
              <div className="p-6">No detailed info implemented yet.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizHistory;
