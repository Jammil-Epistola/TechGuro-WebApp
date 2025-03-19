import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTachometerAlt, FaChartLine, FaQuestionCircle, FaBook, 
  FaTrophy, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight 
} from "react-icons/fa"; 
import "./pagesCSS/MainNavbar.css";

const MainNavbar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Navbar Header - Includes Title and Toggle Button */}
      <div className="navbar-header">
        {isOpen && <h2 className="navbar-title">TECHGURO</h2>}
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <hr />

      {/* NavLinks */}
      <nav className="nav-links">
        <Link to="/dashboard" className="nav-item"><FaTachometerAlt /> <span className={!isOpen ? "hidden" : ""}>Dashboard</span></Link>
        <Link to="/performance" className="nav-item"><FaChartLine /> <span className={!isOpen ? "hidden" : ""}>Performance</span></Link>
        <Link to="/quizzes" className="nav-item"><FaQuestionCircle /> <span className={!isOpen ? "hidden" : ""}>Quizzes</span></Link>
        <Link to="/courses" className="nav-item"><FaBook /> <span className={!isOpen ? "hidden" : ""}>Courses</span></Link>
        <Link to="/achievements" className="nav-item"><FaTrophy /> <span className={!isOpen ? "hidden" : ""}>Achievements</span></Link>
        <Link to="/settings" className="nav-item"><FaCog /> <span className={!isOpen ? "hidden" : ""}>Settings</span></Link>
      </nav>

      <hr />

      {/* Sign Out */}
      <Link to="/" className="nav-item logout">
        <FaSignOutAlt /> <span className={!isOpen ? "hidden" : ""}>Sign Out</span>
      </Link>
    </div>
  );
};

export default MainNavbar;
