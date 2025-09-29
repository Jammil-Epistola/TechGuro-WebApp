import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, BookOpen, BarChart3, Award, History, ChevronRight } from "lucide-react";
import DashboardSection from "./UserBoard/DashboardSection";
import AchievementsSection from "./UserBoard/AchievementsSection";
import CoursesSection from "./UserBoard/CoursesSection";
import HistorySection from "./UserBoard/HistorySection";
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

  const navigateToSection = (sectionName) => {
    setActiveSection(sectionName);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection goToProfile={dashboardKey} navigateToSection={navigateToSection} />;
      case "courses":
        return <CoursesSection />;
      case "achievements":
        return <AchievementsSection navigateToSection={navigateToSection}/>;
      case "history":
        return <HistorySection />;
      default:
        return <DashboardSection goToProfile={dashboardKey} navigateToSection={navigateToSection} />;
    }
  };

  const goToProfileSection = () => {
    setActiveSection("dashboard");
    setDashboardKey(prev => prev + 1);
  };

  // Navigation items with icons
  const navigationItems = [
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      id: "dashboard", 
      label: "Dashboard",
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      id: "achievements",
      label: "Milestones", 
      icon: Award,
      color: "text-yellow-600"
    },
    {
      id: "history",
      label: "History",
      icon: History,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="flex">
      {/* Enhanced Sidebar */}
      <div className="w-[280px] sticky top-0 h-screen bg-gradient-to-b from-[#BFC4D7] to-[#A8B0C8] flex flex-col justify-between p-6 shadow-xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={tgLogo} 
            alt="TechGuro Logo" 
            className="w-32 h-32 mb-3"
          />
          <span className="font-bold text-[#1A202C] text-[35px] mb-5">
            TechGuro.
          </span>
          <div className="border-t-2 border-[#1A202C]/30 w-full" />
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.button
                key={item.id}
                className={`group relative flex items-center gap-4 px-3 py-5 rounded-xl font-bold text-[32px] text-left transition-all duration-200 ${
                  isActive 
                    ? "bg-[#F4EDD9] shadow-lg border-2 border-[#B6C44D]" 
                    : "hover:bg-white/20"
                }`}
                onClick={() => setActiveSection(item.id)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive 
                    ? "bg-white shadow-md" 
                    : "bg-white/10"
                }`}>
                  <Icon 
                    className={`w-7 h-7 ${
                      isActive ? item.color : "text-[#1A202C]"
                    }`} 
                  />
                </div>

                {/* Label */}
                <span className="flex-1 text-[#1A202C]">
                  {item.label}
                </span>

                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Logout Section */}
        <div className="space-y-4">
          <div className="border-t-2 border-[#1A202C]/30 w-full" />
          
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center gap-3 w-full px-6 py-4 text-red-600 font-bold text-[28px] rounded-xl transition-all duration-200 hover:bg-red-50"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <span className="group-hover:text-red-700 transition-colors">
              Sign Out
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar goToProfileSection={goToProfileSection} />

        {/* Scrollable Content - NO ANIMATIONS */}
        <div className="flex-1 overflow-y-auto bg-[#DFDFEE] p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserBoard;