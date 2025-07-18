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
    <div className="text-[#4C5173]">
      <h2 className="text-left text-[40px] font-bold mb-5">COURSES</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {courses.map((course, index) => (
          <div
            key={index}
            onClick={() => handleCourseClick(course)}
            className={`flex items-center bg-white p-5 rounded-lg cursor-pointer min-h-[200px] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${course.available ? 'border-2 border-green-600' : 'border-2 border-gray-300 opacity-80'}`}
          >
            <div className="flex flex-col items-center w-[300px] p-2">
              <div className="text-[40px] mb-2">{course.icon}</div>
              <h3 className="text-[24px] font-bold text-[#333] break-words whitespace-normal text-center mb-2">{course.name}</h3>
            </div>

            <div className="w-[3px] h-full bg-white mx-5"></div>

            <div className="flex-1">
              <p className="text-[14px] leading-relaxed text-[#666] mb-3">{course.description}</p>
              <div className="flex flex-col mt-2">
                <progress
                  value={course.available ? "16" : "0"}
                  max="100"
                  className="w-full h-3 rounded-md [&::-webkit-progress-bar]:bg-gray-300 [&::-webkit-progress-value]:bg-green-600"
                ></progress>
                <span className="text-sm mt-1">{course.available ? "16% Complete" : "Not Available"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unavailable Course Modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center z-[1000]" onClick={() => setShowModal(false)}>
          <div className="bg-white p-8 rounded-xl text-center max-w-sm w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[24px] font-bold text-[#333] mb-2">Course Unavailable</h2>
            <p className="text-[16px] text-[#666] mb-5">This course is still being developed.</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-[#4C5173] text-white rounded-md text-[16px] hover:bg-[#3a3f5c]"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
