import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaCalendar,
  FaUser,
  FaLanguage,
  FaSignOutAlt,
  FaChevronDown,
  FaHome,
  FaBook
} from 'react-icons/fa';
import Logo from "../assets/TechGuroLogo_2.png";

const CourseNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();
  const { courseName } = useParams(); // Dynamic course name for navigation

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
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

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#4C5173] text-white h-[70px] relative">
      {/* Left Side Logo + Title */}
      <div className="flex items-center gap-3">
        <img src={Logo} alt="TechGuro Logo" className="w-10 h-10 object-contain" />
        <h1 className="text-2xl font-bold">TechGuro.</h1>
      </div>

      {/* Right Side: Date + User Dropdown */}
      <div className="flex items-center gap-6">
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

        {/* User Dropdown */}
        <div className="relative user-dropdown">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            onClick={toggleDropdown}
          >
            <FaUser className="text-white text-[20px]" />
            <span className="text-white font-medium">John Doe</span>
            <FaChevronDown className="text-white" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-56 z-50 overflow-hidden">
              {/* Dashboard */}
              <div
                onClick={() => navigate('/UserDashboard')}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
              >
                <FaHome />
                <span>Dashboard</span>
              </div>

              {/* Lessons (Back to LessonList of this course) */}
              <div
                onClick={() => navigate(`/courses/${courseName}`)}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
              >
                <FaBook />
                <span>Lessons</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200">
                <FaLanguage />
                <select
                  className="bg-transparent focus:outline-none"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                </select>
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
    </nav>
  );
};

export default CourseNavbar;
