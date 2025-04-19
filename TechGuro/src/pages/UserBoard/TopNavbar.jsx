import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaCalendar, 
  FaUserCircle, 
  FaCog, 
  FaLanguage, 
  FaMoon, 
  FaSignOutAlt,
  FaChevronDown 
} from 'react-icons/fa';
import './UserBoard.css';

const TopNavbar = ({ title }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

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
      if (!event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="top-navbar">
      <h1 className="section-title">{title}</h1>
      <div className="user-info">
        <div className="calendar">
          <FaCalendar />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="navbar-separator" />
        <div className="user-dropdown">
          <button className="dropdown-button" onClick={toggleDropdown}>
            <FaUser />
            <span>John Doe</span>
            <FaChevronDown />
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-content">
              <Link to="/profile" className="dropdown-item">
                <FaUserCircle />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item">
                <FaCog />
                <span>Settings</span>
              </Link>
              
              <div className="dropdown-item">
                <FaLanguage />
                <select 
                  className="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                </select>
              </div>
              
              <div className="dark-mode-toggle">
                <div className="dropdown-item">
                  <FaMoon />
                  <span>Dark Mode</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="dropdown-separator" />
              
              <Link to="/" className="dropdown-item">
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