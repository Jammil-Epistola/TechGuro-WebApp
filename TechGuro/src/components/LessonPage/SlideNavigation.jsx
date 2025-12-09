//SlideNavigation.jsx
import React from "react";

const SlideNavigation = ({
  currentSlide,
  totalSlides,
  handlePrevSlide,
  handleNextSlide,
  isLastSlide,
  isLessonCompleted,
  markLessonComplete,
  proceedToNextLesson
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
      <button
        onClick={handlePrevSlide}
        disabled={currentSlide === 0}
        className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all transform ${
          currentSlide === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] hover:scale-105 shadow-lg"
        }`}
      >
        ← Previous
      </button>

      <div className="flex gap-4">
        {isLastSlide ? (
          isLessonCompleted ? (
            <button
              onClick={proceedToNextLesson}
              className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 text-white bg-gradient-to-r from-[#0077FF] to-[#17559D] hover:from-[#0066CC] hover:to-[#144A82] shadow-lg transition-all"
            >
              Done Reviewing ✓
            </button>
          ) : (
            <button
              onClick={markLessonComplete}
              className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 bg-gradient-to-r from-[#B6C44D] to-[#A5B83D] text-black hover:from-[#a5b83d] hover:to-[#94A535] shadow-lg transition-all"
            >
              Mark Complete ✓
            </button>
          )
        ) : (
          <button
            onClick={handleNextSlide}
            className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] shadow-lg transition-all"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default SlideNavigation;