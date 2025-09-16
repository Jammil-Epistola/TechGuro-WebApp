//LessonPage.jsx
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
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [progressData, setProgressData] = useState(null);

  const formattedTitle = courseName.replace(/([A-Z])/g, " $1").trim();
  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  useEffect(() => {
    if (!user) return;

    // First, get the correct course ID by matching courseName
    const fetchCourseData = async () => {
      try {
        // Get courses list to find matching course ID
        const coursesRes = await fetch(`http://localhost:8000/courses`);
        if (!coursesRes.ok) throw new Error("Failed to fetch courses list.");
        const courses = await coursesRes.json();

        const matchedCourse = courses.find(
          c => normalize(c.title) === normalize(courseName)
        );
        
        if (!matchedCourse) {
          console.error(`No course found for ${courseName}`);
          return;
        }

        const courseId = matchedCourse.id;

        // Fetch course data with correct course ID
        const lessonsRes = await fetch(`http://localhost:8000/lesson-courses/${courseId}`);
        if (!lessonsRes.ok) throw new Error("Failed to fetch lessons data.");
        const lessonsData = await lessonsRes.json();
        setLessonsData(lessonsData);

        // UPDATED: Use BKT recommendations endpoint (same as LessonList)
        try {
          const bktRes = await fetch(
            `http://localhost:8000/bkt/recommendations/${user.user_id}/${courseId}?threshold=0.7&limit=10`
          );

          if (!bktRes.ok) throw new Error("Failed to fetch BKT recommendations.");
          const bktData = await bktRes.json();

          console.log("BKT recommendations data:", bktData);
          setRecommendedLessons(bktData.recommended_lessons || []);

          // Fetch progress data
          const progressRes = await fetch(`http://localhost:8000/progress-recommendations/${user.user_id}/${courseId}`);
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgressData(progressData);
          }

        } catch (bktError) {
          console.error("BKT recommendations failed:", bktError);
          
          // Fallback to old endpoint if BKT fails
          try {
            const progressRes = await fetch(`http://localhost:8000/progress-recommendations/${user.user_id}/${courseId}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              setProgressData(progressData);
              setRecommendedLessons(progressData.recommended_lessons || []);
            }
          } catch (fallbackError) {
            console.error("All recommendation endpoints failed:", fallbackError);
            setRecommendedLessons([]);
          }
        }

      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    };

    fetchCourseData();
  }, [user, courseName]);

  useEffect(() => {
    if (!lessonId) return;

    // ✅ Fetch lesson detail with normalized slides
    fetch(`http://localhost:8000/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
        setCurrentLesson(normalized);
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

      const lessonMap = new Map(
        lessonsData.units.flatMap(u => u.lessons).map(l => [l.lesson_id, l])
      );

      // Get recommended lessons and sort them by lesson_id
      const recommendedLessonsData = recommendedLessons
        .map(id => lessonMap.get(id))
        .filter(Boolean)
        .sort((a, b) => a.lesson_id - b.lesson_id);

      return recommendedLessonsData;
    } else if (activeSectionIndex === lessonsData.units.length + 1) {
      return [];
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
          const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
          setCurrentLesson(normalized);
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
      .then(() => {
        // 🔄 Refresh progress so button updates immediately
        return fetch(`http://localhost:8000/progress-recommendations/${user.user_id}/1`);
      })
      .then((res) => res.json())
      .then((data) => {
        setProgressData(data);
        setRecommendedLessons(data.recommended_lessons || []);
        proceedToNextLesson();
      })
      .catch((err) => console.error("Failed to update progress:", err));
  };

  const handleLessonClick = (lesson) => {
    fetch(`http://localhost:8000/lessons/${lesson.lesson_id}`)
      .then(res => res.json())
      .then(data => {
        const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
        setCurrentLesson(normalized);
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

  const isLessonCompleted = (lessonId) => {
    return progressData?.completed_lessons?.includes(lessonId);
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
    if (activeSectionIndex === 0) return "TEKI'S RECOMMENDED LESSONS";
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
        <div className="flex-1 p-8 relative flex flex-col">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{currentLesson.lesson_title}</h1>
            <h2 className="text-xl font-semibold text-[#4C5173]">
              Slide {currentSlide + 1} of {currentLesson.slides.length}
            </h2>
          </div>

          {/* White Container*/}
          <div className="bg-white rounded-lg border border-gray-300 shadow-md p-6 mb-6 flex-1 flex flex-col">
            {/* Media Section */}
            <div className="w-full h-[300px] mb-6 flex justify-center items-center bg-gray-100 rounded-md">
              {slide.media_url ? (
                slide.media_url.endsWith(".mp4") ? (
                  <video controls className="w-full h-full rounded-md">
                    <source src={`/images/lessons/${slide.media_url}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={`/images/lessons/${slide.media_url}`}
                    alt={slide.slide_title}
                    className="w-full h-full object-contain rounded-md"
                    onError={(e) => { e.target.src = placeholderimg; }}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-md flex justify-center items-center">
                  <span className="text-gray-700">No media available</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 mb-8">
              <ul className="list-disc pl-6 space-y-2">
                {slide.content.map((text, idx) => (
                  <li key={idx} className="text-lg text-justify">
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Navigation - Inside the white container, below content */}
            <div className="flex justify-between items-center">
              {/* Left side - Previous button */}
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className={`px-6 py-3 rounded-md font-semibold text-lg transform scale-120 ${currentSlide === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                  }`}
              >
                Previous
              </button>

              {/* Right side - Next/Complete buttons */}
              <div className="flex gap-4">
                {currentSlide === currentLesson.slides.length - 1 ? (
                  isLessonCompleted(currentLesson.lesson_id) ? (
                    <button
                      onClick={proceedToNextLesson}
                      className="px-6 py-3 rounded-md font-semibold text-lg transform scale-120 text-white bg-[#0077FF] hover:bg-[#17559D] active:bg-[#17559D]"
                    >
                      Done Reviewing
                    </button>
                  ) : (
                    <button
                      onClick={markLessonComplete}
                      className="px-6 py-3 rounded-md font-semibold text-lg transform scale-120 bg-[#B6C44D] text-black hover:bg-[#a5b83d]"
                    >
                      Mark Complete
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleNextSlide}
                    className="px-6 py-3 rounded-md font-semibold text-lg transform scale-120 bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;