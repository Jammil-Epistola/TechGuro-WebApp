import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseNavbar from '../courseNavbar';
import questionsData from '../data/preAssessmentQuestions.json';
import './PreAssessment.css';

const PreAssessment = () => {
  const navigate = useNavigate();
  const [startTest, setStartTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = questionsData.ComputerBasics;

  const handleStart = () => {
    setStartTest(true);
  };

  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: selectedOption
    });
    
    // Automatically move to next question after selection
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(selectedAnswers).length === questions.length - 1) {
      // If this is the last answer, submit automatically
      handleSubmit();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    Object.keys(selectedAnswers).forEach(questionIndex => {
      if (selectedAnswers[questionIndex] === questions[questionIndex].answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
  };

  return (
    <div className="pre-assessment-page">
      <CourseNavbar courseTitle="Computer Basics" />
      <div className="course-heading">
        <h1>- COURSE -</h1>
        <h1>Computer Basics</h1>
      </div>
      <div className="pre-assessment-container">
        <div className="assessment-content">
          {!startTest ? (
            <>
              <h1>Pre-Assessment Test</h1>
              <div className="separator"></div>
              <p>
                Before you begin, please answer these questions honestly to assess your current knowledge level.
                This will help us tailor your learning experience.
                Take your time, there is no time limit.
              </p>
              <button 
                className="start-button"
                onClick={handleStart}
              >
                Start Pre-assessment
              </button>
            </>
          ) : score !== null ? (
            <div className="score-section">
              <h2>Assessment Complete!</h2>
              <div className="score-display">
                <p>{score}/{questions.length}</p>
              </div>
              <p className="preparing-message">Preparing Lessons based on Results...</p>
              <button 
                className="start-button"
                onClick={() => navigate('/courses/ComputerBasics')}
              >
                Start Learning
              </button>
            </div>
          ) : (
            <div className="question-section">
              <h2>Pre-Assessment: Please Answer the Following Questions</h2>
              <div className="separator"></div>
              
              <div className="question-container">
                <h3 className="question-text">Question {currentQuestion + 1}</h3>
                <div className="question-box">
                  <p>{questions[currentQuestion].question}</p>
                </div>
                
                <div className="options-grid">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${selectedAnswers[currentQuestion] === option ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreAssessment;
