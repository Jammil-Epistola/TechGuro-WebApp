import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDesktop,
  FaFolderOpen,
  FaKeyboard,
  FaShieldAlt,
  FaComments,
  FaStore,
  FaBookOpen,
} from "react-icons/fa";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      icon: <FaDesktop />,
      name: "Computer Basics",
      description: "Learn how to use and navigate a computer for everyday tasks.",
      available: true,
      lessons: 12,
    },
    {
      icon: <FaFolderOpen />,
      name: "File & Document Handling",
      description: "Master saving, organizing, and locating digital files and folders.",
      available: false,
    },
    {
      icon: <FaKeyboard />,
      name: "Office Tools & Typing Essentials",
      description: "Practice typing and learn to use Word, Excel, and more.",
      available: false,
    },
    {
      icon: <FaShieldAlt />,
      name: "Internet Safety",
      description: "Stay secure online by recognizing risks and protecting your data.",
      available: false,
    },
    {
      icon: <FaComments />,
      name: "Digital Communication",
      description: "Use email, messaging apps, and video calls effectively.",
      available: false,
    },
    {
      icon: <FaStore />,
      name: "Intro to Online Selling",
      description: "Set up a Facebook Page and start selling online in your area.",
      available: false,
    }
  ];

  const handleCourseClick = (course) => {
    if (course.name === "Computer Basics") {
      setSelectedCourse(course);
    } else {
      setSelectedCourse({ ...course, locked: true });
    }
  };

  const handleStartCourse = () => {
  if (selectedCourse && !selectedCourse.locked) {
    const coursePath = selectedCourse.name.replace(/\s+/g, '');
    navigate(`/courses/${coursePath}/Pre-Assessment`);
    setSelectedCourse(null);
  }
}

  const computerBasicsLessons = [
    {
      unit: "UNIT 1: Getting to Know Your Computer",
      lessons: [
        "Lesson 1: What is a Computer?",
        "Lesson 2: Parts of a Computer",
        "Lesson 3: Turning On/Off Your Computer",
        "Lesson 4: Exploring the Desktop"
      ],
    },
    {
      unit: "UNIT 2: Basic Navigation Skills",
      lessons: [
        "Lesson 1: Using the Mouse (Click, Double-click, Drag)",
        "Lesson 2: Opening and Closing Programs",
        "Lesson 3: Switching Between Windows",
        "Lesson 4: Using the Start Menu"
      ],
    },
  ];

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

      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center" onClick={() => setSelectedCourse(null)}>
          <div
            className="bg-white rounded-xl shadow-xl w-[95%] max-w-[1300px] h-[80vh] z-[201] flex flex-col lg:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left */}
            <div className="w-full lg:w-[40%] bg-[#4C5173] text-white p-8 flex flex-col justify-center">
              <div className="text-[4rem] mb-6">{selectedCourse.icon}</div>
              <h2 className="text-[2.5rem] font-bold">{selectedCourse.name}</h2>
              <p className="mt-4 text-[1.2rem] leading-relaxed">{selectedCourse.description}</p>
              {selectedCourse.lessons && (
                <div className="mt-6 flex items-center gap-2 text-[1.1rem] text-white">
                  <FaBookOpen />
                  <span>{selectedCourse.lessons} Lessons</span>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="w-full lg:w-[60%] bg-[#f8f8f8] p-8 overflow-y-auto">
              {selectedCourse.name === "Computer Basics" && (
                <div>
                  <h3 className="text-[1.5rem] font-bold text-[#333] mb-4">📘 What You'll Learn</h3>
                  {computerBasicsLessons.map((unit, idx) => (
                    <div key={idx} className="mb-6">
                      <h4 className="text-[1.2rem] font-semibold text-[#4C5173] mb-2">{unit.unit}</h4>
                      <ul className="list-disc list-inside text-[1rem] text-[#555]">
                        {unit.lessons.map((lesson, lid) => (
                          <li key={lid}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {selectedCourse.locked ? (
                <div className="mt-8 text-center">
                  <p className="text-[1.2rem] text-[#666] mb-5">This course is still being developed.</p>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-6 py-3 bg-[#4C5173] text-white rounded-md text-[1.1rem] hover:bg-[#3a3f5c]"
                  >
                    Okay
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartCourse}
                  className="w-full mt-8 bg-[#4C5173] text-white py-4 text-[1.2rem] font-bold rounded-md hover:bg-[#3a3f5c]"
                >
                  Start Course
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
