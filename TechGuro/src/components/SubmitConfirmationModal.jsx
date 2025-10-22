// src/components/SubmitConfirmationModal.jsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Teki1 from "../assets/Teki 1.png";

const SubmitConfirmationModal = ({ isOpen, onConfirm, onCancel, isSubmitting }) => {
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
          <div className="absolute inset-0 bg-black opacity-50" />

          {/* Modal box */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-[90%] mx-4 border-4 border-gray-400 p-6 sm:p-8 flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Teki image + name (side by side, left-aligned) */}
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

            {/* Message (centered) */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 sm:p-6 text-center mb-6">
              <p className="text-base sm:text-lg text-black leading-relaxed">
                Sigurado ka na ba sa lahat ng inyong mga sagot? <br />
                Kapag nai-submit mo na ito, hindi mo na ito mababago.
              </p>
            </div>

            {/* Buttons (side by side, centered) */}
            <div className="flex justify-center gap-4 w-full">
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className={`flex-1 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105 shadow-md"
                }`}
              >
                Hindi
              </button>

              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className={`flex-1 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-md"
                }`}
              >
                {isSubmitting ? "Sinusubmit..." : "Oo"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitConfirmationModal;
