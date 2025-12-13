//AllLessons.jsx
import React from 'react';
import { AnimatePresence } from 'motion/react';
import LessonCard from './LessonCard';

const AllLessons = ({
  lessonsData,
  formattedTitle,
  completedLessons,
  recommendedLessons,
  onStartLesson
}) => {
  return (
    <>
      <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">
        All Course Lessons
      </h1>
      <p className="text-[14px] md:text-[16px] mb-6">
        Complete overview of all lessons available in {formattedTitle}.
      </p>

      <div className="space-y-5">
        <AnimatePresence>
          {lessonsData.lessons?.map((lesson, index) => (
            <LessonCard
              key={lesson.lesson_id}
              lesson={lesson}
              index={index}
              isCompleted={completedLessons.includes(lesson.lesson_id)}
              isRecommended={recommendedLessons.includes(lesson.lesson_id)}
              onStartLesson={onStartLesson}
              showRecommendedBadge={false}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AllLessons;