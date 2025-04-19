import React from "react";
import practiceModeImage from '../../assets/Dashboard/practice_mode.png';

const QuizzesSection = () => {
  const courses = ["Computer Basics", "Online Banking", "About Phone", "Internet"];

  return (
    <div className="quizzes-container">
      {/* Top Section: 2-Column Layout */}
      <div className="quizzes-top">
        {/* Quiz Progress Tracker */}
        <div className="quiz-box progress-box">
          <h3 className="box-title">Quiz Progress Tracker</h3>
          <select className="dropdown">
            {courses.map(course => (
              <option key={course}>{course}</option>
            ))}
          </select>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "0%" }}></div>
          </div>
          <p>You haven't started any quizzes in this course</p>
        </div>

        {/* Quiz Score */}
        <div className="quiz-box">
          <h3 className="box-title">Quiz Score</h3>
          <select className="dropdown">
            {courses.map(course => (
              <option key={course}>{course}</option>
            ))}
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
      </div>

      {/* Bottom Section: 2-Column Layout */}
      <div className="quizzes-middle">
        {/* Practice Mode */}
        <div className="quiz-box practice-mode">
          <h3 className="box-title">Practice Mode</h3>
          <p>Test your knowledge with practice quizzes</p>
          <img 
            src={practiceModeImage} 
            alt="Practice Mode" 
            className="practice-mode-image"
          />
          <button className="btn-retake">Start Practice</button>
        </div>

        {/* Score Feedback Section */}
        <div className="quiz-box feedback-box">
          <h3 className="box-title">Score Feedback</h3>
          <p>Want to review your quiz results?</p>
          <div className="feedback-options">
            <select className="dropdown">
              {courses.map(course => (
                <option key={course}>{course}</option>
              ))}
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
    </div>
  );
};

export default QuizzesSection; 