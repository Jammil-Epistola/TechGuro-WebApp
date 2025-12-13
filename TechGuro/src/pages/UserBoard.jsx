// UserBoard.jsx 
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useMilestone } from "../context/MilestoneContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, BookOpen, BarChart3, Award, History, Menu, X } from "lucide-react";
import { FaUser, FaUserCircle, FaSignOutAlt, FaBook } from "react-icons/fa";
import DashboardSection from "./UserBoard/DashboardSection";
import AchievementsSection from "./UserBoard/AchievementsSection";
import CoursesSection from "./UserBoard/CoursesSection";
import HistorySection from "./UserBoard/HistorySection";
import DashboardTutorial from "../components/DashboardTutorial";
import tgLogo from "../assets/TechGuroLogo_3.png";
import API_URL from '../config/api';

const UserBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useUser();
  const { showMilestone } = useMilestone();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // DEBUG: Log tutorial state changes
  useEffect(() => {
    console.log("🎓 Tutorial showTutorial state changed to:", showTutorial);
  }, [showTutorial]);

  // DEBUG: Log user changes
  useEffect(() => {
    console.log("👤 User object:", user);
    if (user && user.user_id) {
      setIsUserLoaded(true);
      console.log("✅ User fully loaded");
    }
  }, [user]);

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

  // LISTEN FOR TUTORIAL NAVIGATION EVENTS
  useEffect(() => {
    const handleTutorialNavigate = (e) => {
      console.log("📍 Tutorial navigation event received:", e.detail);
      const target = e.detail.target;
      const sectionMap = {
        "milestones": "achievements",
        "history": "history",
        "courses": "courses",
        "dashboard": "dashboard"
      };

      const section = sectionMap[target] || target;
      console.log("🔄 Navigating to section:", section);

      const mainContent = document.querySelector('.flex-1.overflow-y-auto');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'instant' });
      }

      setActiveSection(section);

      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("tutorial-navigate", handleTutorialNavigate);
    console.log("✅ Tutorial navigation listener registered");
    return () => {
      window.removeEventListener("tutorial-navigate", handleTutorialNavigate);
      console.log("❌ Tutorial navigation listener removed");
    };
  }, []);

  // Check first login and show tutorial
  useEffect(() => {
    const checkFirstLogin = async () => {
      // Wait for user to be fully loaded
      if (!user || !user.user_id) {
        console.log("⏳ Waiting for user data...");
        return;
      }

      console.log("👤 User loaded - ID:", user.user_id);

      const tutorialShownKey = `tutorial_shown_${user.user_id}`;
      const hasShownTutorial = localStorage.getItem(tutorialShownKey);

      console.log("🔑 Tutorial key:", tutorialShownKey);
      console.log("📦 Tutorial previously shown:", hasShownTutorial);

      // Check if tutorial was shown
      if (!hasShownTutorial) {
        console.log("🎓 First login detected - preparing tutorial");

        // Ensure DOM is fully ready and all sections are rendered
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max

        const checkDOMReady = () => {
          attempts++;
          const profileCard = document.querySelector('.profile-card');
          const sidebar = document.querySelector('.sidebar-nav');
          
          if (profileCard && sidebar) {
            console.log(`✅ DOM elements ready after ${attempts} attempts - showing tutorial`);
            setShowTutorial(true);
            // DON'T SET FLAG HERE - will be set when user closes tutorial
            console.log("🎓 Tutorial opened - flag will be saved when user completes it");
          } else if (attempts < maxAttempts) {
            console.log(`⏳ DOM not ready (attempt ${attempts}/${maxAttempts}), retrying...`);
            setTimeout(checkDOMReady, 100);
          } else {
            console.warn("⚠️ Max attempts reached - showing tutorial anyway");
            setShowTutorial(true);
          }
        };

        // Start checking after a brief delay
        setTimeout(checkDOMReady, 500);
      } else {
        console.log("⏭️ Tutorial already shown before - skipping");
      }
    };

    // Only run when user is loaded
    if (isUserLoaded) {
      checkFirstLogin();
    }
  }, [isUserLoaded, user]);

  // Check and show Milestone #1
  useEffect(() => {
    const checkFirstLoginMilestone = async () => {
      if (!user || !user.user_id) return;

      try {
        const response = await fetch(`${API_URL}/milestones/check/${user.user_id}/1`);
        const data = await response.json();

        if (data.earned) {
          const milestonesResponse = await fetch(`${API_URL}/milestones/${user.user_id}`);
          const milestones = await milestonesResponse.json();
          const milestone1 = milestones.find(m => m.id === 1);

          if (milestone1 && milestone1.status === "earned" && !milestone1.notification_shown) {
            setTimeout(() => {
              showMilestone(milestone1);
              fetch(`${API_URL}/milestones/mark-shown/${user.user_id}/1`, {
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
        const milestonesResponse = await fetch(`${API_URL}/milestones/${user.user_id}`);
        const milestones = await milestonesResponse.json();

        for (const milestoneId of courseCompletionMilestones) {
          const milestone = milestones.find(m => m.id === milestoneId);

          if (milestone && milestone.status === "earned" && !milestone.notification_shown) {
            newlyEarnedMilestones.push(milestone);
            fetch(`${API_URL}/milestones/mark-shown/${user.user_id}/${milestoneId}`, {
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

    const mainContent = document.querySelector('.flex-1.overflow-y-auto');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="dashboard-section-wrapper">
            <DashboardSection goToProfile={dashboardKey} navigateToSection={navigateToSection} />
          </div>
        );
      case "courses":
        return (
          <div className="courses-section">
            <CoursesSection />
          </div>
        );
      case "achievements":
        return (
          <div className="achievements-section">
            <AchievementsSection navigateToSection={navigateToSection} />
          </div>
        );
      case "history":
        return (
          <div className="history-section">
            <HistorySection />
          </div>
        );
      default:
        return (
          <div className="dashboard-section-wrapper">
            <DashboardSection goToProfile={dashboardKey} navigateToSection={navigateToSection} />
          </div>
        );
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
      if (!event.target.closest(".floating-profile-dropdown")) {
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
      {/* Enhanced Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="sidebar-nav w-[280px] h-screen bg-gradient-to-b from-[#BFC4D7] to-[#A8B0C8] flex flex-col justify-between p-6 shadow-xl z-[60] fixed md:sticky top-0"
          >
            {/* Logo Section*/}
            <div className="flex flex-col items-center mb-8 relative">
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

      {/* Overlay backdrop */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-5 left-5 z-[70] flex items-center justify-center w-12 h-12 bg-[#4c5173] hover:bg-[#3a3f5c] rounded-lg shadow-lg transition-all md:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6 text-white" />
        </motion.button>

        {/* Floating User Profile Button */}
        <div className="floating-profile-dropdown fixed top-5 right-5 z-[70]">
          <motion.button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-3 bg-[#4c5173] hover:bg-[#3a3f5c] rounded-full shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-xl" />
            </div>
            <span className="text-white font-medium text-[15px] hidden sm:inline">
              {user?.username || "User"}
            </span>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-xl w-48 overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => {
                    console.log("👤 Profile button clicked");
                    setIsDropdownOpen(false);
                    goToProfileSection();
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-all"
                >
                  <FaUserCircle className="text-lg text-[#4c5173]" />
                  <span className="font-medium">Profile</span>
                </button>

                <hr className="border-t border-gray-200" />

                <button
                  onClick={() => {
                    console.log("Tutorial button clicked");
                    setIsDropdownOpen(false);

                    // Navigate to dashboard FIRST
                    setActiveSection("dashboard");

                    // Scroll to top
                    const mainContent = document.querySelector('.flex-1.overflow-y-auto');
                    if (mainContent) {
                      mainContent.scrollTo({ top: 0, behavior: 'instant' });
                    }

                    // Show tutorial after navigation
                    setTimeout(() => {
                      setShowTutorial(true);
                    }, 400);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-all"
                >
                  <FaBook className="text-lg text-[#4c5173]" />
                  <span className="font-medium">Tutorial</span>
                </button>

                <hr className="border-t border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#DFDFEE] p-4 md:p-6 pt-20 md:pt-6">
          {renderContent()}
        </div>
      </div>

      {/* Dashboard Tutorial*/}
      {console.log("DashboardTutorial props:", { isOpen: showTutorial, currentPage: activeSection })}
      <DashboardTutorial
        isOpen={showTutorial}
        onClose={() => {
          console.log("✅ Tutorial closed by user");
          
          // Save the flag when tutorial is actually closed
          if (user && user.user_id) {
            const tutorialShownKey = `tutorial_shown_${user.user_id}`;
            localStorage.setItem(tutorialShownKey, 'true');
            console.log("💾 Tutorial completed - saved flag to localStorage:", tutorialShownKey);
          }
          
          setShowTutorial(false);
        }}
        currentPage={activeSection}
      />
    </div>
  );
};

export default UserBoard;