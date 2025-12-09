//SlideContent.jsx
import React from "react";
import { motion } from "motion/react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const SlideContent = ({ slide, currentSlide }) => {
  const mediaElement = slide.media_url ? (
    slide.media_url.endsWith(".mp4") ? (
      <motion.video
        controls
        className="w-full h-full rounded-lg shadow-sm"
        style={{ objectFit: 'contain' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <source src={slide.media_url} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>
    ) : (
      <motion.img
        src={slide.media_url}
        alt={slide.slide_title || `Slide ${currentSlide + 1}`}
        className="w-full h-full rounded-lg shadow-sm"
        style={{ objectFit: 'contain' }}
        onError={(e) => { e.target.src = placeholderimg; }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
    )
  ) : (
    <motion.div
      className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex justify-center items-center shadow-sm border-2 border-dashed border-gray-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">🖼️</div>
        <span className="text-lg">Walang media available</span>
      </div>
    </motion.div>
  );

  const contentElement = (
    <motion.div
      className="h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {slide.slide_title && (
        <motion.div
          className="flex-shrink-0 mb-4 pb-2 border-b border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-[#4C5173]">
            {slide.slide_title}
          </h3>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0">
        {slide.content && slide.content.length > 0 ? (
          <motion.div
            className="space-y-4 pr-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {slide.content.map((text, idx) => (
              <motion.div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
              >
                <motion.div
                  className="w-3 h-3 bg-[#4C5173] rounded-full mt-2 flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.5 + (idx * 0.1) }}
                />
                <p className="text-lg text-gray-800 leading-relaxed flex-1">
                  {text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="h-full flex items-center justify-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <span className="text-lg">Walang content available</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Media Section */}
      <div className="lg:w-1/2 h-64 lg:h-full bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
        <div className="w-full h-full p-2">
          {mediaElement}
        </div>
      </div>

      {/* Content Section */}
      <div className="lg:w-1/2 flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
        <div className="w-full h-full p-4">
          {contentElement}
        </div>
      </div>
    </div>
  );
};

export default SlideContent;