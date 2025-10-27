//LessonPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import CourseNavbar from "./courseNavbar";
import { useUser } from "../context/UserContext";
import { useMilestone } from '../context/MilestoneContext';
import { normalizeSlides } from "../utility/normalizeContent";
import useTTS from "../hooks/useTTS";
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";
import { Volume2, VolumeX, Play, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const LessonPage = () => {
  const { courseName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showMilestone } = useMilestone();
  const { lessonId } = location.state || {};

  const [lessonsData, setLessonsData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [progressData, setProgressData] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024; // 1024px is 'lg' in Tailwind
  });

  // Use the simplified TTS hook
  const { isPlaying, speak, stop, isSupported } = useTTS();

  const formattedTitle = courseName.replace(/([A-Z])/g, " $1").trim();
  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  // Simple TTS Functions
  const handleTTSClick = () => {
    if (!currentLesson) return;

    const slide = currentLesson.slides[currentSlide];
    const textToRead = slide.tts_text || slide.content.join(' ');

    if (!textToRead) {
      console.warn("No text to read for this slide");
      return;
    }

    console.log("Reading text:", textToRead);

    // Use the simple speak function - it toggles play/stop automatically
    speak(textToRead);
  };

  // Stop TTS when slide changes
  useEffect(() => {
    if (isPlaying) {
      stop();
    }
  }, [currentSlide]);

  // Handle window resize to update sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // 'lg' breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      // Get recommended lessons from the flat lessons array
      const lessonMap = new Map(
        lessonsData.lessons.map(l => [l.lesson_id, l])
      );

      // Get recommended lessons and sort them by lesson_id
      const recommendedLessonsData = recommendedLessons
        .map(id => lessonMap.get(id))
        .filter(Boolean)
        .sort((a, b) => a.lesson_id - b.lesson_id);

      return recommendedLessonsData;
    } else if (activeSectionIndex === 1) {
      // All lessons section
      return lessonsData.lessons || [];
    } else {
      // Quizzes section (empty for now)
      return [];
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

  const markLessonComplete = async () => {
    // Get the correct course ID from lessonsData
    const courseId = lessonsData?.course_id || 1;

    try {
      // Step 1: Mark lesson as complete
      const response = await fetch("http://localhost:8000/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.user_id,
          course_id: courseId,
          lesson_id: currentLesson.lesson_id,
          completed: true,
        }),
      });

      const result = await response.json();

      // Step 2: Check if milestone was awarded
      if (result.milestone_awarded) {
        const milestoneId = result.milestone_awarded.id;

        // Check if notification was already shown
        const milestoneCheckResponse = await fetch(
          `http://localhost:8000/milestones/${user.user_id}`
        );
        const milestones = await milestoneCheckResponse.json();
        const milestone = milestones.find(m => m.id === milestoneId);

        // Only show notification if it hasn't been shown before
        if (milestone && !milestone.notification_shown) {
          showMilestone(result.milestone_awarded);

          // Mark notification as shown in database
          await fetch(
            `http://localhost:8000/milestones/mark-shown/${user.user_id}/${milestoneId}`,
            { method: 'POST' }
          );
        }
      }

      // Step 3: Refresh progress data
      const progressResponse = await fetch(
        `http://localhost:8000/progress-recommendations/${user.user_id}/${courseId}`
      );
      const progressData = await progressResponse.json();

      setProgressData(progressData);
      setRecommendedLessons(progressData.recommended_lessons || []);

      // Step 4: Proceed to next lesson after a brief delay for notification
      setTimeout(() => {
        proceedToNextLesson();
      }, 500);

    } catch (err) {
      console.error("Failed to update progress:", err);
    }
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
    const totalSections = 3; // Recommended, All Lessons, Quizzes
    setActiveSectionIndex((prev) => (prev + 1) % totalSections);
  };

  const handlePrevSection = () => {
    if (!lessonsData) return;
    const totalSections = 3; // Recommended, All Lessons, Quizzes
    setActiveSectionIndex((prev) => (prev - 1 + totalSections) % totalSections);
  };

  const isLessonCompleted = (lessonId) => {
    return progressData?.completed_lessons?.includes(lessonId);
  };

  // Render content 
  const renderSlideContent = (slide) => {
    // Left side - Media content (fixed height)
    const mediaElement = slide.media_url ? (
      slide.media_url.endsWith(".mp4") ? (
        <motion.video
          controls
          className="w-full h-full rounded-lg shadow-sm"
          style={{ objectFit: 'contain' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <source src={slide.media_url} type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      ) : (
        <motion.img
          src={slide.media_url}
          alt={slide.slide_title || `Slide ${currentSlide + 1}`}
          className="w-full h-full rounded-lg shadow-sm"
          style={{ objectFit: 'contain' }}
          onError={(e) => { e.target.src = placeholderimg; }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      )
    ) : (
      <motion.div
        className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex justify-center items-center shadow-sm border-2 border-dashed border-gray-300"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <span className="text-lg">Walang media available</span>
        </div>
      </motion.div>
    );

    // Right side - Text content (fixed height with scroll)
    const contentElement = (
      <motion.div
        className="h-full flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Slide title if available - Fixed height */}
        {slide.slide_title && (
          <motion.div
            className="flex-shrink-0 mb-4 pb-2 border-b border-gray-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-[#4C5173]">
              {slide.slide_title}
            </h3>
          </motion.div>
        )}

        {/* Scrollable Content Area*/}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0">
          {slide.content && slide.content.length > 0 ? (
            <motion.div
              className="space-y-4 pr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {slide.content.map((text, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
                >
                  <motion.div
                    className="w-3 h-3 bg-[#4C5173] rounded-full mt-2 flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.5 + (idx * 0.1) }}
                  />
                  <p className="text-lg text-gray-800 leading-relaxed flex-1">
                    {text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="h-full flex items-center justify-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <span className="text-lg">Walang content available</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );

    // Standard Left-Right Layout - Fixed Height
    return (
      <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Left Side - Media (Fixed Height) */}
        <div className="lg:w-1/2 h-64 lg:h-full bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
          <div className="w-full h-full p-2">
            {mediaElement}
          </div>
        </div>

        {/* Right Side  */}
        <div className="lg:w-1/2 flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
          <div className="w-full h-full p-4">
            {contentElement}
          </div>
        </div>
      </div>
    );
  };

  if (!lessonsData || !currentLesson) {
    return (
      <div className="bg-[#DFDFEE] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C5173] mb-4"></div>
          <p className="text-lg font-semibold text-[#4C5173]">Naglo-load ng lesson...</p>
        </div>
      </div>
    );
  }

  const slide = currentLesson.slides[currentSlide];

  if (!slide) {
    return (
      <div className="bg-[#DFDFEE] min-h-screen flex items-center justify-center">
        <div className="text-center text-lg font-bold text-red-600">
          Walang slide data available.
        </div>
      </div>
    );
  }

  const sectionLessons = getAllLessonsInSection();

  const getSectionTitle = () => {
    if (activeSectionIndex === 0) return "TEKI'S RECOMMENDED LESSONS";
    if (activeSectionIndex === 1) return "ALL LESSONS";
    if (activeSectionIndex === 2) return "QUIZZES";
    return "LESSONS";
  };

  return (
    <div className="bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] min-h-screen text-black flex flex-col">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="lg:hidden mb-4">
        <motion.button
          onClick={() => setIsSidebarOpen(true)}
          className="w-full bg-[#4C5173] hover:bg-[#5a5f8a] rounded-lg px-4 py-3 flex items-center justify-center gap-3 shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Menu className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-[15px]">Open Lesson Menu</span>
        </motion.button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className="w-full lg:w-[320px] bg-[#BFC4D7] border-r border-gray-200 shadow-lg flex flex-col fixed lg:sticky top-0 z-[60] h-screen"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Close Button - Only visible on mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-10"
              >
                <X className="w-5 h-5 text-[#1A202C]" />
              </button>

              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 md:gap-4">
                  <img
                    src={lessonsData?.image_url || placeholderimg}
                    alt={formattedTitle}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#4C5173] shadow-sm"
                  />
                  <h2 className="text-lg md:text-xl font-bold text-[#4C5173]">{formattedTitle}</h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {/* Section Navigation with Animation */}
                <div className="flex justify-between items-center mb-4 md:mb-6 bg-gray-50 rounded-lg p-2 md:p-3">
                  <button
                    onClick={handlePrevSection}
                    className="p-1.5 md:p-2 rounded-lg bg-[#4C5173] text-white hover:bg-[#3a3f5c] transition-colors shadow-sm"
                  >
                    <ChevronLeft size={18} className="md:w-5 md:h-5" />
                  </button>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeSectionIndex}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="font-semibold text-center text-xs md:text-sm mx-2 md:mx-3 text-[#4C5173]"
                    >
                      {getSectionTitle()}
                    </motion.p>
                  </AnimatePresence>
                  <button
                    onClick={handleNextSection}
                    className="p-1.5 md:p-2 rounded-lg bg-[#4C5173] text-white hover:bg-[#3a3f5c] transition-colors shadow-sm"
                  >
                    <ChevronRight size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>

                {/* Lessons in Section with Staggered Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`section-${activeSectionIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    {sectionLessons.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="text-xs md:text-sm italic text-gray-500 text-center py-8"
                      >
                        Walang lessons available.
                      </motion.p>
                    ) : (
                      sectionLessons.map((lesson, index) => (
                        <motion.div
                          key={lesson.lesson_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: "easeOut"
                          }}
                          onClick={() => {
                            handleLessonClick(lesson);
                            // Close sidebar on mobile after selection
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`p-3 md:p-4 rounded-lg cursor-pointer text-xs md:text-sm transition-all transform hover:scale-105 ${currentLesson.lesson_id === lesson.lesson_id
                            ? "bg-gradient-to-r from-[#F4EDD9] to-[#FFF8E1] font-semibold border-2 border-[#4C5173] shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-800">{lesson.lesson_title}</span>
                            {isLessonCompleted(lesson.lesson_id) && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 500 }}
                                className="text-green-600 text-xs"
                              >
                                ✓
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Back Button */}
              <div className="p-3 md:p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    navigate(`/courses/${courseName}`);
                    // Close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className="w-full py-2.5 md:py-3 bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white rounded-lg font-semibold hover:from-[#3a3f5c] hover:to-[#5a5f7a] transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  Bumalik sa Lesson List
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSidebarOpen && window.innerWidth < 1024 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Enhanced Lesson Content */}
        <div className="flex-1 p-4 lg:p-8 flex flex-col">
          {/* Header with TTS Controls */}
          <div className="text-center mb-4 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-[#4C5173]">
              {currentLesson.lesson_title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-black">
                Slide {currentSlide + 1} of {currentLesson.slides.length}
              </h2>

              {/* Simplified TTS Controls */}
              {isSupported && (
                <div className="flex items-center gap-2">
                  {!isPlaying ? (
                    <motion.button
                      onClick={handleTTSClick}
                      className="relative flex items-center gap-2 px-4 py-2 bg-[#B6C44D] text-black rounded-lg hover:bg-[#a5b83d] transition-colors shadow-sm overflow-hidden"
                      title="Basahin ang slide content"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Volume2 size={16} />
                      <span className="hidden sm:inline">Basahin</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleTTSClick}
                      className="relative flex items-center gap-2 px-4 py-2 bg-[#4C5173] text-white rounded-lg hover:bg-[#3a3f5c] transition-colors shadow-sm overflow-hidden"
                      title="Stop ang audio"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0px rgba(76, 81, 115, 0.4)",
                          "0 0 0 10px rgba(76, 81, 115, 0.1)",
                          "0 0 0 20px rgba(76, 81, 115, 0)"
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 border-2 border-white rounded-lg"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <VolumeX size={16} />
                      <span className="hidden sm:inline">Stop</span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#B6C44D] to-[#4C5173] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentSlide + 1) / currentLesson.slides.length) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* White Container */}
          <div className="bg-gray-100 rounded-xl shadow-lg p-4 mb-6 flex-1 flex flex-col overflow-hidden">
            {/* Dynamic Content Layout*/}
            <div className="flex-1 overflow-hidden">
              {renderSlideContent(slide)}
            </div>

            {/* Enhanced Slide Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              {/* Left side - Previous button */}
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all transform ${currentSlide === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] hover:scale-105 shadow-lg"
                  }`}
              >
                ← Previous
              </button>

              {/* Right side - Next/Complete buttons */}
              <div className="flex gap-4">
                {currentSlide === currentLesson.slides.length - 1 ? (
                  isLessonCompleted(currentLesson.lesson_id) ? (
                    <button
                      onClick={proceedToNextLesson}
                      className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 text-white bg-gradient-to-r from-[#0077FF] to-[#17559D] hover:from-[#0066CC] hover:to-[#144A82] shadow-lg transition-all"
                    >
                      Done Reviewing ✓
                    </button>
                  ) : (
                    <button
                      onClick={markLessonComplete}
                      className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 bg-gradient-to-r from-[#B6C44D] to-[#A5B83D] text-black hover:from-[#a5b83d] hover:to-[#94A535] shadow-lg transition-all"
                    >
                      Mark Complete ✓
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleNextSlide}
                    className="px-6 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white hover:from-[#3a3f5c] hover:to-[#5a5f7a] shadow-lg transition-all"
                  >
                    Next →
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