// Updated ImageQuizCard.jsx - Debug and Fix Answer Comparison
import React from "react";
import { motion } from "motion/react";
import { Image, Check } from "lucide-react";

const ImageQuizCard = ({ question, userAnswer, onAnswerChange }) => {
  if (!question) return null;

  const { options } = question;

  console.log('ImageQuizCard Debug Info:', {
    question: question,
    correct_answer: question.correct_answer,
    answer: question.answer, // Check if it's stored as 'answer' instead
    correct: question.correct, // Check if it's stored as 'correct' instead
    options: options,
    userAnswer: userAnswer
  });

  // ✅ Parse options safely (handle JSON string from DB or already-parsed array)
  const parsedOptions = Array.isArray(options)
    ? options
    : (() => {
      try {
        return JSON.parse(options || "[]");
      } catch {
        return [];
      }
    })();

  console.log('Parsed options:', parsedOptions);

  // ✅ Helper function to get option value (copied from QuestionCard)
  const getOptionValue = (option) => {
    console.log('Processing option:', option);
    
    if (typeof option === 'object' && option.image) {
      console.log('Option is object with image:', option.image);
      return option.image;
    }
    console.log('Option is text:', option);
    return option;
  };

  // ✅ Helper function to render option content (copied from QuestionCard)
  const renderOptionContent = (option, index) => {
    if (typeof option === 'object' && option.image) {
      return (
        <img
          src={option.image}
          alt={`Option ${index + 1}`}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return (
      <span className="text-2xl text-black font-medium text-center">
        {option}
      </span>
    );
  };

  const handleOptionSelect = (optionValue) => {
    console.log('Selected option value:', optionValue);
    console.log('Calling onAnswerChange with:', optionValue);
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
          <div
            className={`grid gap-6 ${parsedOptions.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : parsedOptions.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
          >
            {parsedOptions.map((opt, index) => {
              const optionValue = getOptionValue(opt);
              const isSelected = userAnswer === optionValue;
              
              console.log(`Option ${index}:`, {
                original: opt,
                processed: optionValue,
                isSelected: isSelected,
                userAnswer: userAnswer
              });

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(optionValue)}
                  className={`relative p-6 rounded-2xl border-3 transition-all duration-300 ${isSelected
                      ? "border-[#B6C44D] bg-gradient-to-br from-[#F4EDD9] to-[#FFF8E1] shadow-lg"
                      : "border-gray-200 bg-white hover:border-[#4C5173] hover:shadow-md"
                    }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#B6C44D] rounded-full flex items-center justify-center shadow-lg z-10">
                      <Check className="w-5 h-5 text-black" />
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="mb-4 bg-gray-50 rounded-xl p-4">
                    {typeof opt === 'object' && opt.image ? (
                      <img
                        src={opt.image}
                        alt={`Option ${index + 1}`}
                        className="w-full h-40 object-contain"
                        onLoad={(e) => {
                          console.log(`Image loaded: ${opt.image}`);
                        }}
                        onError={(e) => {
                          console.error(`Image failed to load: ${opt.image}`);
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center">
                        <span className="text-xl text-black font-medium">
                          {opt}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
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
            <span className="text-sm font-medium">Answer Selected!</span>
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