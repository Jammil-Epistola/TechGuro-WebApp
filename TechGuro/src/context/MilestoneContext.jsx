// src/context/MilestoneContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import MilestoneNotification from "../components/MilestoneNotification";

const MilestoneContext = createContext();

export const useMilestone = () => {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error("useMilestone must be used within MilestoneProvider");
  }
  return context;
};

export const MilestoneProvider = ({ children }) => {
  const [milestoneQueue, setMilestoneQueue] = useState([]);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [isShowing, setIsShowing] = useState(false);

  // Show milestone from queue
  useEffect(() => {
    // If already showing a milestone, don't do anything
    if (isShowing) return;

    // If queue has milestones and we're not currently showing one
    if (milestoneQueue.length > 0 && !currentMilestone) {
      const nextMilestone = milestoneQueue[0];
      setCurrentMilestone(nextMilestone);
      setIsShowing(true);
      
      // Remove from queue
      setMilestoneQueue(prev => prev.slice(1));
    }
  }, [milestoneQueue, currentMilestone, isShowing]);

  const showMilestone = (milestone) => {
    // Add to queue if milestone data exists
    if (milestone && milestone.id) {
      setMilestoneQueue(prev => [...prev, milestone]);
    }
  };

  const showMultipleMilestones = (milestones) => {
    // Add multiple milestones to queue at once
    if (Array.isArray(milestones) && milestones.length > 0) {
      setMilestoneQueue(prev => [...prev, ...milestones]);
    }
  };

  const closeMilestone = () => {
    setCurrentMilestone(null);
    setIsShowing(false);
    // Next milestone will show automatically after a brief delay via useEffect
  };

  return (
    <MilestoneContext.Provider value={{ showMilestone, showMultipleMilestones, closeMilestone }}>
      {children}
      <MilestoneNotification
        milestone={currentMilestone}
        onClose={closeMilestone}
      />
    </MilestoneContext.Provider>
  );
};