//QuizModeCard.jsx
import React from 'react';
import { motion } from 'motion/react';
import { MousePointer, Keyboard, Image, Play } from 'lucide-react';

const getQuizModeDetails = (quizType) => {
  switch (quizType) {
    case 'multiple_choice':
      return {
        icon: Image,
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      };
    case 'drag_drop':
      return {
        icon: MousePointer,
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      };
    case 'typing':
      return {
        icon: Keyboard,
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800'
      };
    default:
      return {
        icon: Play,
        color: 'from-gray-400 to-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800'
      };
  }
};

const QuizModeCard = ({ mode, index, onClick }) => {
  const details = getQuizModeDetails(mode.quiz_type);
  const IconComponent = details.icon;

  const getDescription = (quizType) => {
    switch (quizType) {
      case 'multiple_choice':
        return 'Choose the correct answer from image options (10 random questions)';
      case 'drag_drop':
        return 'Drag items to their correct positions (5 random questions)';
      case 'typing':
        return 'Type the correct answers within time limit (5 random questions)';
      default:
        return 'Test your knowledge';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${details.bgColor} ${details.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105`}
      onClick={() => onClick(mode.quiz_type)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-lg`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>

        <h3 className={`text-[16px] md:text-[18px] font-bold mb-2 ${details.textColor}`}>
          {mode.display_name}
        </h3>

        <p className="text-[13px] md:text-[14px] text-gray-600 mb-4">
          {getDescription(mode.quiz_type)}
        </p>

        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="text-[11px] md:text-[12px] text-gray-500">Available Lessons:</span>
          <span className="bg-white px-2 py-1 rounded-full text-[11px] md:text-[12px] font-bold text-gray-700">
            {mode.available_lessons}
          </span>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClick(mode.quiz_type);
          }}
          className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${details.color} hover:opacity-90 transition-all text-[14px] md:text-[15px]`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Select Quiz Mode
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuizModeCard;
export { getQuizModeDetails };