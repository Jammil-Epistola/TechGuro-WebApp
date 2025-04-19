import React, { useState } from "react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AchievementsSection = () => {
  // Define achievements data
  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      status: "Achievement Get!",
      image: placeholderimg
    },
    {
      title: "Quick Learner",
      description: "Complete 5 lessons in a day",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Perfect Score",
      description: "Get 100% on any quiz",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Course Master",
      description: "Complete all lessons in a course",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Tech Explorer",
      description: "Visit all sections of the platform",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Practice Makes Perfect",
      description: "Complete 10 practice quizzes",
      status: "Achievement Locked",
      image: placeholderimg
    }
  ];

  return (
    <div className="achievement-container">
      <h1 className="achievement-title">ACHIEVEMENTS</h1>
      <div className="achievement-list">
        {achievements.map((achievement, index) => (
          <div 
            key={index} 
            className={`achievement-card ${achievement.status === "Achievement Locked" ? 'locked' : ''}`}
          >
            {/* Left Side: Image */}
            <div className="achievement-left">
              <img src={achievement.image} alt={`${achievement.title} Icon`} className="achievement-icon" />
            </div>

            {/* Separator Line */}
            <div className="achievement-separator"></div>

            {/* Right Side: Description and Status */}
            <div className="achievement-right">
              <h2 className="achievement-name">{achievement.title}</h2>
              <p className="achievement-description">{achievement.description}</p>
              <span 
                className={`achievement-status ${achievement.status === "Achievement Get!" ? "achieved" : "locked"}`}
              >
                {achievement.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsSection; 