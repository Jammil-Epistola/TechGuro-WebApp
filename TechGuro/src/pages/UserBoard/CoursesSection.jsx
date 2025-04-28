import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDesktop,
  FaFileAlt,
  FaTools,
  FaGlobe,
  FaBookOpen,
  FaPaintBrush,
} from "react-icons/fa";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const courses = [
    {
      icon: <FaDesktop />,
      name: "Computer Basics",
      description: "Learn how to navigate and use a computer for daily tasks with ease.",
      available: true,
    },
    {
      icon: <FaFileAlt />,
      name: "File & Document Handling",
      description: "Understand how to safely perform digital transactions for bills, shopping, and banking.",
      available: false,
    },
    {
      icon: <FaBookOpen />,
      name: "Microsoft Essentials",
      description: "Master the basics of Microsoft Word, Excel, and PowerPoint.",
      available: false,
    },
    {
      icon: <FaGlobe />,
      name: "Internet Safety",
      description: "Stay safe online by understanding how to protect your information.",
      available: false,
    },
    {
      icon: <FaTools />,
      name: "Computer Maintenance",
      description: "Protect yourself from online threats by learning cybersecurity basics.",
      available: false,
    },
    {
      icon: <FaPaintBrush />,
      name: "Creative Tools (Photos & Design)",
      description: "Learn how to use a smartphone efficiently, from calls to apps.",
      available: false,
    }
  ];

  const handleCourseClick = (course) => {
    if (course.available) {
      if (course.name === "Computer Basics") {
        navigate("/courses/ComputerBasics/Pre-Assessment");
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="course-container">
      <div className="course-list">
        {courses.map((course, index) => (
          <div
            key={index}
            className={`course-card ${course.available ? "available" : "unavailable"}`}
            onClick={() => handleCourseClick(course)}
          >
            <div className="course-left">
              <div className="icon-container">{course.icon}</div>
              <h3 className="course-name">{course.name}</h3>
            </div>
            <div className="course-separator"></div>
            <div className="course-right">
              <p className="course-description">{course.description}</p>
              <div className="progress-container">
                <progress value={course.available ? "16" : "0"} max="100"></progress>
                <span>{course.available ? "16% Complete" : "Not Available"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unavailable Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Course Unavailable</h2>
            <p>This course is still being developed.</p>
            <button className="modal-button" onClick={() => setShowModal(false)}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesSection; 