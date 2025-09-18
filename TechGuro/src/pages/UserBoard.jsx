import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
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
  const [dashboardKey, setDashboardKey] = useState(0);
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection goToProfile={dashboardKey} />;
      case "courses":
        return <CoursesSection />;
      case "achievements":
        return <AchievementsSection />;
      default:
        return <DashboardSection goToProfile={dashboardKey} />;
    }
  };

  const goToProfileSection = () => {
    setActiveSection("dashboard");
    setDashboardKey(prev => prev + 1);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className="w-[240px] sticky top-0 h-screen bg-[#BFC4D7] flex flex-col justify-between p-4"
        style={{
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)"
        }}
      >

        {/* Top */}
        <div className="flex flex-col items-center mb-6">
          <img src={tgLogo} alt="TechGuro Logo" className="w-30 h-30 mb-2" />
          <span className="font-bold text-black text-[35px] mb-5">TechGuro.</span>
          <div className="border-t border-black/50 w-full"></div>
        </div>

        {/* Middle */}
        <div className="flex-1 flex flex-col gap-5 text-black font-bold">
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

        {/* Bottom */}
        <div className="flex flex-col gap-3">
          <div className="border-t border-black/50 my-2 w-full"></div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 font-bold hover:opacity-80"
            style={{ fontSize: "30px" }}
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar goToProfileSection={goToProfileSection} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#DFDFEE] p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserBoard;
