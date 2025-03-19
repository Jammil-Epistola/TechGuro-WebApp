import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { NavLink } from "react-router-dom";
import "../pagesCSS/UserDashboard.css";
import MainNavbar from "../MainNavbar";
import placeholderimg from "../assets/placeholder_teki.png"; // Import the user icon image

const UserDashboard = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div className="dashboard-wrapper">
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
              datasets: [{ label: "Hours Spent", data: [1, 2, 1.5, 3, 2.5, 4, 3.5], backgroundColor: "rgba(76, 81, 115, 0.5)", borderColor: "#4c5173", borderWidth: 2 }]
            }} />
          </div>
          <div className="chart">
            <h3>Performance Assessment</h3>
            <Line data={{
              labels: ["Pre-Assessment", "Post-Assessment"],
              datasets: [{ label: "Performance", data: [65, 85], backgroundColor: "rgba(244, 162, 97, 0.5)", borderColor: "#f4a261", borderWidth: 2 }]
            }} />
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="recommended-courses">
          <h3>Recommended Courses</h3>
          <hr className="course-divider" />
          <div className="course-list">
            <NavLink to="/course/online-banking" className="course-item">Online Banking</NavLink>
            <NavLink to="/course/about-phone" className="course-item">About Phone</NavLink>
            <NavLink to="/course/internet" className="course-item">The Internet</NavLink>
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
