//LessonSelectionModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const LessonSelectionModal = ({
  isOpen,
  onClose,
  selectedQuizType,
  availableLessons,
  loadingQuizData,
  onLessonSelect
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl p-4 md:p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#4C5173]">
                Select a Lesson
              </h2>
              <p className="text-[14px] md:text-[16px] text-gray-600">
                Choose which lesson you want to practice with {selectedQuizType?.replace('_', ' ')} quiz
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {loadingQuizData ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C5173] mb-4"></div>
              <p className="text-[14px] md:text-[16px] text-gray-600">
                Loading available lessons...
              </p>
            </div>
          ) : availableLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[16px] md:text-[18px] text-gray-700 mb-2">
                No lessons available
              </p>
              <p className="text-[13px] md:text-[14px] text-gray-600">
                This quiz type is not available for any lessons yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableLessons.map((lessonInfo, index) => (
                <motion.div
                  key={lessonInfo.lesson_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => onLessonSelect(lessonInfo)}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-[16px] md:text-[18px] font-bold text-[#4C5173] mb-2">
                        {lessonInfo.lesson_title}
                      </h3>
                      <div className="flex items-center gap-4 text-[13px] md:text-[14px] text-gray-600 flex-wrap">
                        <span>
                          📝 {selectedQuizType === "multiple_choice" ? 10 : 
                              selectedQuizType === "drag_drop" ? 5 : 
                              selectedQuizType === "typing" ? 5 : 
                              lessonInfo.total_questions} questions
                        </span>
                        {lessonInfo.time_limit && (
                          <span>⏱️ {lessonInfo.time_limit}s time limit</span>
                        )}
                        {lessonInfo.difficulty && (
                          <span className={`px-2 py-1 rounded-full text-[11px] md:text-[12px] font-bold ${
                            lessonInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            lessonInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lessonInfo.difficulty.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <motion.button
                      className="w-full md:w-auto px-4 py-2 bg-[#B6C44D] text-black font-semibold rounded-lg hover:bg-[#a5b83d] transition-colors text-[14px] md:text-[15px]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Quiz
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LessonSelectionModal;