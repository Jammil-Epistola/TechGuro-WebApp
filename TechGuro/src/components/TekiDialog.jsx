// src/components/TekiDialog.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import teki_img from "../assets/Teki 1.png";

const TekiDialog = ({ message, onClose }) => {
  const [highlight, setHighlight] = useState(false);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  // Trigger highlight effect if message changes while already showing
  useEffect(() => {
    if (message) {
      setHighlight(true);
      const timeout = setTimeout(() => setHighlight(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed z-50 left-1/2 transform -translate-x-1/2 
                     top-6 sm:top-6 sm:bottom-auto 
                     bottom-4 sm:bottom-auto 
                     w-[90%] sm:w-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            key={message}
            className={`bg-white border-2 border-[#6B708D] rounded-2xl shadow-lg 
                        p-3 sm:p-4 flex items-center gap-3 sm:gap-4 
                        max-w-lg mx-auto 
                        ${highlight ? "ring-2 ring-red-500" : ""}`}
            animate={highlight ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <img
              src={teki_img}
              alt="Teki"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg sm:text-[25px] text-[#4C5173] leading-tight">
                Teki
              </p>
              <p className="text-sm sm:text-[20px] text-black break-words leading-snug">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition flex-shrink-0"
            >
              <X className="w-6 h-6 sm:w-10 sm:h-10 text-gray-600" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TekiDialog;
