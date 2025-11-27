// src/components/Dashboard/PerformanceOverview.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Laptop, Shield, MessageSquare, ShoppingCart } from "lucide-react";

const PerformanceOverview = ({
  courses,
  courseLessonCounts,
  courseProgress,
  overallProgress
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* TechGuro Progression - Overall Progress Circle */}
      <motion.div
        className="flex-1 border border-black rounded-md p-4 flex flex-col items-center justify-center"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3 className="font-semibold text-[23px] mb-2 text-center">
          Task Completion Rate (Mga Aralin):
        </h3>

        {/* Numeric Counter */}
        <div className="text-[#4C5173] font-bold text-lg mb-4">
          {(() => {
            const totalCompleted = Object.values(courseProgress).reduce((sum, percent) => {
              const courseTotal = courseLessonCounts[courses[Object.keys(courseProgress).indexOf(percent)]] || 5;
              return sum + Math.round((percent / 100) * courseTotal);
            }, 0);
            const totalLessons = Object.values(courseLessonCounts).reduce((sum, count) => sum + count, 0);
            return `${totalCompleted}/${totalLessons} mga aralin tapos na`;
          })()}
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#ccc"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#27ae60"
              strokeWidth="3"
              strokeDasharray={`${isNaN(overallProgress) ? 0 : overallProgress}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${isNaN(overallProgress) ? 0 : overallProgress}, 100` }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </svg>
          <motion.div
            className="absolute text-xl font-bold text-[#27ae60]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            {isNaN(overallProgress) ? 0 : overallProgress}%
          </motion.div>
        </div>
        <p className="text-center text-[#4C5173] mt-2">Overall Task Progress</p>
      </motion.div>

      {/* Course Progression - Per Course Breakdown */}
      <motion.div
        className="flex-1 border border-black rounded-md p-4 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-semibold text-[23px] mb-4 text-center">Course Progression</h3>
        <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2">
          <AnimatePresence>
            {courses.map((course, index) => {
              const percent = courseProgress[course] || 0;
              const totalLessons = courseLessonCounts[course] || 5;
              const completedLessons = Math.round((percent / 100) * totalLessons);

              // Get icon based on course name
              const CourseIcon =
                course === "Computer Basics" ? Laptop :
                  course === "Internet Safety" ? Shield :
                    course === "Digital Communication & Messaging" ? MessageSquare :
                      ShoppingCart;

              return (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-400 rounded-lg p-3 flex flex-col gap-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                >
                  {/* Course Title with Icon */}
                  <div className="flex items-center gap-2">
                    <CourseIcon className="w-5 h-5 text-[#4C5173] flex-shrink-0" />
                    <h4 className="font-semibold text-[16px] break-words">{course}</h4>
                  </div>

                  {/* Lesson Counter */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4C5173] font-semibold">Lessons Completed:</span>
                    <span className="text-[#4C5173] font-bold">
                      {completedLessons}/{totalLessons} mga aralin
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-[#6B708D] h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + (index * 0.1) }}
                    />
                  </div>

                  {/* Percentage Text */}
                  <motion.p
                    className="text-center text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + (index * 0.1) }}
                  >
                    {percent}% completed
                  </motion.p>

                  {/* Task Status Indicator */}
                  <div className="text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${percent === 100
                      ? 'bg-green-100 text-green-800'
                      : percent > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {percent === 100
                        ? '✅ Course Complete'
                        : percent > 0
                          ? '🟡 In Progress'
                          : '⏳ Not Started'
                      }
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceOverview;