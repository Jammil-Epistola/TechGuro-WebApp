import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaCalendar,
  FaUserCircle,
  FaCog,
  FaLanguage,
  FaMoon,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

const TopNavbar = ({ title }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
    <div className="bg-[#4c5173] px-10 py-5 flex justify-between items-center border-b border-white/10 sticky top-0 z-100 w-full">
      <h1 className="text-white text-[24px] font-bold m-0">{title}</h1>

      <div className="flex items-center gap-6 text-white">
        {/* Calendar */}
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

        {/* Separator */}
        <div className="w-[1px] h-6 bg-white/20" />

        {/* User Profile Dropdown */}
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
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
              >
                <FaUserCircle />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
              >
                <FaCog />
                <span>Settings</span>
              </Link>

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

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <FaMoon />
                  <span>Dark Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#697DFF] rounded-full peer peer-checked:bg-[#697DFF] transition-all"></div>
                  <div className="absolute left-1 top-[2px] bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-full" />
                </label>
              </div>

              <hr className="border-t border-gray-200" />

              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
