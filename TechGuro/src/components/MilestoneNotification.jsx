// src/components/MilestoneNotification.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, X, Award } from "lucide-react";

const MilestoneNotification = ({ milestone, onClose }) => {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss after 5s with progress bar
  useEffect(() => {
    if (!milestone) return;

    const duration = 5000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return next;
      });
    }, interval);

    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, [milestone, onClose]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className="fixed top-6 right-6 z-50"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-2xl shadow-2xl p-5 flex items-start gap-4 max-w-md relative overflow-hidden border-4 border-yellow-300"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Icon */}
            <div className="relative">
              <motion.div
                className="bg-white rounded-full p-3 shadow-lg"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Trophy className="w-10 h-10 text-amber-600" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Award className="w-6 h-6 text-yellow-200 fill-yellow-200" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 text-white">
              <motion.p
                className="font-bold text-sm uppercase tracking-wider mb-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Milestone Unlocked!
              </motion.p>
              <motion.h3
                className="font-bold text-xl mb-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {milestone.title}
              </motion.h3>
              <motion.p
                className="text-sm text-yellow-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {milestone.description}
              </motion.p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition absolute top-2 right-2"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/50"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneNotification;