import React from "react";
import { Line, Bar } from "react-chartjs-2";

const PerformanceSection = () => {
  const courses = ["Computer Basics", "Online Banking", "About Phone", "Internet"];

  return (
    <div className="performance-container">
      {/* Performance Overview */}
      <div className="performance-overview">
        <div className="overview-card">
          <h3>Overall Progress</h3>
          <div className="progress-circle">
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
                strokeDasharray="75, 100"
              />
            </svg>
            <div className="progress-text">75%</div>
          </div>
          <p>Course Completion Rate</p>
        </div>

        <div className="overview-card">
          <h3>Quiz Performance</h3>
          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-value">85%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-label">Quizzes Taken</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Time Investment</h3>
          <div className="time-stats">
            <div className="stat-item">
              <span className="stat-value">24h</span>
              <span className="stat-label">Total Learning Time</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2h</span>
              <span className="stat-label">Avg. Daily Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="performance-charts">
        <div className="chart-container">
          <h3>Learning Progress</h3>
          <Line
            data={{
              labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
              datasets: [
                {
                  label: "Quiz Scores",
                  data: [65, 75, 85, 90],
                  borderColor: "#4CAF50",
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Time Spent per Course</h3>
          <Bar
            data={{
              labels: courses,
              datasets: [
                {
                  label: "Hours",
                  data: [8, 6, 5, 5],
                  backgroundColor: "#4c5173"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                }
              }
            }}
          />
        </div>
      </div>

      {/* Course Performance */}
      <div className="course-performance">
        <h3>Course Performance</h3>
        <div className="course-list">
          {courses.map((course, index) => (
            <div key={index} className="course-performance-card">
              <div className="course-header">
                <h4>{course}</h4>
                <span className="completion-status">In Progress</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(index + 1) * 20}%` }}
                ></div>
              </div>
              <div className="performance-details">
                <div className="detail-item">
                  <span className="detail-label">Last Quiz Score</span>
                  <span className="detail-value">85%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time Spent</span>
                  <span className="detail-value">8 hours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSection; 