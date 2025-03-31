import React, { useState } from "react";
import MainNavbar from "../MainNavbar";
import { FaDesktop, FaMobileAlt, FaShieldAlt, FaUniversity, FaWallet, FaMicrosoft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../pagesCSS/CoursePage.css";

const courses = [
  { icon: <FaDesktop />, title: "Computer Basics", description: "Master the fundamentals of computer operations, from hardware components to software applications, and learn essential computer navigation skills.", completed: 0, total: 6, available: true },
  { icon: <FaMobileAlt />, title: "Smartphone Basics", description: "Learn essential smartphone operations, from basic functions to advanced features, and discover how to use mobile apps effectively.", completed: 0, total: 6, available: false },
  { icon: <FaShieldAlt />, title: "Internet Safety", description: "Develop crucial online safety skills, learn to identify potential threats, and understand how to protect yourself while browsing the internet.", completed: 0, total: 6, available: false },
  { icon: <FaShieldAlt />, title: "Basic CyberSecurity", description: "Learn essential cybersecurity practices, from password management to recognizing online scams, and protect your digital presence.", completed: 0, total: 6, available: false },
  { icon: <FaUniversity />, title: "Online Transaction", description: "Master online government services, including PhilHealth, SSS, PAG-IBIG, and learn how to process official documents digitally.", completed: 0, total: 6, available: false },
  { icon: <FaMicrosoft />, title: "Microsoft Basics", description: "Learn fundamental Microsoft Office applications, from Word to Excel, and develop essential digital productivity skills.", completed: 0, total: 6, available: false },
];

const CoursePage = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCourseClick = (course) => {
    if (course.available) {
      navigate('/courses/ComputerBasics/Pre-Assessment');
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className={`course-container ${!isNavbarOpen ? 'navbar-closed' : ''}`}>
      <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />
      <div className="course-content">
        <h1 className="course-title">COURSE SELECTION</h1>
        <div className="course-list">
          {courses.map((course, index) => (
            <div 
              key={index} 
              className={`course-card ${course.available ? 'available' : 'unavailable'}`}
              onClick={() => handleCourseClick(course)}
            >
              {/* Left Side: Icon and Title */}
              <div className="course-left">
                <div className="icon-container">{course.icon}</div>
                <h2 className="course-name">{course.title}</h2>
              </div>

              {/* Separator Line */}
              <div className="course-separator"></div>

              {/* Right Side: Description and Progress */}
              <div className="course-right">
                <p className="course-description">{course.description}</p>
                <div className="progress-container">
                  <progress value={course.completed} max={course.total}></progress>
                  <span>You've completed <strong>{course.completed}/{course.total}</strong> lessons in {course.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for unavailable courses */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Coming Soon</h2>
            <p>This course is currently under development.</p>
            <button onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
