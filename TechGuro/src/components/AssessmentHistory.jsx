//AssessmentHistory
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react";
import {
  getCourseName,
  formatDate,
  filterByDateRange,
  sortItems,
} from "../utility/historyConstants";
import API_URL from '../config/api';

const AssessmentHistory = ({
  data,
  filters,
  showFeedback,
  setShowFeedback,
  showDetailModal,
  setShowDetailModal,
  detailModalData,
  setDetailModalData,
  detailQuestions,
  setDetailQuestions,
  detailResponses,
  setDetailResponses,
  loadingDetails,
  setLoadingDetails,
  handleFeedback,
}) => {
  const filteredAssessments = (() => {
    let filtered = [...data];
    if (filters.course !== "all") {
      filtered = filtered.filter((a) => a.course_id === parseInt(filters.course));
    }
    filtered = filterByDateRange(filtered, filters.dateRange, "date_taken");
    return sortItems(filtered, filters.sortBy, "score", "date_taken");
  })();

  const openDetailModal = async (item) => {
    setShowDetailModal(true);
    setDetailModalData({ ...item, type: "assessment" });
    setLoadingDetails(true);
    setDetailQuestions([]);
    setDetailResponses([]);
    
    try {
      // Fetch questions and responses
      const [questionsRes, responsesRes] = await Promise.all([
        fetch(`${API_URL}/assessment/questions/${item.course_id}?assessment_type=${item.assessment_type}`),
        fetch(`${API_URL}/assessment/responses/${item.id}`)
      ]);

      if (questionsRes.ok) {
        const questions = await questionsRes.json();
        setDetailQuestions(Array.isArray(questions) ? questions : []);
      } else {
        console.error('Failed to fetch questions:', await questionsRes.text());
      }

      if (responsesRes.ok) {
        const responses = await responsesRes.json();
        setDetailResponses(Array.isArray(responses) ? responses : []);
      } else {
        console.error('Failed to fetch responses:', await responsesRes.text());
      }

    } catch (err) {
      console.error('Error loading details:', err);
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

  // Calculate total questions (assuming standard 20 questions per assessment)
  const getTotalQuestions = (assessment) => {
    // If total exists in the response, use it; otherwise default to 20
    return assessment.total || 20;
  };

  return (
    <motion.div
      key="assessments"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="bg-white rounded-lg border border-[#6B708D] overflow-hidden">
        <div className="bg-[#F9F8FE] px-6 py-4 border-b border-[#6B708D]">
          <h3 className="text-xl font-semibold text-[#4C5173]">Assessment History</h3>
          <p className="text-gray-600">Review your pre and post assessment attempts</p>
        </div>

        {filteredAssessments.length === 0 ? (
          <div className="p-8 text-center">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No assessments found with current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAssessments.map((assessment, index) => {
              const totalQuestions = getTotalQuestions(assessment);
              const percentage = Math.round((assessment.score / totalQuestions) * 100);
              const passed = assessment.score >= totalQuestions * 0.6;

              return (
                <motion.div
                  key={assessment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-lg font-semibold text-[#4C5173]">
                          {getCourseName(assessment.course_id)} -{" "}
                          {assessment.assessment_type === "pre" ? "Pre" : "Post"} Assessment
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            passed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(assessment.date_taken)}
                        </div>
                        <div className="font-semibold">
                          Score: {assessment.score}/{totalQuestions} ({percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => openDetailModal(assessment)}
                        className="px-4 py-2 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Details
                      </motion.button>
                      {passed ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : (
                        <XCircle size={24} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {showFeedback === `assessment-${assessment.id}` && (
                      <motion.div
                        className="mt-4 p-4 bg-gray-50 rounded-lg border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <h5 className="font-semibold mb-3">Was this assessment helpful?</h5>
                        <div className="flex gap-4 mb-4">
                          <motion.button
                            onClick={() => handleFeedback(assessment.id, "assessment", true, "")}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                          >
                            <ThumbsUp size={16} />
                            Yes
                          </motion.button>
                          <motion.button
                            onClick={() => handleFeedback(assessment.id, "assessment", false, "")}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                          >
                            <ThumbsDown size={16} />
                            No
                          </motion.button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">What was difficult?</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                            rows="3"
                            placeholder="Optional feedback..."
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                handleFeedback(assessment.id, "assessment", true, e.target.value);
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-3 flex gap-2">
                    <motion.button
                      onClick={() =>
                        setShowFeedback(
                          showFeedback === `assessment-${assessment.id}`
                            ? null
                            : `assessment-${assessment.id}`
                        )
                      }
                      className="text-sm text-[#4C5173] hover:text-[#3a3f5c] flex items-center gap-1"
                    >
                      <MessageSquare size={16} />
                      Feedback
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showDetailModal && detailModalData && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div
              className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
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

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {detailModalData.assessment_type === "pre" ? "Pre" : "Post"} Assessment Results
                    </h2>
                    <p className="text-lg opacity-90">{getCourseName(detailModalData.course_id)}</p>
                  </div>
                </div>

                {/* Score Summary */}
                {!loadingDetails && detailQuestions.length > 0 && (
                  <div className="mt-4 flex items-center gap-6">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {detailModalData.score}/{getTotalQuestions(detailModalData)}
                      </div>
                      <div className="text-sm opacity-80">Final Score</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {Math.round((detailModalData.score / getTotalQuestions(detailModalData)) * 100)}%
                      </div>
                      <div className="text-sm opacity-80">Percentage</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {detailResponses.filter(r => r.is_correct).length || 0}
                      </div>
                      <div className="text-sm opacity-80">Correct</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {detailResponses.filter(r => !r.is_correct).length || 0}
                      </div>
                      <div className="text-sm opacity-80">Incorrect</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="ml-3">Loading details...</span>
                  </div>
                ) : detailQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {detailQuestions.map((question, index) => {
                      const userResponse = detailResponses.find(r => 
                        r.question_id === question.id
                      );

                      return (
                        <motion.div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Question {index + 1}: {question.text}
                            </h4>
                            {question.image && (
                              <img 
                                src={question.image} 
                                alt="Question" 
                                className="max-w-xs rounded-lg mb-3"
                              />
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            {question.options?.map((option, optionIndex) => {
                              const isCorrect = option === question.correct_answer || 
                                (typeof option === 'object' && option.image === question.correct_answer);
                              const isUserChoice = userResponse && (
                                option === userResponse.selected_choice ||
                                (typeof option === 'object' && option.image === userResponse.selected_choice)
                              );
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded border ${
                                    isCorrect
                                      ? 'bg-green-50 border-green-200'
                                      : isUserChoice
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {typeof option === 'object' && option.image ? (
                                        <img 
                                          src={option.image} 
                                          alt={`Option ${optionIndex + 1}`}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      ) : null}
                                      <span className={`${isCorrect ? 'text-green-800 font-medium' : isUserChoice ? 'text-red-800' : 'text-gray-700'}`}>
                                        {typeof option === 'object' ? (option.text || option.label || 'Option') : option}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isCorrect && (
                                        <span className="text-green-600 font-semibold">✓ Correct</span>
                                      )}
                                      {isUserChoice && !isCorrect && (
                                        <span className="text-red-600 font-semibold">Your Answer</span>
                                      )}
                                      {isUserChoice && isCorrect && (
                                        <span className="text-green-600 font-semibold">Your Answer ✓</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-sm text-gray-600 border-t pt-3">
                            {userResponse ? (
                              <span className={`font-medium ${userResponse.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                Result: {userResponse.is_correct ? 'Correct' : 'Incorrect'}
                              </span>
                            ) : (
                              <span className="text-gray-500">No answer recorded</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No detailed information available for this assessment.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssessmentHistory;