// QuizQuestionCard.jsx
import React from "react";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import ImageQuizCard from "./ImageQuizCard";
import TypingQuizCard from "./TypingQuizCard";
import DragDropQuizCard from "./DragDropQuizCard";

const QuizQuestionCard = ({ question, userAnswer, onAnswerChange, quizType }) => {
  if (!question) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-red-600 font-semibold mb-2">No Question Data</p>
        <p className="text-gray-600">Unable to load question. Please try again.</p>
      </motion.div>
    );
  }

  // Determine question type from multiple possible sources
  const questionType = quizType || question.quiz_type || question.question_type || question.type;

  // Render appropriate card component
  const renderQuestionCard = () => {
    switch (questionType) {
      case "multiple_choice":
      case "image_mcq":
        return (
          <ImageQuizCard
            question={question}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
          />
        );

      case "typing":
        return (
          <TypingQuizCard
            question={question}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
          />
        );

      case "drag_drop":
        return (
          <DragDropQuizCard
            question={question}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
          />
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <p className="text-lg text-orange-600 font-semibold mb-2">Unsupported Quiz Type</p>
            <p className="text-gray-600 mb-4">
              Quiz type "{questionType}" is not yet implemented.
            </p>
            <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-3">
              <p className="font-semibold mb-2">Debugging Info:</p>
              <p>Question Type: {questionType}</p>
              <p>Question ID: {question.question_id || question.id}</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      key={`question-${question.question_id || question.id}-${questionType}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full"
    >
      {renderQuestionCard()}
    </motion.div>
  );
};

export default QuizQuestionCard;