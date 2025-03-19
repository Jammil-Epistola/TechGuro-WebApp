import React, { useState } from "react";
import MainNavbar from "../MainNavbar";
import { FaDesktop, FaMobileAlt, FaGlobe, FaShieldAlt, FaUniversity, FaWallet } from "react-icons/fa";
import "../pagesCSS/CoursePage.css";

const courses = [
  { icon: <FaDesktop />, title: "About Computers", description: "Understand the basics of computers, including hardware, software, and how to navigate a computer system.", completed: 3, total: 6 },
  { icon: <FaMobileAlt />, title: "About Phones", description: "Learn how to use smartphones effectively, from making calls to installing and using apps.", completed: 3, total: 6 },
  { icon: <FaGlobe />, title: "The Internet", description: "A guide to browsing the web, using search engines, and staying safe online.", completed: 10, total: 10 },
  { icon: <FaShieldAlt />, title: "Basic CyberSecurity", description: "Learn how to protect your personal data, recognize scams, and keep your accounts secure.", completed: 2, total: 8 },
  { icon: <FaUniversity />, title: "Government Services", description: "Navigate online services like PhilHealth, SSS, PAG-IBIG, and applying for official documents online.", completed: 0, total: 5 },
  { icon: <FaWallet />, title: "Online Banking", description: "Learn how to use online banking apps, e-wallets like GCash, and make secure transactions.", completed: 0, total: 5 },
];

const CoursePage = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  return (
    <div className="course-container">
      <MainNavbar isOpen={isNavbarOpen} toggleSidebar={() => setIsNavbarOpen(!isNavbarOpen)} />
      <div className="course-content">
        <h1 className="course-title">COURSE SELECTION</h1>
        <div className="course-list">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
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
                  <span>You’ve completed <strong>{course.completed}/{course.total}</strong> lessons in {course.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
