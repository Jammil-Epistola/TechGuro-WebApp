import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CourseNavbar from "./courseNavbar";
import { useUser } from "../context/UserContext";
import { normalizeSlides } from "../utility/normalizeContent";
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
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // 0 = Recommended
  const [recommendedLessons, setRecommendedLessons] = useState([]);

  const formattedTitle = courseName.replace(/([A-Z])/g, " $1").trim();

  useEffect(() => {
    if (!user) return;

    // Fetch course data
    fetch(`http://localhost:8000/lesson-courses/1`) // hardcoded course_id=1 for now
      .then(res => res.json())
      .then(data => setLessonsData(data))
      .catch(err => console.error("Failed to load lessons:", err));

    // Fetch recommendations
    fetch(`http://localhost:8000/progress-recommendations/${user.user_id}/1`)
      .then(res => res.json())
      .then(data => setRecommendedLessons(data.recommended_lessons || []))
      .catch(err => console.error("Failed to fetch recommendations:", err));
  }, [user]);

  useEffect(() => {
    if (!lessonId) return;

    // ✅ Fetch lesson detail with normalized slides
    fetch(`http://localhost:8000/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        const normalizedSlides = normalizeSlides(data.slides || []);
        setCurrentLesson({ ...data, slides: normalizedSlides });
      })
      .catch(err => console.error("Failed to load lesson detail:", err));
  }, [lessonId]);

  const handleNextSlide = () => {
    if (currentSlide < currentLesson.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getAllLessonsInSection = () => {
    if (!lessonsData) return [];
    if (activeSectionIndex === 0) {
      return lessonsData.units.flatMap((unit) =>
        unit.lessons.filter((l) => recommendedLessons.includes(l.lesson_id))
      );
    } else if (activeSectionIndex === lessonsData.units.length + 1) {
      return []; // Activities placeholder
    } else {
      const unit = lessonsData.units[activeSectionIndex - 1];
      return unit?.lessons || [];
    }
  };

  const proceedToNextLesson = () => {
    const sectionLessons = getAllLessonsInSection();
    const currentIndex = sectionLessons.findIndex(
      (l) => l.lesson_id === currentLesson.lesson_id
    );
    if (currentIndex !== -1 && currentIndex < sectionLessons.length - 1) {
      const nextLesson = sectionLessons[currentIndex + 1];
      // ✅ Fetch next lesson and normalize slides
      fetch(`http://localhost:8000/lessons/${nextLesson.lesson_id}`)
        .then(res => res.json())
        .then(data => {
          const normalizedSlides = normalizeSlides(data.slides || []);
          setCurrentLesson({ ...data, slides: normalizedSlides });
          setCurrentSlide(0);
        })
        .catch(err => console.error("Failed to load next lesson detail:", err));
    } else {
      // End of section → return to LessonList
      navigate(`/courses/${courseName}`);
    }
  };

  const markLessonComplete = () => {
    fetch("http://localhost:8000/progress/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.user_id,
        course_id: 1,
        unit_id: 1,
        lesson_id: currentLesson.lesson_id,
        completed: true,
      }),
    })
      .then((res) => res.json())
      .then(() => proceedToNextLesson())
      .catch((err) => console.error("Failed to update progress:", err));
  };

  const handleLessonClick = (lesson) => {
    fetch(`http://localhost:8000/lessons/${lesson.lesson_id}`)
      .then(res => res.json())
      .then(data => {
        setCurrentLesson(data);
        setCurrentSlide(0);
      })
      .catch(err => console.error("Failed to load lesson detail:", err));
  };

  const handleNextSection = () => {
    if (!lessonsData) return;
    const totalSections = lessonsData.units.length + 2;
    setActiveSectionIndex((prev) => (prev + 1) % totalSections);
  };

  const handlePrevSection = () => {
    if (!lessonsData) return;
    const totalSections = lessonsData.units.length + 2;
    setActiveSectionIndex((prev) => (prev - 1 + totalSections) % totalSections);
  };

  if (!lessonsData || !currentLesson) {
    return (
      <div className="p-10 text-center text-lg font-bold">Loading lesson...</div>
    );
  }

  const slide = currentLesson.slides[currentSlide];

  if (!slide) {
    return (
      <div className="p-10 text-center text-lg font-bold">
        No slide data available.
      </div>
    );
  }

  const sectionLessons = getAllLessonsInSection();

  const getSectionTitle = () => {
    if (activeSectionIndex === 0) return "TEKI’S RECOMMENDED LESSONS";
    if (activeSectionIndex === lessonsData.units.length + 1) return "ACTIVITIES";
    return `UNIT ${activeSectionIndex}: ${lessonsData.units[activeSectionIndex - 1].unit_title}`;
  };

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black flex flex-col">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[300px] bg-[#BFC4D7] p-4 overflow-y-auto border-r border-gray-400">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={placeholderimg}
              alt="Teki"
              className="w-16 h-16 rounded-full border border-black"
            />
            <h2 className="text-[20px] font-bold">{formattedTitle}</h2>
          </div>

          {/* Section Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevSection}
              className="p-2 rounded bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
            >
              {"<"}
            </button>
            <p className="font-bold text-center text-sm mx-2">{getSectionTitle()}</p>
            <button
              onClick={handleNextSection}
              className="p-2 rounded bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
            >
              {">"}
            </button>
          </div>

          {/* Lessons in Section */}
          <div className="mt-2">
            {sectionLessons.length === 0 ? (
              <p className="text-sm italic text-gray-600">No lessons available.</p>
            ) : (
              sectionLessons.map((lesson) => (
                <div
                  key={lesson.lesson_id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`p-2 rounded mb-1 cursor-pointer text-sm transition ${currentLesson.lesson_id === lesson.lesson_id
                    ? "bg-[#F4EDD9] font-semibold border border-[#6B708D]"
                    : "hover:bg-[#e2e6f1]"
                    }`}
                >
                  {lesson.lesson_title}
                </div>
              ))
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(`/courses/${courseName}`)}
            className="w-full py-2 mt-6 bg-[#4C5173] text-white rounded-md text-sm font-semibold hover:bg-[#3a3f5c] transition"
          >
            Back to Lesson List
          </button>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-8 relative">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{currentLesson.lesson_title}</h1>
            <h2 className="text-xl font-semibold text-[#4C5173]">
              Slide {currentSlide + 1} of {currentLesson.slides.length}
            </h2>
          </div>

          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 max-w-[80%] mx-auto mb-10">
            <div className="w-full h-[300px] bg-gray-300 rounded-md mb-6 flex justify-center items-center">
              <span className="text-gray-700">Media Placeholder</span>
            </div>

            {/* ✅ Display content as bullet points */}
            <ul className="list-disc list-inside space-y-2">
              {slide.content.map((text, idx) => (
                <li key={idx} className="text-lg text-justify">
                  {typeof text === "string"
                    ? text.replace(/[{}"]/g, "").replace(/"/g, "").trim()
                    : text}
                </li>
              ))}
            </ul>
          </div>

          {/* Slide Navigation */}
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

            {currentSlide === currentLesson.slides.length - 1 ? (
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
