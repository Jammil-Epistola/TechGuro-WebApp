import React, { useState, useEffect } from "react";
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
        <h1 className="text-[30px] font-bold mb-6">MILESTONES</h1>
        <div className="text-center text-lg">Loading milestones...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
        <h1 className="text-[30px] font-bold mb-6">MILESTONES</h1>
        <div className="text-center text-red-600">
          <p>Error loading milestones: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#4C5173] text-white rounded-md hover:bg-[#3a3f5c]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
      <h1 className="text-[30px] font-bold mb-6">MILESTONES</h1>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md border ${
            filter === "all" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          All Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setFilter("unlocked")}
          className={`px-4 py-2 rounded-md border ${
            filter === "unlocked" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          Unlocked Milestones ({milestones.filter(m => m.status === "earned").length})
        </button>
        <button
          onClick={() => setFilter("locked")}
          className={`px-4 py-2 rounded-md border ${
            filter === "locked" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          Locked Milestones ({milestones.filter(m => m.status === "not earned").length})
        </button>
      </div>

      {/* No milestones state */}
      {milestones.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p className="text-lg">No milestones available yet.</p>
          <p className="text-sm mt-2">Check back later for new achievements!</p>
        </div>
      ) : (
        /* Milestone Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="relative flex items-center bg-[#F9F8FE] text-black p-6 rounded-2xl overflow-hidden border border-[#6B708D]"
            >
              {/* Overlay for Locked */}
              {milestone.status === "not earned" && (
                <div className="absolute inset-0 bg-black opacity-50 z-10 rounded-2xl" />
              )}

              {/* Left Image */}
              <div className="w-[80px] h-[80px] mr-4 z-20 flex items-center justify-center">
                <img
                  src={milestone.icon_url && milestone.icon_url !== "placeholderimg" 
                    ? milestone.icon_url 
                    : placeholderimg
                  }
                  alt={milestone.title}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    e.target.src = placeholderimg;
                  }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 z-20">
                <h2 className="text-[22px] font-bold">{milestone.title}</h2>
                <p className="text-[16px] text-gray-800">{milestone.description}</p>
                
                {/* EXP Reward Display */}
                {milestone.exp_reward > 0 && (
                  <p className="text-[14px] text-blue-300 font-medium mt-1">
                    +{milestone.exp_reward} EXP
                  </p>
                )}
                
                {/* Status Display */}
                <span
                  className={`block text-right font-bold text-[16px] mt-2 ${
                    milestone.status === "earned"
                      ? "text-green-700"
                      : "text-red-300"
                  }`}
                >
                  {milestone.status === "earned" ? "Milestone Achieved!" : "Milestone Locked"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No filtered results */}
      {filteredMilestones.length === 0 && milestones.length > 0 && (
        <div className="text-center text-gray-600 mt-10">
          <p className="text-lg">No {filter === "unlocked" ? "unlocked" : "locked"} milestones found.</p>
          <p className="text-sm mt-2">Try a different filter to see your milestones!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;