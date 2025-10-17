//AdminBoard.jsx
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Users, DownloadCloud, Trash2, TrendingUp } from "lucide-react";
import { FaCalendar, FaChevronDown } from "react-icons/fa";
import AdminUserTable from "./AdminBoard/AdminUserTable";
import AdminImprovementAnalysis from "./AdminBoard/AdminImprovementAnalysis";
import tgLogo from "../assets/TechGuroLogo_3.png";

const AdminBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("users");
  const { logout, user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".admin-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <AdminUserTable />;
      case "improvement":
        return <AdminImprovementAnalysis />;
      default:
        return <AdminUserTable />;
    }
  };

  // Navigation items with icons
  const navigationItems = [
    {
      id: "users",
      label: "User Management",
      icon: Users,
      color: "text-blue-600"
    },
    {
      id: "improvement",
      label: "Improvement Analysis",
      icon: TrendingUp,
      color: "text-green-600"
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
          <p className="text-[#1A202C] font-semibold text-[14px] mt-3">
            ADMIN PANEL
          </p>
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
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive ? "bg-white shadow-md" : "bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      isActive ? item.color : "text-[#1A202C]"
                    }`}
                  />
                </div>

                {/* Label */}
                <span className="flex-1 text-[#1A202C] text-[18px]">
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
                    ></motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Admin Info Section */}
        <div className="space-y-4">
          <div className="border-t-2 border-[#1A202C]/30 w-full" />
          <div className="text-center text-[#1A202C] text-[14px]">
            <p className="font-semibold">Logged in as</p>
            <p className="font-bold text-[16px] truncate">
              {user?.username || "Admin"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="sticky top-0 z-50 w-full bg-[#4c5173] shadow-md flex justify-between items-center px-10 py-5">
          {/* Left Side - Empty or can add section title */}
          <div className="text-white font-bold text-[24px]">
            {activeSection === "users" ? "User Management" : "Improvement Analysis"}
          </div>

          {/* Right Side - Date and Dropdown */}
          <div className="flex items-center gap-6">
            {/* Calendar */}
            <div className="flex items-center gap-2 text-white text-[16px]">
              <FaCalendar className="text-[20px]" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Separator Line */}
            <div className="w-[1px] h-6 bg-white/30" />

            {/* Dropdown */}
            <div className="relative admin-dropdown">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                onClick={toggleDropdown}
              >
                <span className="text-white font-medium">
                  {user?.username || "Admin"}
                </span>
                <FaChevronDown className="text-white" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-44 z-50 overflow-hidden">
                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#DFDFEE] p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminBoard;