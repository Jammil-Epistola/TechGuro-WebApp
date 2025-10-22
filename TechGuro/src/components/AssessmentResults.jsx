// src/components/AssessmentResults.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, TrendingUp, CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import CourseNavbar from "../courses/courseNavbar";
import Teki1 from "../assets/Teki 1.png";

const AssessmentResults = ({ 
  assessmentType = "pre", 
  courseName,
  score,
  totalQuestions,
  isProcessing = true,
  onComplete 
}) => {
  const getResultMessage = () => {
    if (assessmentType === "pre") {
      if (isProcessing) {
        return {
          main: `Nakakuha ka ng ${score}/${totalQuestions} points! Based sa inyong mga sagot, ginagawa ko na ang perfect lessons para sa inyo`,
          sub: "Please wait habang inaanal-ize ko ang inyong mga results"
        };
      } else {
        return {
          main: `Salamat sa pagsagot! Nakuha ko na ang inyong baseline knowledge.`,
          sub: "Pwede na nating simulan ang inyong personalized learning journey!"
        };
      }
    } else {
      if (isProcessing) {
        return {
          main: `Final score: ${score}/${totalQuestions}! Tinitingnan ko kung na-master mo na ang course`,
          sub: "Please wait habang ine-evaluate ko ang inyong progress"
        };
      } else {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 75) {
          return {
            main: `Congratulations! Successfully mo na na-complete ang course!`,
            sub: `Na-achieve mo ang ${percentage.toFixed(0)}% - Ready ka na sa next level!`
          };
        } else {
          return {
            main: `Nakakuha ka ng ${percentage.toFixed(0)}%. Kailangan pa ng konting practice.`,
            sub: "Hindi pa tapos ang journey mo - balik tayo sa mga lessons!"
          };
        }
      }
    }
  };

  const getProcessingIcon = () => (assessmentType === "pre" ? Brain : TrendingUp);
  const getResultIcon = () => {
    if (assessmentType === "pre") return CheckCircle;
    const percentage = (score / totalQuestions) * 100;
    return percentage >= 75 ? CheckCircle : RotateCcw;
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();
  const resultMessage = getResultMessage();
  const ProcessingIcon = getProcessingIcon();
  const ResultIcon = getResultIcon();
  const percentage = (score / totalQuestions) * 100;

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      {/* Navbar */}
      <CourseNavbar courseTitle={`${formattedTitle} ${assessmentType === "pre" ? "Pre-Assessment" : "Post-Assessment"}`} />

      {/* Title */}
      <div className="text-center py-4 md:py-8 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-2">
          {assessmentType === "pre" ? "Pre-Assessment Complete!" : "Post-Assessment Complete!"}
        </h1>
        <h2 className="text-xl md:text-3xl font-semibold text-black">
          {formattedTitle}
        </h2>
      </div>

      {/* Main Box */}
      <div className="flex justify-center items-center px-4 pb-6 md:p-1 mt-8 md:mt-0">
        <div className="max-w-5xl w-full">
          <div className="bg-white border-4 border-gray-400 rounded-xl shadow-xl relative">
            {/* Teki floating */}
            <div className="absolute -top-16 -right-4 z-10 md:-top-28 md:-right-20">
              <img
                src={Teki1}
                alt="Teki"
                className="w-40 h-40 md:w-72 md:h-72 drop-shadow-lg"
              />
            </div>

            {/* Inner Content */}
            <div className="p-4 pt-10 md:p-10 md:pt-16">
              {/* Teki name */}
              <div className="mb-3 md:mb-4">
                <span className="bg-green-600 text-white px-3 py-1 md:px-6 md:py-2 rounded-full text-base md:text-2xl font-bold inline-flex items-center gap-2">
                  {!isProcessing && <ResultIcon className="w-4 h-4 md:w-6 md:h-6" />}
                  Teki
                </span>
              </div>

              {/* Message box */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 md:p-8 mb-4 md:mb-8 min-h-[140px] md:min-h-[200px] text-center">
                <p className="text-base md:text-2xl text-black leading-relaxed mb-2">
                  {resultMessage.main}
                  {isProcessing && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ...
                    </motion.span>
                  )}
                </p>
                <p className="text-sm md:text-xl text-gray-700 italic">
                  {resultMessage.sub}
                  {isProcessing && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    >
                      ...
                    </motion.span>
                  )}
                </p>

                {/* Loading state */}
                {isProcessing && (
                  <motion.div
                    className="mt-4 md:mt-6 flex items-center justify-center gap-2 md:gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600 animate-spin" />
                    <span className="text-sm md:text-lg text-blue-600 font-medium flex items-center gap-2">
                      <ProcessingIcon className="w-4 h-4 md:w-5 md:h-5" />
                      {assessmentType === "pre"
                        ? "Analyzing your knowledge..."
                        : "Evaluating your mastery..."}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Score box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 md:px-8 md:py-4 mb-4 md:mb-6 text-center">
                <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Your Score</h3>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  {score}/{totalQuestions}
                </div>
                <div className="text-sm md:text-lg text-gray-600 mt-1">
                  ({percentage.toFixed(0)}%)
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3 md:mt-4">
                  <motion.div
                    className={`h-3 rounded-full ${
                      percentage >= 75
                        ? "bg-green-500"
                        : percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Continue button */}
              {!isProcessing && (
                <div className="flex justify-center">
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 md:px-12 md:py-4 bg-green-600 text-white text-base md:text-xl font-semibold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Auto redirect notice */}
          {isProcessing && (
            <motion.div
              className="text-center mt-4 md:mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <p className="text-sm md:text-lg text-gray-600">
                Automatically redirecting in a few seconds...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
