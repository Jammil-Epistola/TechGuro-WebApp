//UserBoard.jsx - Fixed seamless animation
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useMilestone } from "../context/MilestoneContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, BookOpen, BarChart3, Award, History, Menu, X } from "lucide-react";
import { FaUser, FaUserCircle, FaCalendar, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import DashboardSection from "./UserBoard/DashboardSection";
import AchievementsSection from "./UserBoard/AchievementsSection";
import CoursesSection from "./UserBoard/CoursesSection";
import HistorySection from "./UserBoard/HistorySection";
import tgLogo from "../assets/TechGuroLogo_3.png";

const UserBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useUser();
  const { showMilestone } = useMilestone();

  // Initialize sidebar state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  // Handle window resize to update sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check and show Milestone #1
  useEffect(() => {
    const checkFirstLoginMilestone = async () => {
      if (!user || !user.user_id) return;

      try {
        const response = await fetch(`http://localhost:8000/milestones/check/${user.user_id}/1`);
        const data = await response.json();

        if (data.earned) {
          const milestonesResponse = await fetch(`http://localhost:8000/milestones/${user.user_id}`);
          const milestones = await milestonesResponse.json();
          const milestone1 = milestones.find(m => m.id === 1);

          // Only show if notification hasn't been shown before
          if (milestone1 && milestone1.status === "earned" && !milestone1.notification_shown) {
            setTimeout(() => {
              showMilestone(milestone1);
              // Mark as shown in the database
              fetch(`http://localhost:8000/milestones/mark-shown/${user.user_id}/1`, {
                method: 'POST'
              }).catch(err => console.error("Error marking milestone as shown:", err));
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error checking first login milestone:", error);
      }
    };
    checkFirstLoginMilestone();
  }, [user, showMilestone]);

  // Milestone 4-8
  useEffect(() => {
    const checkCourseCompletionMilestones = async () => {
      if (!user || !user.user_id) return;

      const courseCompletionMilestones = [4, 5, 6, 7, 8];
      const newlyEarnedMilestones = [];

      try {
        const milestonesResponse = await fetch(`http://localhost:8000/milestones/${user.user_id}`);
        const milestones = await milestonesResponse.json();

        for (const milestoneId of courseCompletionMilestones) {
          const milestone = milestones.find(m => m.id === milestoneId);

          // Only show if earned and notification hasn't been shown
          if (milestone && milestone.status === "earned" && !milestone.notification_shown) {
            newlyEarnedMilestones.push(milestone);
            // Mark as shown in the database
            fetch(`http://localhost:8000/milestones/mark-shown/${user.user_id}/${milestoneId}`, {
              method: 'POST'
            }).catch(err => console.error("Error marking milestone as shown:", err));
          }
        }

        if (newlyEarnedMilestones.length > 0) {
          setTimeout(() => {
            newlyEarnedMilestones.forEach(milestone => {
              showMilestone(milestone);
            });
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking course completion milestones:", error);
      }
    };

    checkCourseCompletionMilestones();
  }, [user, showMilestone]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigateToSection = (sectionName) => {
    setActiveSection(sectionName);
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection goToProfile={dashboardKey} navigateToSection={navigateToSection} />;
      case "courses":
        return <CoursesSection />;
      case "achievements":
        return <AchievementsSection navigateToSection={navigateToSection} />;
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

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    <div className="flex relative bg-[#DFDFEE] min-h-screen">
      {/* Enhanced Sidebar - Full-screen overlay on mobile, sticky on desktop */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-[280px] h-screen bg-gradient-to-b from-[#BFC4D7] to-[#A8B0C8] flex flex-col justify-between p-6 shadow-xl z-[60] fixed md:sticky top-0"
          >
            {/* Logo Section with Close Button */}
            <div className="flex flex-col items-center mb-8 relative">
              {/* Close Button - Only visible on mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden absolute top-0 right-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-[#1A202C]" />
              </button>

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
                    className={`group relative flex items-center gap-4 px-3 py-5 rounded-xl font-bold text-[32px] text-left transition-all duration-200 ${isActive
                      ? "bg-[#F4EDD9] shadow-lg border-2 border-[#B6C44D]"
                      : "hover:bg-white/20"
                      }`}
                    onClick={() => navigateToSection(item.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive
                      ? "bg-white shadow-md"
                      : "bg-white/10"
                      }`}>
                      <Icon
                        className={`w-7 h-7 ${isActive ? item.color : "text-[#1A202C]"
                          }`}
                      />
                    </div>

                    <span className="flex-1 text-[#1A202C]">
                      {item.label}
                    </span>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay backdrop - Only on mobile when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area - Always present */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="sticky top-0 z-40 w-full bg-[#4c5173] shadow-md flex justify-between items-center px-4 md:px-10 py-5">
          {/* Hamburger Menu Button */}
          <motion.button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-6 h-6 text-white" />
          </motion.button>

          {/* Right Side - Calendar and User Profile */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Calendar - Numeric Format */}
            <div className="flex items-center gap-2 text-white text-[14px] md:text-[16px]">
              <FaCalendar className="text-[18px] md:text-[20px]" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Separator Line */}
            <div className="w-[1px] h-6 bg-white/30" />

            {/* User Profile Dropdown */}
            <div className="relative user-dropdown">
              <button
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                onClick={toggleDropdown}
              >
                <FaUser className="text-white text-[18px] md:text-[20px]" />
                <span className="text-white font-medium text-[14px] md:text-[15px] hidden sm:inline">
                  {user?.username || "User"}
                </span>
                <FaChevronDown className="text-white text-[14px]" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-44 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      goToProfileSection();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <FaUserCircle />
                    <span>Profile</span>
                  </button>

                  <hr className="border-t border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#DFDFEE] p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserBoard;