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

  return (
    <nav className="course-navbar">
      <div className="navbar-left">
        <h1 className="logo">TECHGURO.</h1>
      </div>
      
      <div className="navbar-right">
        <h2 className="course-title">{courseTitle}</h2>
        <div className="menu-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <FaBars className="menu-icon" />
          <div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
            <div className="dropdown-item" onClick={() => navigate('/dashboard')}>
              <FaHome /> <span>Dashboard</span>
            </div>
            <div className="dropdown-item">
              <FaBook /> <span>Lessons</span>
            </div>
            <div className="dropdown-item">
              <FaLanguage /> <span>Language</span>
              <select className="language-select">
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
