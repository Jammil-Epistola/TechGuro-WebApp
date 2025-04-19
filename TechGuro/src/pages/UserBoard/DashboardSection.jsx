import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const DashboardSection = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("Computer Basics");
  const [selectedUnit, setSelectedUnit] = useState("Unit 1: Introduction to Computers");

  const courses = ["Computer Basics", "Online Banking", "About Phone"];
  const units = ["Unit 1: Introduction to Computers", "Unit 2: Navigating the Desktop", "Unit 3: File Management"];

  const handleCourseClick = (course) => {
    if (course === "Computer Basics") {
      navigate("/courses/ComputerBasics");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Charts Side by Side */}
      <div className="charts-container">
        <div className="chart">
          <h3>Hours Spent Per Day</h3>
          <div className="chart-wrapper">
            <Bar data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{ label: "Hours Spent", data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: "rgba(76, 81, 115, 0.5)", borderColor: "#4c5173", borderWidth: 2 }]
            }} />
          </div>
        </div>
        <div className="chart">
          <h3>Performance Assessment</h3>
          <div className="chart-wrapper">
            <Line data={{
              labels: ["Pre-Assessment", "Post-Assessment"],
              datasets: [{ label: "Performance", data: [0, 0], backgroundColor: "rgba(244, 162, 97, 0.5)", borderColor: "#f4a261", borderWidth: 2 }]
            }} />
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="performance-metrics">
        <h3>Key Performance Metrics</h3>
        <hr className="metrics-divider" />
        <div className="metrics-container">
          <div className="metric-box lesson-completion">
            <h4>Lesson Completion</h4>
            <div className="dropdown-container">
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="metric-dropdown"
              >
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <select 
                value={selectedUnit} 
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="metric-dropdown"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="progress-tracker">
              <div className="progress-bar">
                <div className="progress" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>
          <div className="metric-box quiz-results">
            <h4>Recent Quiz Result</h4>
            <div className="quiz-score">20/20</div>
            <button className="quiz-link">
              Quiz 1: Computer Basics
            </button>
          </div>
          <div className="metric-box completion-percentage">
            <h4>Course Completion</h4>
            <div className="completion-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="3"
                  strokeDasharray="25, 100"
                />
              </svg>
              <div className="completion-percentage-text">25%</div>
            </div>
            <p className="completion-label">TechGuro Progress</p>
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="recommended-courses">
        <h3>Recommended Courses</h3>
        <hr className="course-divider" />
        <div className="course-grid">
          {courses.map((course, index) => (
            <div 
              key={index} 
              className="course-card"
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-image-container">
                <div className="course-image">
                  <img src={placeholderimg} alt={course} />
                </div>
              </div>
              <div className="course-content">
                <h4>{course}</h4>
                <p>Learn about {course.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection; 