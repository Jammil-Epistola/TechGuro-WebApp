//courseNavbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaCalendar,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaHome,
  FaBook,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Logo from "../assets/TechGuroLogo_2.png";
import { useUser } from "../context/UserContext";
import TekiDialog from "../components/TekiDialog";

const CourseNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState(""); 
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user, logout } = useUser();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLessonsClick = () => {
    // If user is in Pre-Assessment, block Lessons with popup
    if (location.pathname.includes("pre-assessment")) {
      setUnlockMessage("Complete the Pre-Assessment first to unlock this function!");
    } else {
      navigate(`/courses/${courseName}`);
    }
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleDashboardClick = () => {
    navigate("/UserDashboard");
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-6 py-4 bg-[#4C5173] text-white h-[70px] relative">
        {/* Left Side Logo + Title */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src={Logo}
            alt="TechGuro Logo"
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <h1 className="text-lg md:text-2xl font-bold">TechGuro.</h1>
        </div>

        {/* Desktop View - Right Side: Date + Dashboard + User Dropdown */}
        <div className="hidden md:flex items-center gap-6">
          {/* Date */}
          <div className="flex items-center gap-2 text-[16px]">
            <FaCalendar className="text-[20px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20" />

          {/* Dashboard Link */}
          <button
            onClick={() => navigate("/UserDashboard")}
            className="text-[16px] font-medium hover:underline"
          >
            Dashboard
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20" />

          {/* User Dropdown */}
          <div className="relative user-dropdown">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
              onClick={toggleDropdown}
            >
              <FaUser className="text-white text-[20px]" />
              <span className="text-white font-medium">
                {user?.username || "User"}
              </span>
              <FaChevronDown className="text-white" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-56 z-50 overflow-hidden">
                {/* Dashboard */}
                <div
                  onClick={() => navigate("/UserDashboard")}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                >
                  <FaHome />
                  <span>Return to Dashboard</span>
                </div>

                {/* Lessons */}
                <div
                  onClick={handleLessonsClick}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                >
                  <FaBook />
                  <span>Lessons</span>
                </div>

                <hr className="border-t border-gray-200" />

                {/* Logout */}
                <div
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View - Date (Numeric) + Hamburger Menu */}
        <div className="flex md:hidden items-center gap-3">
          {/* Date (Numeric Format) */}
          <div className="flex items-center gap-1 text-sm">
            <FaCalendar className="text-[16px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Hamburger Menu Icon */}
          <button
            onClick={toggleMobileMenu}
            className="text-white text-2xl p-2 hover:bg-white/10 rounded transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[70px] right-0 left-0 bg-white text-black shadow-lg z-50 md:hidden">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border-b border-gray-200">
              <FaUser className="text-[#4C5173] text-[20px]" />
              <span className="font-medium text-[#4C5173]">
                {user?.username || "User"}
              </span>
            </div>

            {/* Dashboard */}
            <div
              onClick={handleDashboardClick}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition cursor-pointer border-b border-gray-100"
            >
              <FaHome className="text-[18px]" />
              <span>Return to Dashboard</span>
            </div>

            {/* Lessons */}
            <div
              onClick={handleLessonsClick}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition cursor-pointer border-b border-gray-100"
            >
              <FaBook className="text-[18px]" />
              <span>Lessons</span>
            </div>

            {/* Logout */}
            <div
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <FaSignOutAlt className="text-[18px]" />
              <span>Sign Out</span>
            </div>
          </div>
        )}
      </nav>

      {/* Global Teki Dialog */}
      {unlockMessage && (
        <TekiDialog
          message={unlockMessage}
          onClose={() => setUnlockMessage("")}
        />
      )}
    </>
  );
};

export default CourseNavbar;