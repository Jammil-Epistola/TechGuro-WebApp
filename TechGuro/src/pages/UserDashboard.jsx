import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { NavLink } from "react-router-dom";
import "../pagesCSS/UserDashboard.css";
import MainNavbar from "../MainNavbar";
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

const UserDashboard = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div className={`dashboard-wrapper ${!isNavbarOpen ? 'navbar-closed' : ''}`}>
      <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />

      {/* Empty 10% Space */}
      <div className="empty-space"></div>

      {/* Main Content (90%) */}
      <div className="dashboard-container">
        <h2 className="welcome-text">Welcome Back, [User's Name]!</h2>

        {/* Charts Side by Side */}
        <div className="charts-container">
          <div className="chart">
            <h3>Hours Spent Per Day</h3>
            <Bar data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{ label: "Hours Spent", data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: "rgba(76, 81, 115, 0.5)", borderColor: "#4c5173", borderWidth: 2 }]
            }} />
          </div>
          <div className="chart">
            <h3>Performance Assessment</h3>
            <Line data={{
              labels: ["Pre-Assessment", "Post-Assessment"],
              datasets: [{ label: "Performance", data: [0, 0], backgroundColor: "rgba(244, 162, 97, 0.5)", borderColor: "#f4a261", borderWidth: 2 }]
            }} />
          </div>
        </div>

        {/* Key Performance Metrics Section */}
        <div className="performance-metrics">
          <h3>Key Performance Metrics</h3>
          <hr className="metrics-divider" />
          <div className="metrics-container">
            <div className="metric-box">
              <h4>Lesson Completion</h4>
              <p>0%</p>
            </div>
            <div className="metric-box">
              <h4>Average Quiz Score</h4>
              <p>0%</p>
            </div>
            <div className="metric-box">
              <h4>Top 3 Weak Areas</h4>
              <ul>
                <li>No Data Available</li>
                <li>No Data Available</li>
                <li>No Data Available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="recommended-courses">
          <h3>Recommended Courses</h3>
          <hr className="course-divider" />
          <div className="course-grid">
            <NavLink to="/course/online-banking" className="course-card">
              <div className="course-image-container">
                <div className="course-image">
                  <img src={placeholderimg} alt="Online Banking" />
                </div>
              </div>
              <div className="course-content-container">
                <div className="course-content">
                  <h4>Online Banking</h4>
                  <p>Learn about safe online banking practices</p>
                </div>
              </div>
            </NavLink>
            <NavLink to="/course/about-phone" className="course-card">
              <div className="course-image-container">
                <div className="course-image">
                  <img src={placeholderimg} alt="About Phone" />
                </div>
              </div>
              <div className="course-content-container">
                <div className="course-content">
                  <h4>About Phone</h4>
                  <p>Understanding your smartphone security</p>
                </div>
              </div>
            </NavLink>
            <NavLink to="/course/internet" className="course-card">
              <div className="course-image-container">
                <div className="course-image">
                  <img src={placeholderimg} alt="The Internet" />
                </div>
              </div>
              <div className="course-content-container">
                <div className="course-content">
                  <h4>The Internet</h4>
                  <p>Safe browsing and online security</p>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Fixed Profile Section */}
      <div className="profile-section">
        <div className="profile-header">
          <h3>User Profile</h3> <FaEdit className="edit-icon" />
        </div>
        <img src={placeholderimg} alt="User" className="profile-pic" />
        <p className="profile-name"><strong>[First Name] [Last Name]</strong></p>
        <p className="profile-title">[Title]</p>
        <p className="profile-email">[Email]</p>

        {/* Calendar */}
        <div className="calendar">
          📅 {new Date().toDateString()}
        </div>

        <hr className="profile-divider" />

        {/* Resume Activity */}
        <div className="resume-activity">
          <h4>Resume Activity</h4>
          <p className="previous-activity">{"No Activity"}</p>
          <button className="resume-btn resume-red">Resume</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
