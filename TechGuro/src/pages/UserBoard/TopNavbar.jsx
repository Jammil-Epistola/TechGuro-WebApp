import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserCircle, FaCalendar, FaChevronDown, FaSignOutAlt } from "react-icons/fa";

const TopNavbar = ({ goToProfileSection }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    // Call a callback to navigate to Profile Section in Dashboard
    if (goToProfileSection) goToProfileSection();
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

  return (
    <div className="sticky top-0 z-50 w-full bg-[#4c5173] shadow-md flex justify-end items-center px-10 py-5">
      {/* Calendar */}
      <div className="flex items-center gap-2 text-white text-[16px] mr-6">
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
      <div className="w-[1px] h-6 bg-white/30 mr-6" />

      {/* User Profile Dropdown */}
      <div className="relative user-dropdown">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
          onClick={toggleDropdown}
        >
          <FaUser className="text-white text-[20px]" />
          <span className="text-white font-medium">{user?.username || "User"}</span>
          <FaChevronDown className="text-white" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-44 z-50 overflow-hidden">
            {/* Profile Link */}
            <button
              onClick={handleProfileClick}
              className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
            >
              <FaUserCircle />
              <span>Profile</span>
            </button>

            <hr className="border-t border-gray-200" />

            {/* Sign Out */}
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
  );
};

export default TopNavbar;
