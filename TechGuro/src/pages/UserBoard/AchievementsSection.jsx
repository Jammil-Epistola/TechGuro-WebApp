import React, { useState } from "react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AchievementsSection = () => {
  // Define achievements data
  const achievements = [
    {
      title: "Welcome to TechGuro",
      description: "Sign in to TechGuro for the first time.",
      status: "Achievement Get!",
      image: placeholderimg
    },
    {
      title: "First Steps",
      description: "Choose a course and complete the Pre-Assessment.",
      status: "Achievement Get!",
      image: placeholderimg
    },
    {
      title: "First Lesson",
      description: "Complete your first lesson.",
      status: "Achievement Get!",
      image: placeholderimg
    },
    {
      title: "Course Champ",
      description: "Complete all lessons and assessments in a course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Pop Quiz Pro",
      description: "Complete your first quiz.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Perfect Score!",
      description: "Get a perfect 100% on any quiz.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Quiz Machine",
      description: "Get 100% on 6 different quizzes.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Practice Makes Perfect",
      description: "Complete 10 practice quizzes.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "On a Roll!",
      description: "Complete your very first course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Computer Basics Master",
      description: "Finish the Computer Basics course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "File Savvy",
      description: "Complete File & Document Handling course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Office Ninja",
      description: "Complete the Microsoft Essentials course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Web Guardian",
      description: "Complete the Internet Safety course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Fix It Pro",
      description: "Complete the Computer Maintenance course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "Creative Whiz",
      description: "Complete the Creative Tools course.",
      status: "Achievement Locked",
      image: placeholderimg
    },
    {
      title: "TechGuru",
      description: "Complete all TechGuro courses!",
      status: "Achievement Locked",
      image: placeholderimg
    }
  ];

  return (
    <div className="achievement-container">
      <h1 className="achievement-title">MILESTONES</h1>
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