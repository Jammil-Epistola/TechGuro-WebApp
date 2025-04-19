import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseNavbar from '../courseNavbar';
import './LessonList.css';
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const LessonList = () => {
  const navigate = useNavigate();
  const [activeUnit, setActiveUnit] = useState(1);

  const handleStartLesson = (lessonNumber) => {
    if (lessonNumber === 'quiz') {
      navigate('/courses/ComputerBasics/lesson', { 
        state: { 
          lessonNumber: 6,
          showQuiz: true 
        }
      });
    } else {
      navigate('/courses/ComputerBasics/lesson', { 
        state: { 
          lessonNumber: lessonNumber 
        }
      });
    }
  };

  const handleLessonClick = (lessonNumber) => {
    navigate('/courses/ComputerBasics/lesson', {
      state: { lessonNumber, showQuiz: false }
    });
  };

  const units = [
    {
      number: 1,
      title: 'Introduction to Computers',
      lessons: [
        { 
          number: 1, 
          title: 'What is a Computer', 
          description: 'Learn about the basic concepts of computers, including hardware and software components, and understand their role in our daily lives.' 
        },
        { 
          number: 2, 
          title: 'Types of Computers', 
          description: 'Explore different types of computers, from desktops to laptops, tablets, and smartphones. Understand their unique features and use cases.' 
        },
        { 
          number: 3, 
          title: 'Computer Parts Overview', 
          description: 'Discover the essential components that make up a computer system, including the CPU, memory, storage, and various input/output devices.' 
        },
        { 
          number: 4, 
          title: 'Peripherals and Their Uses', 
          description: 'Learn about different peripheral devices that enhance computer functionality, from keyboards and mice to printers and external storage.' 
        },
        { 
          number: 5, 
          title: 'How to Turn a Computer On and Off Properly', 
          description: 'Master the correct procedures for starting up and shutting down a computer to ensure system health and prevent data loss.' 
        },
        { 
          number: 6, 
          title: 'Basic Safety & Handling Tips', 
          description: 'Understand essential safety practices and proper handling techniques to maintain your computer and ensure safe operation.' 
        },
        { 
          number: 'quiz', 
          title: 'Quiz 1', 
          description: 'Test your knowledge of computer basics with this comprehensive quiz covering all topics from Unit 1.' 
        }
      ]
    },
    {
      number: 2,
      title: 'Navigating the Desktop & Mouse/Keyboard Basics',
      lessons: []
    },
    {
      number: 3,
      title: 'File Management',
      lessons: []
    },
    {
      number: 4,
      title: 'Basic Software & Applications',
      lessons: []
    },
    {
      number: 5,
      title: 'Internet & Email Basics',
      lessons: []
    },
    {
      number: 6,
      title: 'Computer Ethics & Security',
      lessons: []
    }
  ];

  return (
    <div className="lesson-list-page">
      <CourseNavbar courseTitle="Computer Basics" />
      <div className="content-wrapper">
        <div className="units-sidebar">
          <div className="course-header">
            <div className="course-icon">
              <img src={placeholderimg} alt="Course Icon" />
            </div>
            <h2>Computer Basics</h2>
          </div>
          {units.map((unit) => (
            <div
              key={unit.number}
              className={`unit-item ${activeUnit === unit.number ? 'active' : ''}`}
              onClick={() => setActiveUnit(unit.number)}
            >
              <div className="unit-text">
                <div className="unit-number">UNIT {unit.number}:</div>
                <div className="unit-title">{unit.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="lessons-section">
          <h1>UNIT {activeUnit}: {units[activeUnit - 1].title}</h1>
          <div className="lessons-container">
            {units[activeUnit - 1].lessons.map((lesson, index) => (
              <div key={index} className="lesson-card">
                <div className="lesson-content">
                  <h2>
                    {lesson.number === 'quiz' ? 'Quiz 1' : `Lesson ${lesson.number}: ${lesson.title}`}
                  </h2>
                  <p>{lesson.description}</p>
                </div>
                <div className="button-container">
                  <button 
                    className="start-button"
                    onClick={() => handleStartLesson(lesson.number)}
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonList;
