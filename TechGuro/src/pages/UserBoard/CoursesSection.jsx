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

// --- added: match DashboardSection helpers ---
const COURSES = [
  "Computer Basics",
  "File & Document Handling",
  "Office Tools & Typing Essentials",
  "Internet Safety",
  "Digital Communication",
  "Intro to Online Selling",
];

const courseLessonCounts = {
  "Computer Basics": 15,
  "File & Document Handling": 15,
  "Office Tools & Typing Essentials": 15,
  "Internet Safety": 15,
  "Digital Communication": 15,
  "Intro to Online Selling": 15,
};

const getCourseName = (courseId) => {
  const index = courseId - 1;
  return COURSES[index] || "Unknown Course";
};
// --- end added ---

const CoursesSection = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState([]);

  useEffect(() => {
    const mockCourses = [
      {
        name: "Computer Basics",
        icon: <FaDesktop />,
        description:
          "Learn how to use and navigate a computer for everyday tasks.",
        available: true,
        units: [
          {
            unit: "UNIT 1: Getting to Know Your Computer",
            lessons: [
              "Lesson 1: What is a Computer?",
              "Lesson 2: Parts of a Computer",
              "Lesson 3: Turning On/Off Your Computer",
              "Lesson 4: Exploring the Desktop",
            ],
          },
          {
            unit: "UNIT 2: Basic Navigation Skills",
            lessons: [
              "Lesson 1: Using the Mouse (Click, Double-click, Drag)",
              "Lesson 2: Opening and Closing Programs",
              "Lesson 3: Switching Between Windows",
              "Lesson 4: Using the Start Menu",
            ],
          },
        ],
      },
      {
        name: "File & Document Handling",
        icon: <FaFolderOpen />,
        description:
          "Master saving, organizing, and locating digital files and folders.",
        available: false,
      },
      {
        name: "Office Tools & Typing Essentials",
        icon: <FaKeyboard />,
        description:
          "Practice typing and learn to use Word, Excel, and more.",
        available: false,
      },
      {
        name: "Internet Safety",
        icon: <FaShieldAlt />,
        description:
          "Stay secure online by recognizing risks and protecting your data.",
        available: false,
      },
      {
        name: "Digital Communication",
        icon: <FaComments />,
        description:
          "Use email, messaging apps, and video calls effectively.",
        available: false,
      },
      {
        name: "Intro to Online Selling",
        icon: <FaStore />,
        description:
          "Set up a Facebook Page and start selling online in your area.",
        available: false,
      },
    ];

    const fetchCourses = async () => {
      try {
        // same approach as DashboardSection
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/progress/${user.user_id}`
        );
        const progressData = await res.json();

        // count completed lessons per courseId -> name
        const completedPerCourse = {};
        progressData.forEach((entry) => {
          if (entry.completed) {
            const courseName = getCourseName(entry.course_id);
            completedPerCourse[courseName] =
              (completedPerCourse[courseName] || 0) + 1;
          }
        });

        // compute percentage using the same courseLessonCounts as DashboardSection
        const updatedCourses = mockCourses.map((course) => {
          if (!course.available) return course;

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
    } else {
      setSelectedCourse({ ...course, locked: true });
    }
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
      setSelectedCourse(null);
    }
  };

  return (
    <div className="text-[#4C5173]">
      <h2 className="text-left text-[40px] font-bold mb-5">COURSES</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {courseData.map((course, index) => (
          <div
            key={index}
            onClick={() => handleCourseClick(course)}
            className={`flex items-center bg-white p-5 rounded-lg cursor-pointer min-h-[200px] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${
              course.available
                ? "border-2 border-green-600"
                : "border-2 border-gray-300 opacity-80"
            }`}
          >
            <div className="flex flex-col items-center w-[300px] p-2">
              <div className="text-[40px] mb-2">{course.icon}</div>
              <h3 className="text-[24px] font-bold text-[#333] break-words whitespace-normal text-center mb-2">
                {course.name}
              </h3>
            </div>

            <div className="w-[3px] h-full bg-white mx-5"></div>

            <div className="flex-1">
              <p className="text-[14px] leading-relaxed text-[#666] mb-3">
                {course.description}
              </p>
              <div className="flex flex-col mt-2">
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B708D] h-full"
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-center">
                  {course.available
                    ? `${course.progress || 0}% completed`
                    : "Not Available"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-[95%] max-w-[1300px] h-[80vh] z-[201] flex flex-col lg:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left */}
            <div className="w-full lg:w-[40%] bg-[#4C5173] text-white p-8 flex flex-col justify-center">
              <div className="text-[4rem] mb-6">{selectedCourse.icon}</div>
              <h2 className="text-[2.5rem] font-bold">{selectedCourse.name}</h2>
              <p className="mt-4 text-[1.2rem] leading-relaxed">
                {selectedCourse.description}
              </p>
              {selectedCourse.lessons && (
                <div className="mt-6 flex items-center gap-2 text-[1.1rem] text-white">
                  <FaBookOpen />
                  <span>{selectedCourse.lessons} Lessons</span>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="w-full lg:w-[60%] bg-[#f8f8f8] p-8 overflow-y-auto">
              {selectedCourse.units ? (
                <>
                  <h3 className="text-[1.5rem] font-bold text-[#333] mb-4">
                    📘 What You'll Learn
                  </h3>
                  {selectedCourse.units.map((unit, idx) => (
                    <div key={idx} className="mb-6">
                      <h4 className="text-[1.2rem] font-semibold text-[#4C5173] mb-2">
                        {unit.unit}
                      </h4>
                      <ul className="list-disc list-inside text-[1rem] text-[#555]">
                        {unit.lessons.map((lesson, lid) => (
                          <li key={lid}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              ) : selectedCourse.locked ? (
                <div className="mt-8 text-center">
                  <p className="text-[1.2rem] text-[#666] mb-5">
                    This course is still being developed.
                  </p>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-6 py-3 bg-[#4C5173] text-white rounded-md text-[1.1rem] hover:bg-[#3a3f5c]"
                  >
                    Okay
                  </button>
                </div>
              ) : null}

              {!selectedCourse.locked && (
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
