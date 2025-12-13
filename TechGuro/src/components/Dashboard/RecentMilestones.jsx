// src/components/Dashboard/RecentMilestones.jsx
import React from "react";
import { motion } from "motion/react";
import { Award } from "lucide-react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const RecentMilestones = ({ 
  milestones, 
  allMilestonesData, 
  milestonesLoading, 
  milestonesError, 
  navigateToSection 
}) => {
  return (
    <motion.div
      className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 cursor-pointer hover:bg-[#f0f0ff] flex flex-col"
      onClick={() => navigateToSection("achievements")}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-6 h-6 text-[#4C5173]" />
        <h2 className="text-[25px] font-bold text-left">Recent Milestones:</h2>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        {milestonesLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full"
          />
        ) : milestonesError ? (
          <p className="text-red-600">Error loading milestones</p>
        ) : milestones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-[18px] font-semibold">Walang milestone na nakamit pa</p>
            <p className="text-sm text-gray-600 mt-1">No milestones achieved yet</p>
          </motion.div>
        ) : (
          <motion.div
            className="text-center w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {/* Latest Milestone */}
            <motion.img
              src={milestones[0]?.icon_url || placeholderimg}
              alt={milestones[0]?.title || "Milestone"}
              className="w-20 h-20 rounded-full border border-black mb-2 mx-auto"
              onError={(e) => {
                e.target.src = placeholderimg;
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <p className="text-[18px] font-semibold">{milestones[0].title}</p>

            {/* Task Completion Rate for Milestones */}
            <div className="mt-3 w-full">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[#4C5173] font-semibold">Milestone Completion:</span>
                <span className="text-[#4C5173] font-bold">
                  {milestones.length}/{allMilestonesData.length}
                  ({Math.round((milestones.length / Math.max(allMilestonesData.length, 1)) * 100)}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <motion.div
                  className="bg-[#4C5173] h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(milestones.length / Math.max(allMilestonesData.length, 1)) * 100}%`
                  }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-2">
                {milestones.length}/{allMilestonesData.length} mga milestone na-unlock •
                {allMilestonesData.length - milestones.length} pa ang natitira
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentMilestones;