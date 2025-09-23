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
          {/* Black Overlay with 50% opacity */}
          <div className="absolute inset-0 bg-black opacity-50" />
          
          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 border-4 border-gray-400"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="p-8">
              {/* Top Section: Teki Image and Confirmation Message */}
              <div className="flex items-center gap-6 mb-8">
                {/* Left: Teki Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={Teki1} 
                    alt="Teki" 
                    className="w-35 h-35 drop-shadow-lg" 
                  />
                </div>
                
                {/* Right: Confirmation Message */}
                <div className="flex-1">
                  <div className="mb-3">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-xl font-bold">
                      Teki
                    </span>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                    <p className="text-xl text-black leading-relaxed">
                      Sigurado ka na ba sa lahat ng inyong mga sagot? Kapag nai-submit mo na ito, hindi mo na ito mababago.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section: Confirm and Cancel Buttons */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105 shadow-lg"
                  }`}
                >
                  Hindi
                </button>
                
                <button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg"
                  }`}
                >
                  {isSubmitting ? "Sinusubmit..." : "Oo"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitConfirmationModal;