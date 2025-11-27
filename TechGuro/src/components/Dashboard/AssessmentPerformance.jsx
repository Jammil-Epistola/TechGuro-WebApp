// src/components/Dashboard/AssessmentPerformance.jsx
import React from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

const AssessmentPerformance = ({
  courses,
  selectedCourse,
  setSelectedCourse,
  selectedAssessment,
  setSelectedAssessment,
  preAssessment,
  postAssessment,
  totalQuestions,
  openResultsModal
}) => {
  const hasTakenAssessment = Boolean(
    (selectedAssessment === "Pre-Assessment" ? preAssessment : postAssessment)
  );

  return (
    <motion.div
      className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[240px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-[#4C5173]" />
        <h2 className="text-[25px] font-bold">Assessment Scores:</h2>
      </div>

      {/* Course DropDown */}
      <motion.select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3"
        whileFocus={{ scale: 1.02 }}
      >
        {courses.map((course) => <option key={course}>{course}</option>)}
      </motion.select>

      {/* Assessment DropDown */}
      <motion.select
        value={selectedAssessment}
        onChange={(e) => setSelectedAssessment(e.target.value)}
        className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3"
        whileFocus={{ scale: 1.02 }}
      >
        <option>Pre-Assessment</option>
        <option>Post-Assessment</option>
      </motion.select>

      {/* Assessment Tasks Completed */}
      <div className="mb-3 text-center">
        <span className="text-[#4C5173] font-bold text-[18px]">
          Assessment Tasks Completed: {(preAssessment ? 1 : 0) + (postAssessment ? 1 : 0)}/2
          ({Math.round(((preAssessment ? 1 : 0) + (postAssessment ? 1 : 0)) / 2 * 100)}%)
        </span>
      </div>

      {/* Assessment Task Status: Shows only selected assessment */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="text-sm font-semibold text-[#4C5173] mb-1">Assessment Task Status:</div>
        <div className="flex items-center gap-1">
          {selectedAssessment === "Pre-Assessment" ? (
            <>
              <span className={preAssessment ? "text-green-600" : "text-gray-500"}>
                {preAssessment ? "✅" : "❌"}
              </span>
              <span>Pre-Assessment: {preAssessment ? "Tapos na" : "Hindi pa"}</span>
            </>
          ) : (
            <>
              <span className={postAssessment ? "text-green-600" : "text-gray-500"}>
                {postAssessment ? "✅" : "❌"}
              </span>
              <span>Post-Assessment: {postAssessment ? "Tapos na" : "Hindi pa"}</span>
            </>
          )}
        </div>
      </div>

      {/* Show score if assessment is taken */}
      {hasTakenAssessment && (
        <motion.p
          className="text-[18px] text-center mt-3 mb-2"
          key={`${selectedCourse}-${selectedAssessment}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {selectedAssessment === "Pre-Assessment" && preAssessment
            ? `Pre-Assessment: ${Math.round(preAssessment.score)}/${preAssessment.total || totalQuestions}`
            : selectedAssessment === "Post-Assessment" && postAssessment
              ? `Post-Assessment: ${Math.round(postAssessment.score)}/${postAssessment.total || totalQuestions}`
              : ""
          }
        </motion.p>
      )}

      <motion.button
        disabled={!hasTakenAssessment}
        onClick={openResultsModal}
        className={`w-full py-2 rounded-md border-2 border-black text-white font-bold text-[18px] 
          ${hasTakenAssessment ? "bg-[#479DFF]" : "bg-[#8E8E8E]"}`}
        whileHover={hasTakenAssessment ? { scale: 1.02, backgroundColor: "#3A8FEF" } : {}}
        whileTap={hasTakenAssessment ? { scale: 0.98 } : {}}
      >
        See Results
      </motion.button>
    </motion.div>
  );
};

export default AssessmentPerformance;