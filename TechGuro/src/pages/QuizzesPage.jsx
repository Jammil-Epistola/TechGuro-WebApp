import React, { useState } from "react"; 
import "../pagesCSS/QuizzesPage.css"; 
import MainNavbar from "../MainNavbar"; 

const QuizzesPage = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true); 

  return (
    <div className={`quizzes-container ${!isNavbarOpen ? 'navbar-closed' : ''}`}>
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
              <option>Computer Basics</option>
              <option>Online Transaction</option>
              <option>Microsoft Basics</option>
              <option>Smartphone Basics</option>
              <option>Basic Cybersecurity</option>
              <option>Internet Safety</option>
            </select>
            <ul className="quiz-history">
              <li>Quiz 1: Not Taken</li>
              <li>Quiz 2: Not Taken</li>
              <li>Quiz 3: Not Taken</li>
              <li>Quiz 4: Not Taken</li>
              <li>Quiz 5: Not Taken</li>
              <li>Timed Quiz: Not Taken</li>
            </ul>
          </div>

          {/* Practice Mode */}
          <div className="quiz-box practice-mode">
            <h3 className="box-title">Practice Mode</h3>
            <div className="mode-image"></div>
            <p>Test yourself with unlimited attempts!</p>
            <button className="btn-retake">Start Practice</button>
          </div>

          {/* Challenge Mode */}
          <div className="quiz-box challenge-mode">
            <h3 className="box-title">Challenge Mode</h3>
            <div className="mode-image"></div>
            <p>Take a quiz under real conditions!</p>
            <button className="btn-retake">Start Challenge</button>
          </div>
        </div>

        {/* Middle Section: 2-Column Layout */}
        <div className="quizzes-middle">
          {/* GuroBot Suggestion Box */}
          <div className="quiz-box suggestion-box">
            <h3 className="box-title">GuroBot Says:</h3>
            <p>You haven't taken any quizzes yet. Ready to start your learning journey?</p>
            <button className="btn-retake">Take First Quiz</button>
          </div>

          {/* Score Feedback Section */}
          <div className="quiz-box feedback-box">
            <h3 className="box-title">Score Feedback</h3>
            <p>Want to review your quiz results?</p>
            <div className="feedback-options">
              <select className="dropdown">
                <option>Computer Basics</option>
                <option>Online Transaction</option>
                <option>Microsoft Basics</option>
                <option>Smartphone Basics</option>
                <option>Basic Cybersecurity</option>
                <option>Internet Safety</option>
              </select>
              <select className="dropdown">
                <option>Pre-Assessment</option>
                <option>Quiz 1</option>
                <option>Quiz 2</option>
                <option>Quiz 3</option>
                <option>Quiz 4</option>
                <option>Quiz 5</option>
                <option>Post-Assessment</option>
              </select>
            </div>
            <p className="feedback-note">Take a quiz first to see your results!</p>
            <button className="btn-review">Review Results</button>
          </div>
        </div>

        {/* Bottom Section: Centered Quiz Progress Tracker */}
        <div className="quizzes-bottom">
          <div className="quiz-box progress-box">
            <h3 className="box-title">Quiz Progress Tracker</h3>
            <select className="dropdown">
              <option>Computer Basics</option>
              <option>Online Transaction</option>
              <option>Microsoft Basics</option>
              <option>Smartphone Basics</option>
              <option>Basic Cybersecurity</option>
              <option>Internet Safety</option>
            </select>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
            <p>You haven't started any quizzes in this course</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
