import React from "react";
import { motion } from "motion/react";
import { Image, Check } from "lucide-react";

const ImageQuizCard = ({ question, userAnswer, onAnswerChange }) => {
  if (!question) return null;

  const { question_id, options, question_number } = question;
  
  // Parse options safely
  const parsedOptions = Array.isArray(options)
    ? options
    : (() => {
        try {
          return JSON.parse(options || '[]');
        } catch {
          return [];
        }
      })();

  const handleOptionSelect = (optionValue) => {
    // For image MCQ, we pass the image filename as the answer
    onAnswerChange(optionValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Question Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Image className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Image Recognition Quiz
          </span>
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-bold text-[#4C5173] leading-relaxed">
          {question.question}
        </h2>
      </motion.div>

      {/* Options Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className={`grid gap-6 ${parsedOptions.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 
                                      parsedOptions.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 
                                      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {parsedOptions.map((opt, index) => {
              const optionValue = opt.image || opt;
              const isSelected = userAnswer === optionValue;
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.2 + (index * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                  onClick={() => handleOptionSelect(optionValue)}
                  className={`relative group p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                    isSelected
                      ? "border-[#B6C44D] bg-gradient-to-br from-[#F4EDD9] to-[#FFF8E1] shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-[#4C5173] hover:shadow-md"
                  }`}
                  whileHover={{ 
                    scale: isSelected ? 1.05 : 1.08,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-[#B6C44D] rounded-full flex items-center justify-center shadow-lg z-10"
                    >
                      <Check className="w-5 h-5 text-black" />
                    </motion.div>
                  )}

                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50">
                    <motion.img
                      src={`/quiz_images/${optionValue}`}
                      alt={`Option ${index + 1}`}
                      className="w-full h-48 object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.png'; // fallback image
                        e.target.className = "w-full h-48 object-contain p-4 opacity-50";
                      }}
                      loading="lazy"
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#4C5173] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
                  </div>

                  {/* Option Label */}
                  <div className="text-center">
                    <span className={`text-lg font-semibold transition-colors duration-300 ${
                      isSelected ? "text-[#4C5173]" : "text-gray-700 group-hover:text-[#4C5173]"
                    }`}>
                      Option {String.fromCharCode(65 + index)}
                    </span>
                  </div>

                  {/* Selection Ring Animation */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 border-3 border-[#B6C44D] rounded-2xl"
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: [0, 1, 0],
                      }}
                      transition={{ 
                        duration: 0.6,
                        times: [0, 0.5, 1]
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Answer Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center mt-8"
      >
        {userAnswer ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Answer selected</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full">
            <div className="w-4 h-4 border-2 border-gray-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Select an answer</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImageQuizCard;