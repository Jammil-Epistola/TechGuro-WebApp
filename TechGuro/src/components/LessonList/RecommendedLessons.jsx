//RecommendedLessons.jsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LessonCard from './LessonCard';

const RecommendedLessons = ({
  lessonsData,
  recommendedLessons,
  completedLessons,
  onStartLesson
}) => {
  const recommendedLessonsList = lessonsData.lessons?.filter(lesson =>
    recommendedLessons.includes(lesson.lesson_id)
  ) || [];

  return (
    <>
      <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">
        Teki's Recommended Lessons
      </h1>
      <p className="text-[14px] md:text-[16px] mb-6">
        Based on your Pre-Assessment, here are the lessons Teki recommends to improve your knowledge of the course.
      </p>

      <div className="flex flex-col gap-5">
        {recommendedLessons.length === 0 ? (
          <motion.div
            className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] md:text-[18px] italic text-gray-700 mb-2">
              No recommendations yet.
            </p>
            <p className="text-[13px] md:text-[14px] text-gray-600">
              Complete your pre-assessment to get personalized lesson recommendations.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[13px] md:text-[14px] font-semibold text-blue-800">
                💡 {recommendedLessons.length} lesson{recommendedLessons.length > 1 ? 's' : ''} recommended based on your assessment results
              </p>
            </motion.div>

            <AnimatePresence>
              {recommendedLessonsList.map((lesson, index) => (
                <LessonCard
                  key={lesson.lesson_id}
                  lesson={lesson}
                  index={index}
                  isCompleted={completedLessons.includes(lesson.lesson_id)}
                  isRecommended={true}
                  onStartLesson={onStartLesson}
                  showRecommendedBadge={true}
                />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  );
};

export default RecommendedLessons;