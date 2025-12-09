//MobileMenuButton.jsx
import React from "react";
import { motion } from "motion/react";
import { Menu } from "lucide-react";

const MobileMenuButton = ({ onClick }) => {
  return (
    <div className="lg:hidden mb-4 px-4 pt-4">
      <motion.button
        onClick={onClick}
        className="w-full bg-[#4C5173] hover:bg-[#5a5f8a] rounded-lg px-4 py-3 flex items-center justify-center gap-3 shadow-lg transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Menu className="w-5 h-5 text-white" />
        <span className="text-white font-semibold text-[15px]">Open Lesson Menu</span>
      </motion.button>
    </div>
  );
};

export default MobileMenuButton;