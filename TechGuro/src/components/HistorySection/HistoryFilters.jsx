import React from "react";
import { motion } from "motion/react";
import { Filter, RotateCcw } from "lucide-react";
import { COURSES, QUIZ_TYPES } from "../../utility/historyConstants";

const HistoryFilters = ({ activeTab, filters, setFilters, resetFilters }) => {
  return (
    <motion.div
      className="bg-white rounded-lg p-6 mb-6 border border-[#6B708D]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-[#4C5173]" />
        <h3 className="text-lg font-semibold text-[#4C5173]">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Course Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <select
            value={filters.course}
            onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value }))}
            className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Courses</option>
            {COURSES.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        {/* Quiz Type */}
        {activeTab === "quizzes" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Type</label>
            <select
              value={filters.quizType}
              onChange={(e) => setFilters((prev) => ({ ...prev, quizType: e.target.value }))}
              className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              {QUIZ_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
            className="w-full border text-black  border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
        </div>
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="w-full border text-black  border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="highScore">Highest Score</option>
            <option value="lowScore">Lowest Score</option>
          </select>
        </div>
      </div>
      <motion.button
        onClick={resetFilters}
        className="mt-4 flex items-center gap-2 text-[#4C5173]"
      >
        <RotateCcw size={16} />
        Reset Filters
      </motion.button>
    </motion.div>
  );
};

export default HistoryFilters;
