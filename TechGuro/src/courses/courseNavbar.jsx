import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaLanguage, FaSignOutAlt, FaBars } from 'react-icons/fa';
import './courseNavbar.css';

const CourseNavbar = ({ courseTitle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    e.stopPropagation(); // Prevent the click from closing the dropdown
    // Add language change logic here
  };

  return (
    <nav className="course-navbar">
      <div className="navbar-left">
        <h1 className="logo">TECHGURO.</h1>
      </div>
      
      <div className="navbar-right">
        <div className="menu-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <FaBars className="menu-icon" />
          <div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
            <div className="dropdown-item" onClick={() => navigate('/UserDashboard')}>
              <FaHome /> <span>Dashboard</span>
            </div>
            <div className="dropdown-item" onClick={() => navigate('/courses/ComputerBasics')}>
              <FaBook /> <span>Lessons</span>
            </div>
            <div className="dropdown-item" onClick={(e) => e.stopPropagation()}>
              <FaLanguage /> <span>Language</span>
              <select 
                className="language-select"
                onClick={(e) => e.stopPropagation()}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
            <div className="dropdown-separator"></div>
            <div className="dropdown-item" onClick={handleLogout}>
              <FaSignOutAlt /> <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CourseNavbar;
