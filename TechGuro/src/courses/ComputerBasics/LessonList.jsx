import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseNavbar from '../courseNavbar';
import './LessonList.css';

const LessonList = () => {
  const navigate = useNavigate();

  const handleLessonClick = (lessonNumber) => {
    navigate(`/courses/ComputerBasics/lesson${lessonNumber}`);
  };

  const handleQuizzesClick = () => {
    navigate('/courses/ComputerBasics/quizzes');
  };

  return (
    <div className="lesson-list-page">
      <CourseNavbar courseTitle="COURSE: COMPUTER BASICS" />
      <div className="lesson-list-container">
        <div className="course-title">
          <h1>Basic Computer Use</h1>
        </div>
        <div className="lesson-section">
          <h2>RECOMMENDED LESSONS</h2>
          <h3>SELECT A LESSON</h3>
          <div className="lessons-grid">
            <div className="lessons-column">
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(1)}
              >
                LESSON 1
              </button>
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(2)}
              >
                LESSON 2
              </button>
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(3)}
              >
                LESSON 3
              </button>
            </div>
            <div className="lessons-column">
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(4)}
              >
                LESSON 4
              </button>
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(5)}
              >
                LESSON 5
              </button>
              <button 
                className="lesson-button"
                onClick={() => handleLessonClick(6)}
              >
                LESSON 6
              </button>
            </div>
          </div>
          <button 
            className="quizzes-button"
            onClick={handleQuizzesClick}
          >
            QUIZZES
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonList;
