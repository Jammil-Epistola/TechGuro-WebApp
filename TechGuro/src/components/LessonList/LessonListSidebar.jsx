//LessonListSidebar.jsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import placeholderimg from '../../assets/Dashboard/placeholder_teki.png';

const LessonListSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  lessonsData,
  formattedTitle,
  activeSection,
  navigateToSection,
  recommendedLessons,
  completedLessons,
  areAllRecommendedCompleted,
  handlePostAssessment
}) => {
  const completedCount = recommendedLessons.filter(lessonId => 
    completedLessons.includes(lessonId)
  ).length;
  
  const progressPercentage = recommendedLessons.length > 0
    ? (completedCount / recommendedLessons.length) * 100
    : 0;

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="w-[320px] bg-gradient-to-br from-[#BFC4D7] to-[#A8B0C8] p-6 h-screen overflow-y-auto border-r-2 border-[#6B708D] shadow-lg z-[60] fixed md:sticky top-0"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-5 h-5 text-[#1A202C]" />
            </button>

            {/* Header Section */}
            <motion.div
              className="flex items-center gap-4 mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="relative">
                <img
                  src={lessonsData.image_url || placeholderimg}
                  alt={formattedTitle}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#1A202C] mb-1">{formattedTitle}</h2>
                <p className="text-[14px] text-[#2D3748] font-semibold">Learning Dashboard</p>
              </div>
            </motion.div>

            {/* Navigation Sections */}
            <div className="space-y-3 mb-8">
              <motion.div
                onClick={() => navigateToSection('recommended')}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  activeSection === 'recommended'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                }`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    activeSection === 'recommended' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-bold text-[17px] mb-1 text-[#1A202C]">TEKI'S RECOMMENDED</div>
                    <div className="text-[14px] text-[#2D3748] font-medium">AI-based lesson suggestions</div>
                  </div>
                  {recommendedLessons.length > 0 && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                      {recommendedLessons.length}
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                onClick={() => navigateToSection('allLessons')}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  activeSection === 'allLessons'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                }`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activeSection === 'allLessons' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-bold text-[17px] mb-1 text-[#1A202C]">ALL LESSONS</div>
                    <div className="text-[14px] text-[#2D3748] font-medium">Complete course overview</div>
                  </div>
                  {lessonsData?.lessons && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                      {lessonsData.lessons.length}
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                onClick={() => navigateToSection('quizzes')}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  activeSection === 'quizzes'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                }`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activeSection === 'quizzes' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-bold text-[17px] mb-1 text-[#1A202C]">QUIZZES</div>
                    <div className="text-[14px] text-[#2D3748] font-medium">Practice and assessment</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress Section */}
            <motion.div
              className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[15px] font-bold text-[#1A202C]">Recommended Progress</span>
                <span className="text-[14px] text-[#2D3748] font-semibold">
                  {completedCount}/{recommendedLessons.length || 0}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-[#B6C44D] to-[#9BB83D] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
              <div className="text-[13px] text-[#2D3748] font-medium mt-2">
                Complete recommended lessons to unlock Post-Assessment
              </div>
            </motion.div>

            {/* Post-Assessment Button */}
            <motion.button
              onClick={handlePostAssessment}
              className={`w-full px-4 py-4 rounded-xl font-bold text-[18px] transition-all ${
                areAllRecommendedCompleted()
                  ? "bg-gradient-to-r from-[#B6C44D] to-[#9BB83D] text-black hover:from-[#a5b83d] hover:to-[#8aa936] shadow-lg transform hover:scale-[1.02]"
                  : "bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed"
              }`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              whileHover={areAllRecommendedCompleted() ? { scale: 1.02 } : {}}
              whileTap={areAllRecommendedCompleted() ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Post-Assessment</span>
                {areAllRecommendedCompleted() ? (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                )}
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LessonListSidebar;