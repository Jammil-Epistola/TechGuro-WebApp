import React, { useState } from "react"; 
import "../pagesCSS/QuizzesPage.css"; 
import MainNavbar from "../MainNavbar"; 

const QuizzesPage = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true); 

  return (
    <div className="quizzes-container">
      {/* Left Empty Space (14%) */}
      <div className="empty-space"></div>

      {/* Right Content (86%) */}
      <div className="quizzes-content">
        <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />

        <h2 className="quizzes-title">QUIZ OVERVIEW</h2>

        {/* Top Section: 3-Column Layout */}
        <div className="quizzes-top">
          {/* Quiz Score */}
          <div className="quiz-box">
            <h3 className="box-title">Quiz Score</h3>
            <select className="dropdown">
              <option>The Internet</option>
              <option>Basic Cybersecurity</option>
              <option>Online Banking</option>
            </select>
            <ul className="quiz-history">
              <li>Quiz 1: 7/15</li>
              <li>Quiz 2: 17/20</li>
              <li>Quiz 3: 20/20</li>
              <li>Quiz 4: 24/25</li>
              <li>Quiz 5: 30/30</li>
              <li>Timed Quiz: Not Taken</li>
            </ul>
          </div>

          {/* Practice Mode */}
          <div className="quiz-box">
            <h3 className="box-title">Practice Mode</h3>
            <img src="/assets/practice-icon.png" alt="Practice Mode" />
            <p>Test yourself with unlimited attempts!</p>
            <button className="btn-retake">Start Practice</button>
          </div>

          {/* Challenge Mode */}
          <div className="quiz-box">
            <h3 className="box-title">Challenge Mode</h3>
            <img src="/assets/challenge-icon.png" alt="Challenge Mode" />
            <p>Take a quiz under real conditions!</p>
            <button className="btn-retake">Start Challenge</button>
          </div>
        </div>

        {/* Middle Section: 2-Column Layout */}
        <div className="quizzes-middle">
          {/* GuroBot Suggestion Box */}
          <div className="quiz-box">
            <h3 className="box-title">GuroBot Says:</h3>
            <p>Based on your performance, would you like to revisit Quiz 1?</p>
            <button className="btn-retake">Retake Quiz</button>
          </div>

          {/* Score Feedback Section */}
          <div className="quiz-box">
            <h3 className="box-title">Score Feedback</h3>
            <p>Want to review the questions you got wrong?</p>
            <div className="feedback-options">
              <select className="dropdown">
                <option>The Internet</option>
                <option>Basic Cybersecurity</option>
              </select>
              <select className="dropdown">
                <option>Pre-Assessment</option>
                <option>Final Quiz</option>
              </select>
            </div>
            <button className="btn-review">Review Results</button>
          </div>
        </div>

        {/* Bottom Section: Centered Quiz Progress Tracker */}
        <div className="quizzes-bottom">
          <div className="quiz-box">
            <h3 className="box-title">Quiz Progress Tracker</h3>
            <select className="dropdown">
              <option>The Internet</option>
            </select>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "80%" }}></div>
            </div>
            <p>You completed 5/6 quizzes in this course</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
