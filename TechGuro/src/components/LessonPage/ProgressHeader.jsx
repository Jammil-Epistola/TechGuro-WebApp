//ProgressHeader.jsx
import React from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

const ProgressHeader = ({
  lessonTitle,
  currentSlide,
  totalSlides,
  isSupported,
  isPlaying,
  handleTTSClick
}) => {
  return (
    <div className="text-center mb-4 bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-[#4C5173]">
        {lessonTitle}
      </h1>
      <div className="flex items-center justify-center gap-4 mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-black">
          Slide {currentSlide + 1} of {totalSlides}
        </h2>

        {isSupported && (
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <motion.button
                onClick={handleTTSClick}
                className="relative flex items-center gap-2 px-4 py-2 bg-[#B6C44D] text-black rounded-lg hover:bg-[#a5b83d] transition-colors shadow-sm overflow-hidden"
                title="Basahin ang slide content"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Volume2 size={16} />
                <span className="hidden sm:inline">Basahin</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={handleTTSClick}
                className="relative flex items-center gap-2 px-4 py-2 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors shadow-sm overflow-hidden"
                title="Stop ang audio"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(76, 81, 115, 0.4)",
                    "0 0 0 10px rgba(76, 81, 115, 0.1)",
                    "0 0 0 20px rgba(76, 81, 115, 0)"
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  className="absolute inset-0 border-2 border-white rounded-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <VolumeX size={16} />
                <span className="hidden sm:inline">Stop</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#B6C44D] to-[#4C5173] h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentSlide + 1) / totalSlides) * 100}%`
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressHeader;