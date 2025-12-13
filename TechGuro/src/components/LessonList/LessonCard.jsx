//LessonCard.jsx
import React from 'react';
import { motion } from 'motion/react';

const LessonCard = ({
  lesson,
  index,
  isCompleted,
  isRecommended,
  onStartLesson,
  showRecommendedBadge = false
}) => {
  return (
    <motion.div
      className={`bg-[#F9F8FE] border-2 rounded-lg p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${
        isCompleted ? 'border-green-400 bg-green-50' : 'border-[#6B708D]'
      }`}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.02,
        x: 10,
        shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {showRecommendedBadge ? (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
              RECOMMENDED #{index + 1}
            </span>
          ) : (
            <>
              <span className="bg-gray-500 text-white px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
                LESSON {index + 1}
              </span>
              {isRecommended && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
                  ★ RECOMMENDED
                </span>
              )}
            </>
          )}
        </div>
        <h2 className="text-[18px] md:text-[20px] font-bold mb-2 text-[#4C5173]">
          {lesson.lesson_title}
        </h2>
        <p className="text-[13px] md:text-[14px] text-gray-600 mb-2">
          {lesson.slides?.[0]?.content?.[0] ?? "Learn essential concepts in this lesson."}
        </p>
        {isCompleted && (
          <p className="text-green-700 font-bold mt-2 text-[13px] md:text-[14px] flex items-center gap-1">
            ✓ Completed - Great job!
          </p>
        )}
      </div>
      <motion.button
        onClick={() => onStartLesson(lesson.lesson_id)}
        className={`w-full md:w-auto px-6 py-3 rounded font-semibold text-[15px] md:text-[16px] transition-all ${
          isCompleted
            ? "bg-gray-500 text-white hover:bg-gray-600"
            : "bg-[#B6C44D] text-black hover:bg-[#a5b83d] shadow-lg hover:shadow-xl"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCompleted ? "Review" : "Start Learning"}
      </motion.button>
    </motion.div>
  );
};

export default LessonCard;