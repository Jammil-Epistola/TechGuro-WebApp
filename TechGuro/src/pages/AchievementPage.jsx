import React, { useState } from "react";
import MainNavbar from "../MainNavbar";
import "../pagesCSS/AchievementPage.css";
import achievement1 from "../assets/Dashboard/achievement_1.png";
import achievement2 from "../assets/Dashboard/achievement_2.png";
import achievement3 from "../assets/Dashboard/achievement_3.png";
import placholderimg from "../assets/Dashboard/placeholder_teki.png";

const achievements = [
  { image: achievement1, title: "WELCOME TO TECHGURO!", description: "Create an account and log in for the first time.", status: "Achievement Get!" },
  { image: achievement2, title: "GETTING STARTED", description: "Select a course and complete a pre-assessment test.", status: "Achievement Locked" },
  { image: achievement3, title: "FIRST STEPS", description: "Enroll in your first course and complete your first lesson.", status: "Achievement Locked" },
  { image: placholderimg, title: "TECH-SAVVY", description: "Complete the 'About Computer' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "MOBILE USER", description: "Complete the 'About Phone' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "CYBER GUARDIAN", description: "Complete the 'Basic Cybersecurity' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "INTERNET EXPLORER", description: "Complete 'The Internet' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "BUREAUCRACY BOSS", description: "Complete the 'Government Services' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "DIGITAL BOSS", description: "Complete the 'Online Banking' Course", status: "Achievement Locked" },
  { image: placholderimg, title: "TECHGURO GRADUATE", description: "Complete All TechGuro Courses", status: "Achievement Locked" },
];

const AchievementPage = () => {
   const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div className="achievement-container">
      <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />
      <div className="achievement-content">
        <h1 className="achievement-title">ACHIEVEMENTS</h1>
        <div className="achievement-list">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-card">
              {/* Left Side: Image */}
              <div className="achievement-left">
                <img src={achievement.image} alt="Achievement Icon" className="achievement-icon" />
              </div>

              {/* Separator Line */}
              <div className="achievement-separator"></div>

              {/* Right Side: Description and Status */}
              <div className="achievement-right">
                <h2 className="achievement-name">{achievement.title}</h2>
                <p className="achievement-description">{achievement.description}</p>
                <span className={`achievement-status ${achievement.status === "Achievement Get!" ? "achieved" : "locked"}`}>
                  {achievement.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementPage;
