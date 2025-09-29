//CoursesSection
import React, { useState, useEffect, useContext } from "react";
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
import { useUser } from "../../context/UserContext";

const COURSES = [
  "Computer Basics",
  "Internet Safety",
  "Digital Communication and Messaging",
];

const courseLessonCounts = {
  "Computer Basics": 5,
  "Internet Safety": 8,
  "Digital Communication and Messaging": 5,
};

const getCourseName = (courseId) => {
  const index = courseId - 1;
  return COURSES[index] || "Unknown Course";
};

const CoursesSection = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const mockCourses = [
      {
        name: "Computer Basics",
        icon: <FaDesktop />,
        description:
          "Learn how to use and navigate a computer for everyday tasks.",
        available: true,
        lessons: [
          "What is a Computer?",
          "Hardware and Software",
          "How to use a Computer",
          "How to Install an Application",
          "Common Troubleshooting Techniques",
        ],
      },
      {
        name: "Internet Safety",
        icon: <FaShieldAlt />,
        description:
          "Stay secure online by recognizing risks and protecting your data.",
        available: true,
        lessons: [
          "What is the Internet?",
          "Recognizing Fake News",
          "Learn about Online Scams",
          "Avoiding Malware",
          "How to Protect Your Privacy"
        ],
      },
      {
        name: "Digital Communication and Messaging",
        icon: <FaComments />,
        description:
          "Use email, messaging apps, and video calls effectively.",
        available: true,
        lessons: [
          "Communicating Online",
          "How to Use an Email",
          "How to Use Messaging Apps ",
          "Video Communication",
          "Online Etiquette and Safety",
        ],
      },
    ];

    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/progress/${user.user_id}`
        );
        const progressData = await res.json();

        const completedPerCourse = {};
        progressData.forEach((entry) => {
          if (entry.completed) {
            const courseName = getCourseName(entry.course_id);
            completedPerCourse[courseName] =
              (completedPerCourse[courseName] || 0) + 1;
          }
        });

        const updatedCourses = mockCourses.map((course) => {
          const completed = completedPerCourse[course.name] || 0;
          const total = courseLessonCounts[course.name] || 1;
          const percent = Math.round((completed / total) * 100);

          return { ...course, progress: percent };
        });

        setCourseData(updatedCourses);
      } catch (err) {
        console.error("Failed to fetch course progress:", err);
        setCourseData(mockCourses);
      }
    };

    if (user?.user_id) {
      fetchCourses();
    }
  }, [user.user_id]);

  const handleCourseClick = (course) => {
    if (course.available) {
      setSelectedCourse(course);
      setIsModalVisible(true);
    } else {
      setSelectedCourse({ ...course, locked: true });
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedCourse(null), 300); // Wait for fade out animation
  };

  const handleStartCourse = async () => {
    if (!selectedCourse || selectedCourse.locked) return;

    const coursePath = selectedCourse.name.replace(/\s+/g, "");
    const courseId = COURSES.indexOf(selectedCourse.name) + 1 || 1;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/progress-recommendations/${user.user_id}/${courseId}`
      );
      const data = await res.json();

      if (data.recommended_lessons && data.recommended_lessons.length > 0) {
        navigate(`/courses/${coursePath}`);
      } else {
        navigate(`/courses/${coursePath}/Pre-Assessment`);
      }
    } catch (error) {
      console.error("Error checking course progress:", error);
      navigate(`/courses/${coursePath}/Pre-Assessment`); // fallback
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div className="text-[#4C5173]">
      <h2 className="text-left text-[40px] font-bold mb-5">COURSES</h2>

      <div className="text-[#4C5173] flex justify-center">
        <div className="w-full max-w-[1200px] px-5 py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {courseData.map((course, index) => (
            <div
              key={index}
              onClick={() => handleCourseClick(course)}
              className={`flex flex-col bg-white border rounded-lg cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:scale-105 animate-fadeIn ${
                course.available 
                  ? "border-4 border-[#4C5173] hover:border-[#6B708D]" 
                  : "border-4 border-gray-300 opacity-80"
              }`}
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Top Section*/}
              <div className="flex justify-center items-center bg-[#f0f0f0] p-6 transition-colors duration-300 hover:bg-[#e8e8e8]">
                <div className="text-[90px] transition-transform duration-300 hover:scale-110">{course.icon}</div>
              </div>

              {/* Bottom Section - Text + Progress */}
              <div className="flex flex-col p-5 gap-3">
                <h3 className="text-[24px] font-bold text-center text-[#333] transition-colors duration-300 hover:text-[#4C5173]">{course.name}</h3>
                <p className="text-[14px] text-[#666] text-center">{course.description}</p>

                {/* Progress Bar */}
                <div className="flex flex-col items-center mt-3">
                  <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6B708D] h-full transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-[#4C5173]">
                    {course.available ? `${course.progress || 0}% completed` : "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div
          className={`fixed inset-0 bg-black/60 z-[200] flex justify-center items-center transition-opacity duration-300 ${
            isModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-xl shadow-xl w-[95%] max-w-[1300px] h-[80vh] z-[201] flex flex-col lg:flex-row overflow-hidden relative transition-all duration-500 ease-out ${
              isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left */}
            <div className="w-full lg:w-[40%] bg-[#4C5173] text-white p-8 flex flex-col justify-center">
              <div className="text-[4.5rem] mb-6 animate-fadeInLeft">{selectedCourse.icon}</div>
              <h2 className="text-[3rem] font-bold animate-fadeInLeft" style={{ animationDelay: '100ms' }}>{selectedCourse.name}</h2>
              <p className="mt-4 text-[1.7rem] leading-relaxed animate-fadeInLeft" style={{ animationDelay: '200ms' }}>
                {selectedCourse.description}
              </p>
              {selectedCourse.lessons && (
                <div className="mt-6 flex items-center gap-2 text-[1.4rem] text-white animate-fadeInLeft" style={{ animationDelay: '300ms' }}>
                  <FaBookOpen />
                  <span>{selectedCourse.lessons.length} Lessons</span>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="w-full lg:w-[60%] bg-[#f8f8f8] p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                {selectedCourse.lessons ? (
                  <div className="animate-fadeInRight">
                    <h3 className="text-[2rem] font-bold text-[#333] mb-6">
                      📘 Course Lessons
                    </h3>
                    <div className="space-y-3">
                      {selectedCourse.lessons.map((lesson, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#4C5173] transition-all duration-300 hover:shadow-md hover:bg-[#f9f9f9] animate-fadeInUp"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-[#4C5173] text-white rounded-full text-sm font-bold mr-4">
                            {idx + 1}
                          </div>
                          <span className="text-[1.5rem] text-[#555] font-medium">{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedCourse.locked ? (
                  <div className="mt-8 text-center animate-fadeInRight">
                    <p className="text-[1.7rem] text-[#666] mb-5">
                      This course is still being developed.
                    </p>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-[#4F7942] text-white rounded-md text-[1.6rem] hover:bg-[#3a3f5c] transition-colors duration-300"
                    >
                      Okay
                    </button>
                  </div>
                ) : null}
              </div>

              {!selectedCourse.locked && (
                <div className="flex gap-4 mt-8 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                  <button
                    onClick={handleStartCourse}
                    className="flex-1 bg-[#4F7942] text-white py-4 text-[1.7rem] font-bold rounded-md hover:bg-[#478778] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Start Course
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-[#880808] text-white py-4 text-[1.7rem] font-bold rounded-md hover:bg-[#5c0505] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default CoursesSection;