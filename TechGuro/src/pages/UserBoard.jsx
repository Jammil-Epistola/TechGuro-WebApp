import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaTrophy,
  FaBolt,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import DashboardSection from "./UserBoard/DashboardSection";
import AchievementsSection from "./UserBoard/AchievementsSection";
import CoursesSection from "./UserBoard/CoursesSection";
import TopNavbar from "./UserBoard/TopNavbar";
import tgLogo from "../assets/TechGuroLogo_3.png";

const UserBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, logout } = useUser();

  // Calculate experience progress and level
  const expNeeded = user ? Math.floor(100 * Math.pow(1.3, user.level - 1)) : 100;
  const expProgress = user ? Math.min((user.exp / expNeeded) * 100, 100) : 0;
  const level = user ? user.level : 1;
  const dayStreak = 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "USER DASHBOARD";
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
      case "courses":
        return <CoursesSection />;
      case "achievements":
        return <AchievementsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[300px] sticky top-0 h-screen bg-[#BFC4D7] flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <img src={tgLogo} alt="TechGuro Logo" className="w-20 h-20" />
            <h1 className="font-bold text-black" style={{ fontSize: "35px" }}>
              TechGuro.
            </h1>
          </div>

          {/* Streak/Level Box */}
          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-3 mb-6">
            <div className="flex items-center text-black mb-2" style={{ fontSize: "25px", fontWeight: 500 }}>
              <FaBolt className="mr-2" /> {dayStreak} day streak
            </div>

            <div className="h-[5px] bg-[#6B708D] mb-3" />

            <div className="flex items-center justify-between mb-2 text-black" style={{ fontSize: "25px", fontWeight: 500 }}>
              <span>Level {level}</span>
              <FaInfoCircle title="EXP increases as you complete lessons and tasks." />
            </div>

            <div className="w-full h-6 border border-black rounded-full overflow-hidden relative">
              <div
                className="bg-[#6B708D] h-full"
                style={{ width: `${expProgress}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {user?.exp || 0} / 100 EXP
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-5 text-black font-bold">
            <button
              className={`text-left px-4 py-5 rounded-md ${activeSection === "courses" ? "bg-[#F4EDD9]" : "hover:bg-[#e0e3ee]"
                }`}
              onClick={() => setActiveSection("courses")}
              style={{ fontSize: "35px" }}
            >
              Courses
            </button>
            <button
              className={`text-left px-4 py-5 rounded-md ${activeSection === "dashboard" ? "bg-[#F4EDD9]" : "hover:bg-[#e0e3ee]"
                }`}
              onClick={() => setActiveSection("dashboard")}
              style={{ fontSize: "35px" }}
            >
              Dashboard
            </button>
            <button
              className={`text-left px-4 py-5 rounded-md ${activeSection === "achievements" ? "bg-[#F4EDD9]" : "hover:bg-[#e0e3ee]"
                }`}
              onClick={() => setActiveSection("achievements")}
              style={{ fontSize: "35px" }}
            >
              Milestones
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-black/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 font-bold hover:opacity-80"
            style={{ fontSize: "30px" }}
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen overflow-y-auto bg-[#DFDFEE]">
        <TopNavbar title={getSectionTitle()} />
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default UserBoard;
