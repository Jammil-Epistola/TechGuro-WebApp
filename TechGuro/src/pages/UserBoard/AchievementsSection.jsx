//Enhanced AchievementSection
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Lock, CheckCircle, Filter } from "lucide-react";
import { useUser } from "../../context/UserContext";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AchievementsSection = () => {
  const [filter, setFilter] = useState("all");
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/milestones/${user.user_id}`);
        
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
  }, [user, API_BASE]);

  // Filter logic
  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === "unlocked") return milestone.status === "earned";
    if (filter === "locked") return milestone.status === "not earned";
    return true;
  });

  // Get filter button style
  const getFilterButtonStyle = (buttonFilter) => {
    return filter === buttonFilter 
      ? "bg-[#4C5173] text-white shadow-lg" 
      : "bg-white text-[#4C5173] hover:bg-[#f8f9fa] hover:shadow-md";
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
        <motion.h1 
          className="text-[30px] font-bold mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-8 h-8" />
          MILESTONES
        </motion.h1>
        <motion.div 
          className="text-center text-lg flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-[#4C5173] border-t-transparent rounded-full"
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
      <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
        <motion.h1 
          className="text-[30px] font-bold mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-8 h-8" />
          MILESTONES
        </motion.h1>
        <motion.div 
          className="text-center text-red-600"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>Error loading milestones: {error}</p>
          <motion.button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-3 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors"
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
    <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
      <motion.h1 
        className="text-[30px] font-bold mb-6 flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Trophy className="w-8 h-8 text-yellow-600" />
        MILESTONES
      </motion.h1>

      {/* Filter Buttons */}
      <motion.div 
        className="flex gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
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
      </motion.div>

      {/* No milestones state */}
      {milestones.length === 0 ? (
        <motion.div 
          className="text-center text-gray-600 mt-16 bg-white rounded-xl p-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">No milestones available yet.</p>
          <p className="text-lg">Check back later for new achievements!</p>
        </motion.div>
      ) : (
        /* Milestone Cards */
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
                <div className={`flex items-center bg-white p-6 rounded-xl shadow-lg border-2 transition-all duration-300 ${
                  milestone.status === "earned" 
                    ? "border-green-300 hover:shadow-xl hover:-translate-y-1" 
                    : "border-gray-300 hover:shadow-md"
                }`}>
                  
                  {/* Overlay for Locked */}
                  {milestone.status === "not earned" && (
                    <div className="absolute inset-0 bg-gray-900/60 rounded-xl z-10 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold text-lg">Locked</p>
                      </div>
                    </div>
                  )}

                  {/* Left Image */}
                  <div className="w-20 h-20 mr-6 relative">
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
                        className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#4C5173] mb-2">
                      {milestone.title}
                    </h2>
                    <p className="text-lg text-gray-700 mb-3 leading-relaxed">
                      {milestone.description}
                    </p>
                    
                    {/* Status Display */}
                    <div className="flex items-center gap-2">
                      {milestone.status === "earned" ? (
                        <motion.div
                          className="flex items-center gap-2 text-green-700 font-bold text-lg"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Milestone Achieved!
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-lg">
                          <Lock className="w-5 h-5" />
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
          className="text-center text-gray-600 mt-16 bg-white rounded-xl p-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">
            No {filter === "unlocked" ? "unlocked" : "locked"} milestones found.
          </p>
          <p className="text-lg">Try a different filter to see your milestones!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsSection;