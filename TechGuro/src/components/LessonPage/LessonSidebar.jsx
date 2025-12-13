//LessonSidebar.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const LessonSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  lessonsData,
  formattedTitle,
  activeSectionIndex,
  setActiveSectionIndex,
  sectionLessons,
  currentLesson,
  isLessonCompleted,
  handleLessonClick,
  courseName,
  navigate
}) => {
  const handlePrevSection = () => {
    const totalSections = 3;
    setActiveSectionIndex((prev) => (prev - 1 + totalSections) % totalSections);
  };

  const handleNextSection = () => {
    const totalSections = 3;
    setActiveSectionIndex((prev) => (prev + 1) % totalSections);
  };

  const getSectionTitle = () => {
    if (activeSectionIndex === 0) return "TEKI'S RECOMMENDED LESSONS";
    if (activeSectionIndex === 1) return "ALL LESSONS";
    if (activeSectionIndex === 2) return "QUIZZES";
    return "LESSONS";
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="w-full lg:w-[320px] bg-[#BFC4D7] border-r border-gray-200 shadow-lg flex flex-col fixed lg:relative top-0 z-[60] h-screen lg:h-auto lg:sticky lg:top-0 lg:max-h-screen"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-5 h-5 text-[#1A202C]" />
            </button>

            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src={lessonsData?.image_url || placeholderimg}
                  alt={formattedTitle}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#4C5173] shadow-sm"
                />
                <h2 className="text-lg md:text-xl font-bold text-[#4C5173]">{formattedTitle}</h2>
              </div>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-4 md:mb-6 bg-gray-50 rounded-lg p-2 md:p-3">
                <button
                  onClick={handlePrevSection}
                  className="p-1.5 md:p-2 rounded-lg bg-[#4C5173] text-white hover:bg-[#3a3f5c] transition-colors shadow-sm"
                >
                  <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeSectionIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="font-semibold text-center text-xs md:text-sm mx-2 md:mx-3 text-[#4C5173]"
                  >
                    {getSectionTitle()}
                  </motion.p>
                </AnimatePresence>
                <button
                  onClick={handleNextSection}
                  className="p-1.5 md:p-2 rounded-lg bg-[#4C5173] text-white hover:bg-[#3a3f5c] transition-colors shadow-sm"
                >
                  <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              {/* Lessons */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`section-${activeSectionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {sectionLessons.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-xs md:text-sm italic text-gray-500 text-center py-8"
                    >
                      Walang lessons available.
                    </motion.p>
                  ) : (
                    sectionLessons.map((lesson, index) => (
                      <motion.div
                        key={lesson.lesson_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        onClick={() => {
                          handleLessonClick(lesson);
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`p-3 md:p-4 rounded-lg cursor-pointer text-xs md:text-sm transition-all transform hover:scale-105 ${
                          currentLesson.lesson_id === lesson.lesson_id
                            ? "bg-gradient-to-r from-[#F4EDD9] to-[#FFF8E1] font-semibold border-2 border-[#4C5173] shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800">{lesson.lesson_title}</span>
                          {isLessonCompleted(lesson.lesson_id) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 500 }}
                              className="text-green-600 text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Button */}
            <div className="p-3 md:p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate(`/courses/${courseName}`);
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white rounded-lg font-semibold hover:from-[#3a3f5c] hover:to-[#5a5f7a] transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Bumalik sa Lesson List
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LessonSidebar;