// src/components/LessonsCompletionModal.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Teki1 from "../assets/Teki 1.png";
import { Trophy, Target } from "lucide-react";

const LessonsCompletionModal = ({ isOpen, onClose, onSeeQuizzes }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dim background */}
          <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

          {/* Modal box */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-[90%] mx-4 border-4 border-yellow-400 p-6 sm:p-8 flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Celebration Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Teki image + name */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={Teki1}
                alt="Teki"
                className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
              />
              <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-lg sm:text-xl font-bold">
                Teki
              </span>
            </div>

            {/* Message */}
            <div className="bg-gradient-to-br from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-3">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center mb-4">
                You've completed all your recommended lessons!
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-gray-800">Post-Assessment is now unlocked!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    We recommend taking practice quizzes before you proceed!
                  </span>
                </div>
              </div>

              <p className="text-sm text-center text-gray-600 italic">
                Check the <span className="font-bold text-blue-600">Quiz Section</span> in the Side Navbar!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-semibold transition-all bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105 shadow-md"
              >
                Okay
              </button>

              <button
                onClick={onSeeQuizzes}
                className="flex-1 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 shadow-md"
              >
                See Quizzes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LessonsCompletionModal;