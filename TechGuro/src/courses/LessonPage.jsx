import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CourseNavbar from "./courseNavbar";
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

// Mock lesson data per course — Replace this with your real data source
const lessonData = {
  ComputerBasics: {
    title: "Computer Basics",
    units: [
      {
        title: "Getting to Know Your Computer",
        lessons: [
          "Lesson 1: What is a Computer?",
          "Lesson 2: Parts of a Computer",
          "Lesson 3: Turning On/Off Your Computer",
          "Lesson 4: Exploring the Desktop"
        ]
      }
    ],
    slides: [
      {
        text: "Welcome to the lesson! Here you will learn the basics of computers.",
        media: "Image or Video Placeholder 1"
      },
      {
        text: "A computer has two main parts: Hardware and Software.",
        media: "Image or Video Placeholder 2"
      },
      {
        text: "Let's explore different types of computers: desktops, laptops, and tablets.",
        media: "Image or Video Placeholder 3"
      }
    ]
  }
};

const LessonPage = () => {
  const { courseName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lessonNumber } = location.state || {};
  const [currentSlide, setCurrentSlide] = useState(0);

  const course = lessonData[courseName] || {};
  const unit = course.units?.[0]; // Assuming Unit 1 for now
  const slides = course.slides || [];
  const totalSlides = slides.length;

  const handleBackToList = () => {
    navigate(`/courses/${courseName}`);
  };

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(currentSlide + 1);
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black flex flex-col">
      <CourseNavbar courseTitle={course.title || "Course"} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Old Style with Color Fix */}
        <div className="w-[300px] bg-[#BFC4D7] p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={placeholderimg}
              alt="Course Icon"
              className="w-14 h-14 rounded-full object-cover border border-black"
            />
            <h2 className="text-xl font-bold">{course.title || "Course Name"}</h2>
          </div>

          {/* Unit 1 Lessons List */}
          {unit && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-[#4C5173]">UNIT 1: {unit.title}</h3>
              {unit.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md mb-2 cursor-pointer ${
                    lessonNumber === index + 1 ? "bg-[#F4EDD9]" : "hover:bg-[#D3D6E4]"
                  }`}
                >
                  <p className="font-medium text-sm">{lesson}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleBackToList}
            className="w-full py-2 mt-4 bg-[#4C5173] text-white rounded-md text-sm font-semibold hover:bg-[#3a3f5c] transition"
          >
            Back to Lesson List
          </button>
        </div>

        {/* Main Lesson Content */}
        <div className="flex-1 p-8 relative">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Lesson {lessonNumber}</h1>
            <h2 className="text-xl font-semibold text-[#4C5173]">
              Slide {currentSlide + 1} of {totalSlides}
            </h2>
          </div>

          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 max-w-4xl mx-auto mb-10">
            <div className="w-full h-[200px] bg-gray-300 rounded-md mb-6 flex justify-center items-center">
              <span className="text-gray-700">{slides[currentSlide]?.media}</span>
            </div>
            <p className="text-lg text-justify">{slides[currentSlide]?.text}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between max-w-4xl mx-auto">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className={`px-4 py-2 rounded-md font-semibold ${
                currentSlide === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNextSlide}
              disabled={currentSlide === totalSlides - 1}
              className={`px-4 py-2 rounded-md font-semibold ${
                currentSlide === totalSlides - 1
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
