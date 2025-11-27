// src/components/Dashboard/RecentQuizScores.jsx
import React from "react";
import { motion } from "motion/react";
import { Target, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const RecentQuizScores = ({
  quizScores,
  quizLoading,
  quizError,
  navigateToSection
}) => {
  const latestQuiz = quizScores.length > 0 ? quizScores[0] : null;

  const getQuizTypeDisplay = (quizType) => {
    const typeMap = {
      'multiple_choice': 'Image Quiz',
      'drag_drop': 'Drag & Drop',
      'typing': 'Typing Quiz'
    };
    return typeMap[quizType] || quizType;
  };

  const getQuizImprovement = () => {
    if (quizScores.length < 2) return null;

    const latest = quizScores[0];
    const previous = quizScores.find(q =>
      q.quiz_type === latest.quiz_type &&
      q.lesson_id === latest.lesson_id &&
      q.completed_at !== latest.completed_at
    );

    if (!previous) return null;

    const improvement = latest.percentage - previous.percentage;
    return {
      value: improvement,
      isImprovement: improvement > 0,
      isDecline: improvement < 0
    };
  };

  const quizImprovement = getQuizImprovement();

  return (
    <motion.div
      className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[240px]"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-[#4C5173]" />
        <h2 className="text-[25px] font-bold">Recent Quiz:</h2>
      </div>

      <div className="flex flex-col justify-center flex-1">
        {quizLoading ? (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full"
            />
          </motion.div>
        ) : quizError ? (
          <p className="text-red-600 text-center">Error loading quiz data</p>
        ) : !latestQuiz ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[30px] font-semibold">Walang quiz na na-try pa</p>
            <p className="text-[25px] text-gray-600 mt-2">No quizzes taken yet</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Quiz Score Display */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${latestQuiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                {latestQuiz.score}/{latestQuiz.total_questions}
              </div>
              <div className={`text-lg font-semibold ${latestQuiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                {latestQuiz.percentage}% {latestQuiz.passed ? '✓' : '✗'}
              </div>
            </div>

            {/* Quiz Completion Counter */}
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm text-[#4C5173] font-semibold mb-1">Quiz Task Completion:</div>
              <div className="text-lg font-bold text-[#4C5173]">
                {quizScores.length} mga quiz na-try
              </div>
              <div className="text-xs text-gray-600">
                {(() => {
                  const uniqueLessons = new Set(quizScores.map(q => `${q.lesson_id}-${q.quiz_type}`));
                  return `sa ${uniqueLessons.size} iba't ibang aralin`;
                })()}
              </div>
            </div>

            {/* Quiz Details */}
            <div className="text-center text-sm space-y-1">
              <p className="font-medium">{getQuizTypeDisplay(latestQuiz.quiz_type)}</p>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(latestQuiz.completed_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Improvement Indicator */}
            {quizImprovement && (
              <motion.div
                className={`flex items-center justify-center gap-1 text-sm ${quizImprovement.isImprovement ? 'text-green-600' :
                  quizImprovement.isDecline ? 'text-red-600' : 'text-gray-600'
                  }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {quizImprovement.isImprovement ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {quizImprovement.value > 0 ? '+' : ''}{quizImprovement.value}% from last attempt
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Quick Action Button */}
      <motion.button
        onClick={() => navigateToSection("history")}
        className="w-full py-2 mt-4 rounded-md border-2 border-[#4C5173] bg-[#4C5173] text-white font-bold text-[16px] hover:bg-[#3a3f5c]"
        whileHover={{ scale: 1.02, backgroundColor: "#3a3f5c" }}
        whileTap={{ scale: 0.98 }}
      >
        See All History
      </motion.button>
    </motion.div>
  );
};

export default RecentQuizScores;