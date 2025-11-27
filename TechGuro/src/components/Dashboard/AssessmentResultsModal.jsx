// src/components/Dashboard/AssessmentResultsModal.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen } from "lucide-react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AssessmentResultsModal = ({
  showModal,
  closeModal,
  loadingModal,
  modalError,
  modalQuestions,
  modalResponses,
  selectedAssessment,
  selectedCourse,
  preAssessment,
  postAssessment
}) => {
  const totalQuestions = 20;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
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
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedAssessment} Results
                  </h2>
                  <p className="text-lg opacity-90">{selectedCourse}</p>
                </div>
              </div>

              {/* Score Summary */}
              {!loadingModal && !modalError && (
                <div className="mt-4 flex items-center gap-6">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">
                      {selectedAssessment === "Pre-Assessment" && preAssessment
                        ? `${preAssessment.score}/${preAssessment.total || totalQuestions}`
                        : selectedAssessment === "Post-Assessment" && postAssessment
                          ? `${postAssessment.score}/${postAssessment.total || totalQuestions}`
                          : "N/A"
                      }
                    </div>
                    <div className="text-sm opacity-80">Final Score</div>
                  </div>

                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">
                      {selectedAssessment === "Pre-Assessment" && preAssessment
                        ? `${Math.round((preAssessment.score / (preAssessment.total || totalQuestions)) * 100)}%`
                        : selectedAssessment === "Post-Assessment" && postAssessment
                          ? `${Math.round((postAssessment.score / (postAssessment.total || totalQuestions)) * 100)}%`
                          : "N/A"
                      }
                    </div>
                    <div className="text-sm opacity-80">Percentage</div>
                  </div>

                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">
                      {modalResponses.filter(r => r.is_correct).length || 0}
                    </div>
                    <div className="text-sm opacity-80">Correct</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              {loadingModal && (
                <motion.div
                  className="flex flex-col justify-center items-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#4C5173] border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-lg text-gray-600">Loading assessment details...</p>
                </motion.div>
              )}

              {!loadingModal && modalError && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-600">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Results</h3>
                  <p className="text-red-700">{modalError}</p>
                </motion.div>
              )}

              {!loadingModal && !modalError && modalQuestions.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600">No questions found for this assessment.</p>
                </motion.div>
              )}

              {!loadingModal && !modalError && modalQuestions.length > 0 && (
                <div className="space-y-6">
                  {modalQuestions.map((q, index) => {
                    let choices = [];
                    try {
                      choices = Array.isArray(q.choices)
                        ? q.choices
                        : q.choices
                          ? JSON.parse(q.choices)
                          : [];
                    } catch (e) {
                      choices = [];
                    }

                    const userResp = modalResponses.find(r => r.question_id === q.id || r.question_id === q.question_id);
                    const isCorrect = userResp?.is_correct;

                    return (
                      <motion.div
                        key={q.id}
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
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${isCorrect
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {isCorrect ? (
                                  <>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                      ✓
                                    </motion.div>
                                    Correct
                                  </>
                                ) : (
                                  <>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                      ✗
                                    </motion.div>
                                    Incorrect
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                              {q.text || q.question || q.question_text}
                            </p>
                          </div>
                        </div>

                        {/* Question Image (if exists) */}
                        {q.media_url && (
                          <div className="mb-4 flex justify-center">
                            <img
                              src={q.media_url}
                              alt="Question illustration"
                              className="max-w-xs max-h-48 object-contain rounded-lg border border-gray-300"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          </div>
                        )}

                        {/* Answer Choices */}
                        <div className="space-y-3">
                          {choices.map((choice, idx) => {
                            const isCorrectAnswer = choice === (q.correct_answer || q.answer || q.correct);
                            const isUserChoice = userResp && (choice === (userResp.selected_choice || userResp.user_answer));

                            return (
                              <motion.div
                                key={idx}
                                className={`p-4 rounded-lg border-2 transition-all ${isCorrectAnswer
                                  ? 'bg-green-50 border-green-300'
                                  : isUserChoice && !isCorrectAnswer
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-white border-gray-200'
                                  }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 + idx * 0.05 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                                      {String.fromCharCode(65 + idx)}
                                    </span>

                                    {/* Choice content */}
                                    {typeof choice === 'object' && choice.image ? (
                                      <img
                                        src={choice.image}
                                        alt={`Choice ${String.fromCharCode(65 + idx)}`}
                                        className="w-16 h-16 object-contain rounded border"
                                        onError={(e) => { e.target.src = placeholderimg }}
                                      />
                                    ) : (
                                      <span className="text-gray-800">{choice}</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isCorrectAnswer && (
                                      <motion.div
                                        className="flex items-center gap-1 text-green-700 font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                      >
                                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                          ✓
                                        </span>
                                        Correct
                                      </motion.div>
                                    )}

                                    {isUserChoice && !isCorrectAnswer && (
                                      <motion.div
                                        className="flex items-center gap-1 text-red-700 font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                      >
                                        <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                                          ✗
                                        </span>
                                        Your Answer
                                      </motion.div>
                                    )}

                                    {isUserChoice && isCorrectAnswer && (
                                      <motion.div
                                        className="flex items-center gap-1 text-green-700 font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                      >
                                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                          ✓
                                        </span>
                                        Your Correct Answer
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* No Answer Indicator */}
                        {!userResp?.selected_choice && !userResp?.user_answer && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                            <span className="text-gray-500 text-sm">No answer was recorded for this question</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!loadingModal && !modalError && modalQuestions.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total Questions: {modalQuestions.length} |
                    Correct: {modalResponses.filter(r => r.is_correct).length} |
                    Incorrect: {modalResponses.filter(r => !r.is_correct).length}
                  </div>
                  <motion.button
                    onClick={closeModal}
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
  );
};

export default AssessmentResultsModal;