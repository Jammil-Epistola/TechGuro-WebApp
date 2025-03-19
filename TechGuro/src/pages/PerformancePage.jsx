import React, { useState } from "react";
import "../pagesCSS/PerformancePage.css";
import { FaTrophy } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import MainNavbar from "../MainNavbar";

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformancePage = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("The Internet");

  // Dropdown courses
  const courses = ["The Internet", "Basic CyberSecurity", "About Computers", "About Phones", "Government Services", "Online Banking"];

  // Dummy Quiz Scores
  const quizScores = {
    "The Internet": {
      preAssessment: "6/15",
      quizzes: [
        { quiz: 1, score: "7/15" },
        { quiz: 2, score: "17/20" },
        { quiz: 3, score: "20/20" },
        { quiz: 4, score: "24/25" },
        { quiz: 5, score: "30/30" },
        { quiz: "Timed Quiz", score: "Not Taken" },
      ],
      postAssessment: "Not Taken",
    },
  };

  // Dummy Assessment Data
  const assessmentData = {
    "The Internet": { pre: 6, post: 15 },
  };

  // Pie Chart Data
  const pieData = {
    labels: ["Pre-Assessment", "Post-Assessment"],
    datasets: [
      {
        data: [assessmentData[selectedCourse]?.pre || 0, assessmentData[selectedCourse]?.post || 0],
        backgroundColor: ["#e74c3c", "#2ecc71"],
      },
    ],
  };

  return (
    <div className="performance-container">
      {/* Navbar */}
      <div className="navbar-container">
        <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />
      </div>

      {/* Main Content */}
      <div className="content-container">
        <h1 className="performance-title">Performance Overview</h1>

        {/* Quiz Scores and Assessment Results - Side by Side */}
        <div className="performance-flex-container">
          {/* Quiz Scores */}
          <div className="performance-box">
            <div className="quiz-header">
              <h2>Quiz Scores</h2>
              <select onChange={(e) => setSelectedCourse(e.target.value)}>
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <hr className="quiz-separator" />
            <ul className="quiz-list">
              <li><strong>Pre-Assessment Score:</strong> {quizScores[selectedCourse]?.preAssessment || "Not Taken"}</li>
              {quizScores[selectedCourse]?.quizzes?.map((quiz, index) => (
                <li key={index}>Quiz {quiz.quiz}: {quiz.score}</li>
              ))}
              <li><strong>Post-Assessment Score:</strong> {quizScores[selectedCourse]?.postAssessment || "Not Taken"}</li>
            </ul>
          </div>

          {/* Assessment Results (Pie Chart) */}
          <div className="performance-box">
            <div className="quiz-header">
              <h2>Assessment Results</h2>
              <select onChange={(e) => setSelectedCourse(e.target.value)}>
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <hr className="quiz-separator" />
            <div className="pie-chart-container">
              <Pie 
                data={pieData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                        font: { size: 16 },
                      },
                    },
                    tooltip: {
                      enabled: true,
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="performance-section">
          <h2>Completed Courses</h2>
          <div className="completed-course">
            <p>No completed courses yet</p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="performance-section">
          <h2>Recent Achievements</h2>
          <div className="achievement">
            <FaTrophy className="trophy-icon" />
            <p>
              <strong>Web Wanderer</strong> <br /> Completed the <strong>"The Internet"</strong> course
            </p>
          </div>
          <div className="achievement">
            <FaTrophy className="trophy-icon" />
            <p>
              <strong>First Steps</strong> <br /> Completed the first lesson
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
