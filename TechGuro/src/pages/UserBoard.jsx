import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChartLine,
  FaQuestionCircle,
  FaBook,
  FaTrophy,
  FaSignOutAlt,
} from "react-icons/fa";
import DashboardSection from "./UserBoard/DashboardSection";
import PerformanceSection from "./UserBoard/PerformanceSection";
import QuizzesSection from "./UserBoard/QuizzesSection";
import AchievementsSection from "./UserBoard/AchievementsSection";
import CoursesSection from "./UserBoard/CoursesSection";
import TopNavbar from "./UserBoard/TopNavbar";
import tekiLogo from "../assets/Home/Teki 1.png";
import "./UserBoard/UserBoard.css";

const UserBoard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "USER DASHBOARD";
      case "performance":
        return "PERFORMANCE";
      case "quizzes":
        return "QUIZ OVERVIEW";
      case "courses":
        return "COURSE SELECTION";
      case "achievements":
        return "MILESTONES";
      default:
        return "USER DASHBOARD";
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "performance":
        return <PerformanceSection />;
      case "quizzes":
        return <QuizzesSection />;
      case "courses":
        return <CoursesSection />;
      case "achievements":
        return <AchievementsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="user-board-wrapper">
      {/* Logo and Sidebar */}
      <div className="sidebar">
        {/* Logo Container */}
        <div className="logo-container">
          <img src={tekiLogo} alt="TechGuro Logo" className="logo-image" />
          <h1 className="logo-text">TechGuro</h1>
        </div>

        {/* Nav Links */}
        <nav className="nav-links">
          <button 
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <FaTachometerAlt /> <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "performance" ? "active" : ""}`}
            onClick={() => setActiveSection("performance")}
          >
            <FaChartLine /> <span>Performance</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveSection("quizzes")}
          >
            <FaQuestionCircle /> <span>Quizzes</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "courses" ? "active" : ""}`}
            onClick={() => setActiveSection("courses")}
          >
            <FaBook /> <span>Courses</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "achievements" ? "active" : ""}`}
            onClick={() => setActiveSection("achievements")}
          >
            <FaTrophy /> <span>Milestones</span>
          </button>
          
          <hr className="footer-separator" />
          <Link to="/" className="nav-item logout">
            <FaSignOutAlt /> <span>Sign Out</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Remove the built-in top navbar and use our TopNavbar component */}
        <TopNavbar title={getSectionTitle()} />
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserBoard;
