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

  const getProcessingIcon = () => {
    return assessmentType === "pre" ? Brain : TrendingUp;
  };

  const getResultIcon = () => {
    if (assessmentType === "pre") {
      return CheckCircle;
    } else {
      const percentage = (score / totalQuestions) * 100;
      return percentage >= 75 ? CheckCircle : RotateCcw;
    }
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();
  const resultMessage = getResultMessage();
  const ProcessingIcon = getProcessingIcon();
  const ResultIcon = getResultIcon();
  const percentage = (score / totalQuestions) * 100;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  };

  const scoreVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        delay: 0.3
      }
    }
  };

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      {/* CourseNavbar */}
      <CourseNavbar courseTitle={`${formattedTitle} ${assessmentType === "pre" ? "Pre-Assessment" : "Post-Assessment"}`} />
      
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-black mb-2">
          {assessmentType === "pre" ? "Pre-Assessment Complete!" : "Post-Assessment Complete!"}
        </h1>
        <h2 className="text-2xl text-black">
          {formattedTitle}
        </h2>
      </motion.div>

      <div className="flex justify-center items-center p-1">
        <motion.div 
          className="max-w-5xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Visual Novel Style Results Box */}
          <div className="bg-white border-4 border-gray-400 rounded-xl shadow-xl relative">
            {/* Large Teki Character with bounce animation*/}
            <motion.div 
              className="absolute -top-30 -right-20 z-20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 150,
                delay: 0.2
              }}
            >
              <img 
                src={Teki1} 
                alt="Teki" 
                className="w-75 h-75 drop-shadow-lg" 
              />
            </motion.div>
            
            {/* Results Content Container */}
            <div className="p-10 pt-16">
              {/* Character Name with slide animation */}
              <motion.div 
                className="mb-4"
                variants={itemVariants}
              >
                <span className="bg-green-600 text-white px-6 py-2 rounded-full text-2xl font-bold inline-flex items-center gap-2">
                  {!isProcessing && <ResultIcon className="w-6 h-6" />}
                  Teki
                </span>
              </motion.div>
              
              {/* Results Text Box */}
              <motion.div 
                className="bg-gray-50 border-2 border-gray-300 rounded-lg p-1 mb-3 min-h-[100px]"
                variants={itemVariants}
              >
                <motion.p 
                  className="text-2xl text-black leading-relaxed mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {resultMessage.main}
                  {isProcessing && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ...
                    </motion.span>
                  )}
                </motion.p>
                
                <motion.p 
                  className="text-xl text-gray-700 leading-relaxed italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {resultMessage.sub}
                  {isProcessing && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    >
                      ...
                    </motion.span>
                  )}
                </motion.p>

                {/* Processing Animation */}
                {isProcessing && (
                  <motion.div 
                    className="mt-6 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-blue-600" />
                      </motion.div>
                      <span className="text-lg text-blue-600 font-medium flex items-center gap-2">
                        <ProcessingIcon className="w-5 h-5" />
                        {assessmentType === "pre" ? "Analyzing your knowledge level" : "Calculating your mastery progress"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Score Display with animated progress */}
              <motion.div 
                className="bg-blue-50 border-2 border-blue-200 rounded-lg px-25 py-3 mb-4"
                variants={itemVariants}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-2">Your Score</h3>
                  <motion.div 
                    className="text-4xl font-bold text-blue-600"
                    variants={scoreVariants}
                  >
                    {score}/{totalQuestions}
                  </motion.div>
                  <motion.div 
                    className="text-lg text-gray-600 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    ({percentage.toFixed(0)}%)
                  </motion.div>
                  
                  {/* Animated progress bar */}
                  <motion.div 
                    className="w-full bg-gray-200 rounded-full h-3 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div 
                      className={`h-3 rounded-full ${
                        percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Continue Button (only when processing is done) */}
              {!isProcessing && (
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <motion.button
                    onClick={onComplete}
                    className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg inline-flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Continue
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Auto-continue message when processing */}
          {isProcessing && (
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <p className="text-lg text-gray-600">
                Automatically redirecting in a few seconds...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentResults;