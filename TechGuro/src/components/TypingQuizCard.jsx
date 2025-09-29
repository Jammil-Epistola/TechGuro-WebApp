// Updated TypingQuizCard.jsx 
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, Check, AlertCircle, Type } from "lucide-react";

const TypingQuizCard = ({ question, userAnswer, onAnswerChange, onSubmit }) => {
  const [inputValue, setInputValue] = useState(userAnswer || "");
  const [isTyping, setIsTyping] = useState(false);

  // Update input when userAnswer changes from parent
  useEffect(() => {
    setInputValue(userAnswer || "");
  }, [userAnswer]);

  if (!question) return null;

  const { question_id, question_number, options } = question;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsTyping(true);

    // Call parent's answer change handler
    onAnswerChange(value);

    // Reset typing indicator after a short delay
    setTimeout(() => setIsTyping(false), 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Check if there's a valid answer before submitting
      if (inputValue.trim() && onSubmit) {
        // Add a small delay for better UX (shows typing animation briefly)
        setTimeout(() => {
          onSubmit();
        }, 300);
      }
    }
  };

  // Case-insensitive answer checking
  const getInputStatus = () => {
    if (!inputValue.trim()) return 'empty';
    if (inputValue.trim().length < 2) return 'too_short';

    // Check if the answer matches one of the options (case-insensitive)
    if (options && options.length > 0) {
      const matchesOption = options.some(option =>
        option.toLowerCase().trim() === inputValue.toLowerCase().trim()
      );
      return matchesOption ? 'correct_option' : 'valid';
    }

    return 'valid';
  };

  const getStatusColor = () => {
    const status = getInputStatus();
    switch (status) {
      case 'empty': return 'border-gray-300';
      case 'too_short': return 'border-yellow-400';
      case 'correct_option': return 'border-green-500';
      case 'valid': return 'border-blue-400';
      default: return 'border-gray-300';
    }
  };

  const getStatusIcon = () => {
    const status = getInputStatus();
    switch (status) {
      case 'empty':
        return <Type className="w-5 h-5 text-gray-400" />;
      case 'too_short':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'correct_option':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'valid':
        return <Check className="w-5 h-5 text-blue-500" />;
      default:
        return <Type className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if user's input matches any option (case-insensitive)
  const getMatchingOption = () => {
    if (!options || options.length === 0 || !inputValue.trim()) return null;

    return options.find(option =>
      option.toLowerCase().trim() === inputValue.toLowerCase().trim()
    );
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
          <div className="p-2 bg-purple-100 rounded-full">
            <Keyboard className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Typing Practice Quiz
          </span>
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold text-[#4C5173] leading-relaxed">
          {question.question}
        </h2>
      </motion.div>

      {/* Always Show Options Section - No Auto-fill */}
      {options && options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#4C5173] mb-4 text-center">
              Choose from these options (type manually):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {options.map((option, index) => {
                const isMatching = getMatchingOption() === option;

                return (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-lg border-2 transition-all ${isMatching
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      scale: isMatching ? 1.05 : 1,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="text-center">
                      {/* Removed "Option 1" text, increased font size to text-3xl (30px base + ~4-5px = ~34-35px) */}
                      <div className="font-bold text-3xl">{option}</div>
                      {isMatching && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-2 flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Match!</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              Type any of these options in the text field below. Case doesn't matter!
            </p>
          </div>
        </motion.div>
      )}

      {/* Typing Input Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative"
          >
            {/* Input Container */}
            <div className="relative">
              <motion.input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className={`w-full px-6 py-6 text-xl lg:text-2xl font-medium text-[#4C5173] bg-white border-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#B6C44D]/30 ${getStatusColor()} ${isTyping ? 'scale-102 shadow-lg' : ''
                  }`}
                whileFocus={{ scale: 1.02 }}
                autoComplete="off"
                spellCheck="false"
              />

              {/* Status Icon */}
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={getInputStatus()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getStatusIcon()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-2 left-6 flex items-center gap-2"
                  >
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-[#B6C44D] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#B6C44D] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#B6C44D] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm text-[#4C5173] font-medium">Typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Character Count and Case-Insensitive Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex justify-between items-center mt-4 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <span>Characters: {inputValue.length}</span>
                {inputValue.length > 50 && (
                  <span className="text-orange-500">•</span>
                )}
              </div>

              {options && options.length > 0 && (
                <span className="text-[#4C5173] text-xs">
                  Case doesn't matter (laptop = LAPTOP = LaPtOp)
                </span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Answer Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center mt-8"
      >
        <AnimatePresence mode="wait">
          {getInputStatus() === 'empty' ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full"
            >
              <div className="w-4 h-4 border-2 border-gray-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Start typing your answer</span>
            </motion.div>
          ) : getInputStatus() === 'too_short' ? (
            <motion.div
              key="short"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Answer seems too short</span>
            </motion.div>
          ) : getInputStatus() === 'correct_option' ? (
            <motion.div
              key="correct"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">
                Perfect match! ({getMatchingOption()})
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Answer recorded</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TypingQuizCard;