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
          className="fixed top-6 left-1/2 z-50"
          initial={{ y: -100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            key={message}
            className={`bg-white border-2 border-[#6B708D] rounded-2xl shadow-lg p-4 flex items-center gap-4 max-w-lg ${
              highlight ? "ring-2 ring-red-500" : ""
            }`}
            animate={highlight ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <img
              src={teki_img}
              alt="Teki"
              className="w35 h-35 rounded-full"
            />
            <div className="flex-1">
              <p className="font-bold text-[25px] text-[#4C5173]">Teki</p>
              <p className="text-[20px] text-black">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-10 h-10 text-gray-600" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TekiDialog;
