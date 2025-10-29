//AchievementSection
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Lock, CheckCircle, Filter, ChevronDown } from "lucide-react";
import { useUser } from "../../context/UserContext";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";
import API_URL from '../config/api';

const AchievementsSection = () => {
  const [filter, setFilter] = useState("all");
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/milestones/${user.user_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch milestones: ${response.status}`);
        }

        const data = await response.json();
        setMilestones(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [user, API_URL]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter logic
  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === "unlocked") return milestone.status === "earned";
    if (filter === "locked") return milestone.status === "not earned";
    return true;
  });

  // Get filter display name
  const getFilterDisplayName = () => {
    if (filter === "all") return `All Milestones (${milestones.length})`;
    if (filter === "unlocked") return `Unlocked (${milestones.filter(m => m.status === "earned").length})`;
    if (filter === "locked") return `Locked (${milestones.filter(m => m.status === "not earned").length})`;
  };

  // Get filter button style
  const getFilterButtonStyle = (buttonFilter) => {
    return filter === buttonFilter 
      ? "bg-[#4C5173] text-white shadow-lg" 
      : "bg-white text-[#4C5173] hover:bg-[#f8f9fa] hover:shadow-md";
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#DFDFEE] p-4 md:p-6 min-h-screen text-[#4C5173]">
        <motion.h1 
          className="text-[24px] md:text-[30px] font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-6 h-6 md:w-8 md:h-8" />
          MILESTONES
        </motion.h1>
        <motion.div 
          className="text-center text-base md:text-lg flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#4C5173] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Loading milestones...
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#DFDFEE] p-4 md:p-6 min-h-screen text-[#4C5173]">
        <motion.h1 
          className="text-[24px] md:text-[30px] font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-6 h-6 md:w-8 md:h-8" />
          MILESTONES
        </motion.h1>
        <motion.div 
          className="text-center text-red-600"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm md:text-base">Error loading milestones: {error}</p>
          <motion.button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 md:px-6 md:py-3 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors text-sm md:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#DFDFEE] p-4 md:p-6 min-h-screen text-[#4C5173]">
      <motion.h1 
        className="text-[24px] md:text-[30px] font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
        MILESTONES
      </motion.h1>

      {/* Filter Section */}
      <motion.div 
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Mobile: Dropdown */}
        <div className="md:hidden relative filter-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-[#4C5173] rounded-lg font-semibold text-base"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{getFilterDisplayName()}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#4C5173] rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  setFilter("all");
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-semibold text-base transition-colors ${
                  filter === "all" ? "bg-[#4C5173] text-white" : "hover:bg-gray-100"
                }`}
              >
                All Milestones ({milestones.length})
              </button>
              <button
                onClick={() => {
                  setFilter("unlocked");
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-semibold text-base transition-colors ${
                  filter === "unlocked" ? "bg-[#4C5173] text-white" : "hover:bg-gray-100"
                }`}
              >
                Unlocked ({milestones.filter(m => m.status === "earned").length})
              </button>
              <button
                onClick={() => {
                  setFilter("locked");
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-semibold text-base transition-colors ${
                  filter === "locked" ? "bg-[#4C5173] text-white" : "hover:bg-gray-100"
                }`}
              >
                Locked ({milestones.filter(m => m.status === "not earned").length})
              </button>
            </div>
          )}
        </div>

        {/* Desktop: Buttons */}
        <div className="hidden md:flex gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="w-5 h-5" />
            Filter:
          </div>
          <motion.button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-lg border-2 font-semibold text-lg transition-all ${getFilterButtonStyle("all")}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            All Milestones ({milestones.length})
          </motion.button>
          <motion.button
            onClick={() => setFilter("unlocked")}
            className={`px-6 py-3 rounded-lg border-2 font-semibold text-lg transition-all ${getFilterButtonStyle("unlocked")}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Unlocked ({milestones.filter(m => m.status === "earned").length})
          </motion.button>
          <motion.button
            onClick={() => setFilter("locked")}
            className={`px-6 py-3 rounded-lg border-2 font-semibold text-lg transition-all ${getFilterButtonStyle("locked")}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Locked ({milestones.filter(m => m.status === "not earned").length})
          </motion.button>
        </div>
      </motion.div>

      {/* No milestones state */}
      {milestones.length === 0 ? (
        <motion.div 
          className="text-center text-gray-600 mt-12 md:mt-16 bg-white rounded-xl p-6 md:p-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
          <p className="text-lg md:text-xl font-semibold mb-2">No milestones available yet.</p>
          <p className="text-base md:text-lg">Check back later for new achievements!</p>
        </motion.div>
      ) : (
        /* Milestone Cards */
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  layout: { duration: 0.3 }
                }}
                className="relative group"
              >
                <div className={`flex items-center bg-white p-4 md:p-6 rounded-xl shadow-lg border-2 transition-all duration-300 ${
                  milestone.status === "earned" 
                    ? "border-green-300 hover:shadow-xl hover:-translate-y-1" 
                    : "border-gray-300 hover:shadow-md"
                }`}>
                  
                  {/* Overlay for Locked */}
                  {milestone.status === "not earned" && (
                    <div className="absolute inset-0 bg-gray-900/60 rounded-xl z-10 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" />
                        <p className="font-bold text-base md:text-lg">Locked</p>
                      </div>
                    </div>
                  )}

                  {/* Left Image */}
                  <div className="w-16 h-16 md:w-20 md:h-20 mr-4 md:mr-6 relative flex-shrink-0">
                    <motion.img
                      src={milestone.icon_url && milestone.icon_url !== "placeholderimg" 
                        ? milestone.icon_url 
                        : placeholderimg
                      }
                      alt={milestone.title}
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        e.target.src = placeholderimg;
                      }}
                      whileHover={milestone.status === "earned" ? { scale: 1.1 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    {milestone.status === "earned" && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Details  */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-[#4C5173] mb-1 md:mb-2 break-words">
                      {milestone.title}
                    </h2>
                    <p className="text-sm md:text-lg text-gray-700 mb-2 md:mb-3 leading-relaxed break-words">
                      {milestone.description}
                    </p>
                    
                    {/* Status Display */}
                    <div className="flex items-center gap-2">
                      {milestone.status === "earned" ? (
                        <motion.div
                          className="flex items-center gap-1.5 md:gap-2 text-green-700 font-bold text-sm md:text-lg"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                          Milestone Achieved!
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 font-bold text-sm md:text-lg">
                          <Lock className="w-4 h-4 md:w-5 md:h-5" />
                          Milestone Locked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* No filtered results */}
      {filteredMilestones.length === 0 && milestones.length > 0 && (
        <motion.div 
          className="text-center text-gray-600 mt-12 md:mt-16 bg-white rounded-xl p-6 md:p-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Filter className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
          <p className="text-lg md:text-xl font-semibold mb-2">
            No {filter === "unlocked" ? "unlocked" : "locked"} milestones found.
          </p>
          <p className="text-base md:text-lg">Try a different filter to see your milestones!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsSection;