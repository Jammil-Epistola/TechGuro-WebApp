import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CourseNavbar from "./courseNavbar";
import { useUser } from "../context/UserContext";
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

const LessonPage = () => {
  const { courseName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { lessonId } = location.state || {};

  const [lessonsData, setLessonsData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSidebarSection, setActiveSidebarSection] = useState("unit");

  useEffect(() => {
    fetch('/data/computer_basics_lessons.json')
      .then(res => res.json())
      .then(data => {
        setLessonsData(data);
        // Find the lesson by ID
        let foundLesson = null;
        for (const unit of data.units) {
          const match = unit.lessons.find(lesson => lesson.lesson_id === lessonId);
          if (match) {
            foundLesson = { ...match, unitTitle: unit.unit_title };
            break;
          }
        }
        setCurrentLesson(foundLesson);
      })
      .catch(err => console.error("Failed to load lessons JSON:", err));
  }, [lessonId]);


  const handleNextSlide = () => {
    if (currentSlide < (currentLesson.slides.length - 1)) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const markLessonComplete = () => {
    fetch("http://localhost:8000/progress/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.user_id,
        course_id: 1,
        unit_id: 1,  // Can update later if dynamic units are needed
        lesson_id: lessonId,
        completed: true
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Lesson marked complete:", data);
        navigate(`/courses/${courseName}`);
      })
      .catch(err => console.error("Failed to update progress:", err));
  };

  const handleLessonClick = (lessonId) => {
    const lesson = lessonsData.units.flatMap(unit => unit.lessons)
      .find(lesson => lesson.lesson_id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentSlide(0);
    }
  };

  if (!lessonsData || !currentLesson) {
    return <div className="p-10 text-center text-lg font-bold">Loading lesson...</div>;
  }

  const totalSlides = currentLesson.slides.length;
  const slide = currentLesson.slides[currentSlide];


  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black flex flex-col">
      <CourseNavbar courseTitle={lessonsData.course_title || "Course"} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[300px] bg-[#BFC4D7] p-4 overflow-y-auto border-r border-gray-400">
          {/* Teki Icon + Course Title */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={placeholderimg}
              alt="Teki"
              className="w-16 h-16 rounded-full border border-black"
            />
            <h2 className="text-[20px] font-bold">{lessonsData.course_title}</h2>
          </div>

          {/* Recommended Lessons */}
          <div
            onClick={() => setActiveSidebarSection("recommended")}
            className={`p-4 mb-2 rounded cursor-pointer transition 
      ${activeSidebarSection === "recommended" ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
          >
            <p className="font-bold text-sm">TEKI'S RECOMMENDED LESSONS</p>
          </div>

          {/* Units with Lesson Links */}
          {lessonsData.units.map((unit, idx) => (
            <div key={idx} className="mb-4">
              {/* Unit Header */}
              <div
                onClick={() => setActiveSidebarSection(`unit${idx}`)}
                className={`p-3 rounded cursor-pointer transition 
          ${activeSidebarSection === `unit${idx}` ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
              >
                <p className="font-bold text-sm">UNIT {idx + 1}: {unit.unit_title}</p>
              </div>

              {/* Lessons under Unit */}
              {activeSidebarSection === `unit${idx}` && (
                <div className="ml-3 mt-2">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.lesson_id}
                      onClick={() => handleLessonClick(lesson.lesson_id)}
                      className={`p-2 rounded mb-1 cursor-pointer text-sm transition 
                ${currentLesson.lesson_id === lesson.lesson_id ? 'bg-[#e0e2f0]' : 'hover:bg-[#e2e6f1]'}`}
                    >
                      Lesson {lesson.lesson_id}: {lesson.lesson_title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Activities Section */}
          <div
            onClick={() => setActiveSidebarSection("activities")}
            className={`p-4 mb-2 rounded cursor-pointer transition 
      ${activeSidebarSection === "activities" ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
          >
            <p className="font-bold text-sm">ACTIVITIES</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(`/courses/${courseName}`)}
            className="w-full py-2 mt-6 bg-[#4C5173] text-white rounded-md text-sm font-semibold hover:bg-[#3a3f5c] transition"
          >
            Back to Lesson List
          </button>
        </div>


        {/* Main Lesson Content */}
        <div className="flex-1 p-8 relative">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{currentLesson.lesson_title}</h1>
            <h2 className="text-xl font-semibold text-[#4C5173]">
              Slide {currentSlide + 1} of {totalSlides}
            </h2>
          </div>

          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 max-w-[80%] mx-auto mb-10">
            <div className="w-full h-[300px] bg-gray-300 rounded-md mb-6 flex justify-center items-center">
              <span className="text-gray-700">Media Placeholder</span>
            </div>
            {slide.content.map((text, idx) => (
              <p key={idx} className="text-lg text-justify mb-4">{text}</p>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between max-w-[80%] mx-auto">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className={`px-4 py-2 rounded-md font-semibold ${currentSlide === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                }`}
            >
              Previous
            </button>

            {currentSlide === totalSlides - 1 ? (
              <button
                onClick={markLessonComplete}
                className="px-4 py-2 rounded-md font-semibold bg-[#B6C44D] text-black hover:bg-[#a5b83d]"
              >
                Mark Complete
              </button>
            ) : (
              <button
                onClick={handleNextSlide}
                className="px-4 py-2 rounded-md font-semibold bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
