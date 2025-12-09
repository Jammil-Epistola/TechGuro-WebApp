//LessonPage.jsx (Refactored)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CourseNavbar from "./courseNavbar";
import { useUser } from "../context/UserContext";
import { useMilestone } from '../context/MilestoneContext';
import { normalizeSlides } from "../utility/normalizeContent";
import useTTS from "../hooks/useTTS";
import API_URL from '../config/api';
import LessonSidebar from '../components/LessonPage/LessonSidebar';
import SlideContent from '../components/LessonPage/SlideContent';
import ProgressHeader from '../components/LessonPage/ProgressHeader';
import SlideNavigation from '../components/LessonPage/SlideNavigation';
import MobileMenuButton from '../components/LessonPage/MobileMenuButton';
import LoadingSpinner from '../components/LessonPage/LoadingSpinner';

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
  const [courseSources, setCourseSources] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024; 
  });

  const { isPlaying, speak, stop, isSupported } = useTTS();

  const formattedTitle = courseName.replace(/([A-Z])/g, " $1").trim();
  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  const handleTTSClick = () => {
    if (!currentLesson) return;

    const slide = currentLesson.slides[currentSlide];
    const textToRead = slide.tts_text || slide.content.join(' ');

    if (!textToRead) {
      console.warn("No text to read for this slide");
      return;
    }

    console.log("Reading text:", textToRead);
    speak(textToRead);
  };

  useEffect(() => {
    if (isPlaying) {
      stop();
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { 
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

    const fetchCourseData = async () => {
      try {
        const coursesRes = await fetch(`${API_URL}/courses`);
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

        const lessonsRes = await fetch(`${API_URL}/lesson-courses/${courseId}`);
        if (!lessonsRes.ok) throw new Error("Failed to fetch lessons data.");
        const lessonsData = await lessonsRes.json();
        setLessonsData(lessonsData);

        if (lessonsData.sources) {
          setCourseSources(lessonsData.sources);
        }

        try {
          const bktRes = await fetch(
            `${API_URL}/bkt/recommendations/${user.user_id}/${courseId}?threshold=0.7&limit=10`
          );

          if (!bktRes.ok) throw new Error("Failed to fetch BKT recommendations.");
          const bktData = await bktRes.json();

          console.log("BKT recommendations data:", bktData);
          setRecommendedLessons(bktData.recommended_lessons || []);

          const progressRes = await fetch(`${API_URL}/progress-recommendations/${user.user_id}/${courseId}`);
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgressData(progressData);
          }

        } catch (bktError) {
          console.error("BKT recommendations failed:", bktError);

          try {
            const progressRes = await fetch(`${API_URL}/progress-recommendations/${user.user_id}/${courseId}`);
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

    fetch(`${API_URL}/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
        setCurrentLesson(normalized);
        
        if (data.sources && !courseSources) {
          setCourseSources(data.sources);
        }
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
        lessonsData.lessons.map(l => [l.lesson_id, l])
      );

      const recommendedLessonsData = recommendedLessons
        .map(id => lessonMap.get(id))
        .filter(Boolean)
        .sort((a, b) => a.lesson_id - b.lesson_id);

      return recommendedLessonsData;
    } else if (activeSectionIndex === 1) {
      return lessonsData.lessons || [];
    } else {
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
      fetch(`${API_URL}/lessons/${nextLesson.lesson_id}`)
        .then(res => res.json())
        .then(data => {
          const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
          setCurrentLesson(normalized);
          setCurrentSlide(0);
        })
        .catch(err => console.error("Failed to load next lesson detail:", err));
    } else {
      navigate(`/courses/${courseName}`);
    }
  };

  const markLessonComplete = async () => {
    const courseId = lessonsData?.course_id || 1;

    try {
      const response = await fetch(`${API_URL}/progress/update`, {
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

      if (result.milestone_awarded) {
        const milestoneId = result.milestone_awarded.id;

        const milestoneCheckResponse = await fetch(
          `${API_URL}/milestones/${user.user_id}`
        );
        const milestones = await milestoneCheckResponse.json();
        const milestone = milestones.find(m => m.id === milestoneId);

        if (milestone && !milestone.notification_shown) {
          showMilestone(result.milestone_awarded);

          await fetch(
            `${API_URL}/milestones/mark-shown/${user.user_id}/${milestoneId}`,
            { method: 'POST' }
          );
        }
      }

      const progressResponse = await fetch(
        `${API_URL}/progress-recommendations/${user.user_id}/${courseId}`
      );
      const progressData = await progressResponse.json();

      setProgressData(progressData);
      setRecommendedLessons(progressData.recommended_lessons || []);

      setTimeout(() => {
        proceedToNextLesson();
      }, 500);

    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleLessonClick = (lesson) => {
    fetch(`${API_URL}/lessons/${lesson.lesson_id}`)
      .then(res => res.json())
      .then(data => {
        const normalized = { ...data, slides: normalizeSlides(data.slides || []) };
        setCurrentLesson(normalized);
        setCurrentSlide(0);
      })
      .catch(err => console.error("Failed to load lesson detail:", err));
  };

  const isLessonCompleted = (lessonId) => {
    return progressData?.completed_lessons?.includes(lessonId);
  };

  if (!lessonsData || !currentLesson) {
    return <LoadingSpinner message="Naglo-load ng lesson..." />;
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

  return (
    <div className="bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] min-h-screen text-black flex flex-col">
      <CourseNavbar courseTitle={formattedTitle} />

      <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden lg:overflow-visible">
        <LessonSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          lessonsData={lessonsData}
          formattedTitle={formattedTitle}
          activeSectionIndex={activeSectionIndex}
          setActiveSectionIndex={setActiveSectionIndex}
          sectionLessons={sectionLessons}
          currentLesson={currentLesson}
          isLessonCompleted={isLessonCompleted}
          handleLessonClick={handleLessonClick}
          courseName={courseName}
          navigate={navigate}
          courseSources={courseSources}
        />

        <div className="flex-1 p-4 lg:p-8 flex flex-col overflow-y-auto lg:overflow-visible min-h-0">
          <ProgressHeader
            lessonTitle={currentLesson.lesson_title}
            currentSlide={currentSlide}
            totalSlides={currentLesson.slides.length}
            isSupported={isSupported}
            isPlaying={isPlaying}
            handleTTSClick={handleTTSClick}
          />

          <div className="bg-gray-100 rounded-xl shadow-lg p-4 mb-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <SlideContent 
                slide={slide} 
                currentSlide={currentSlide} 
              />
            </div>

            <SlideNavigation
              currentSlide={currentSlide}
              totalSlides={currentLesson.slides.length}
              handlePrevSlide={handlePrevSlide}
              handleNextSlide={handleNextSlide}
              isLastSlide={currentSlide === currentLesson.slides.length - 1}
              isLessonCompleted={isLessonCompleted(currentLesson.lesson_id)}
              markLessonComplete={markLessonComplete}
              proceedToNextLesson={proceedToNextLesson}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;