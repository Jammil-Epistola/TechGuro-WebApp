//LessonList.jsx 
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
import CourseNavbar from './courseNavbar';
import { useUser } from '../context/UserContext';
import { useMilestone } from '../context/MilestoneContext';
import TekiDialog from '../components/TekiDialog';
import LessonsCompletionModal from '../components/LessonList/LessonsCompletionModal';
import LessonListSidebar from '../components/LessonList/LessonListSidebar.jsx';
import RecommendedLessons from '../components/LessonList/RecommendedLessons';
import AllLessons from '../components/LessonList/AllLessons';
import QuizSection from '../components/LessonList/QuizSection';
import LessonSelectionModal from '../components/LessonList/LessonSelectionModal';
import API_URL from '../config/api';

const LessonList = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user } = useUser();
  const { showMilestone } = useMilestone();
  
  const [lessonsData, setLessonsData] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [activeSection, setActiveSection] = useState('recommended');
  const [postAssessmentUnlocked, setPostAssessmentUnlocked] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  const [quizModes, setQuizModes] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [availableLessonsForQuiz, setAvailableLessonsForQuiz] = useState([]);
  const [loadingQuizData, setLoadingQuizData] = useState(false);
  const [allQuizLessonsByType, setAllQuizLessonsByType] = useState({});

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();
  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const areAllRecommendedCompleted = () => {
    if (recommendedLessons.length === 0) return false;
    return recommendedLessons.every(lessonId => completedLessons.includes(lessonId));
  };

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`${API_URL}/courses`);
      if (!res.ok) throw new Error("Failed to fetch courses list.");
      const courses = await res.json();

      const matchedCourse = courses.find(
        c => normalize(c.title) === normalize(courseName)
      );
      if (!matchedCourse) {
        console.error(`No course found for ${courseName}`);
        return;
      }

      const foundCourseId = matchedCourse.id;
      setCourseId(foundCourseId);

      const lessonsRes = await fetch(`${API_URL}/lesson-courses/${foundCourseId}`);
      if (!lessonsRes.ok) throw new Error("Failed to fetch lessons data.");
      const lessonsData = await lessonsRes.json();
      setLessonsData(lessonsData);

      try {
        const bktRes = await fetch(
          `${API_URL}/bkt/recommendations/${user.user_id}/${foundCourseId}?threshold=0.7&limit=10`
        );

        if (!bktRes.ok) throw new Error("Failed to fetch BKT recommendations.");
        const bktData = await bktRes.json();

        const recommended = bktData.recommended_lessons || bktData.recommend || [];
        setRecommendedLessons(recommended);

        const progressRes = await fetch(
          `${API_URL}/progress-recommendations/${user.user_id}/${foundCourseId}`
        );

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const completed = progressData.completed_lessons || [];
          setCompletedLessons(completed);

          const recommendedCompleted = recommended.filter(lessonId => completed.includes(lessonId));
          const shouldUnlockPostAssessment = recommended.length > 0 && recommendedCompleted.length === recommended.length;
          setPostAssessmentUnlocked(shouldUnlockPostAssessment);
        } else {
          setCompletedLessons([]);
          setPostAssessmentUnlocked(false);
        }

      } catch (bktError) {
        console.error("BKT recommendations failed:", bktError);
        
        try {
          const progressRes = await fetch(
            `${API_URL}/progress-recommendations/${user.user_id}/${foundCourseId}`
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const completed = progressData.completed_lessons || [];
            setCompletedLessons(completed);
            const fallbackRecommended = progressData.recommended_lessons || progressData.recommend || [];
            setRecommendedLessons(fallbackRecommended);

            const recommendedCompleted = fallbackRecommended.filter(lessonId => completed.includes(lessonId));
            const shouldUnlockPostAssessment = fallbackRecommended.length > 0 && recommendedCompleted.length === fallbackRecommended.length;
            setPostAssessmentUnlocked(shouldUnlockPostAssessment);
          }
        } catch (fallbackError) {
          console.error("All recommendation endpoints failed:", fallbackError);
          setCompletedLessons([]);
          setRecommendedLessons([]);
          setPostAssessmentUnlocked(false);
        }
      }

    } catch (err) {
      console.error("Error fetching course data:", err);
    }
  };

  const fetchQuizModes = async () => {
    if (!courseId) return;

    setLoadingQuizData(true);
    try {
      const response = await fetch(`${API_URL}/quiz-modes/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizModes(data.quiz_modes || []);
      } else {
        setQuizModes([]);
      }
    } catch (error) {
      console.error("Error fetching quiz modes:", error);
      setQuizModes([]);
    } finally {
      setLoadingQuizData(false);
    }
  };

  const fetchQuizLessons = async (quizType) => {
    if (!courseId) return;

    setLoadingQuizData(true);
    try {
      const response = await fetch(`${API_URL}/quiz-lessons/${courseId}/${quizType}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableLessonsForQuiz(data.available_lessons || []);
      } else {
        setAvailableLessonsForQuiz([]);
      }
    } catch (error) {
      console.error("Error fetching quiz lessons:", error);
      setAvailableLessonsForQuiz([]);
    } finally {
      setLoadingQuizData(false);
    }
  };

  useEffect(() => {
    const fetchQuizModesAndLessons = async () => {
      if (activeSection === 'quizzes' && courseId) {
        await fetchQuizModes();

        if (quizModes.length > 0) {
          const lessonsByType = {};

          for (const mode of quizModes) {
            try {
              const response = await fetch(`${API_URL}/quiz-lessons/${courseId}/${mode.quiz_type}`);
              if (response.ok) {
                const data = await response.json();
                lessonsByType[mode.quiz_type] = data.available_lessons || [];
              }
            } catch (error) {
              console.error(`Error fetching lessons for ${mode.quiz_type}:`, error);
              lessonsByType[mode.quiz_type] = [];
            }
          }

          setAllQuizLessonsByType(lessonsByType);
        }
      }
    };

    fetchQuizModesAndLessons();
  }, [activeSection, courseId, quizModes.length]);

  const handleQuizModeSelect = async (quizType) => {
    setSelectedQuizType(null);
    setAvailableLessonsForQuiz([]);
    setSelectedQuizType(quizType);
    setShowLessonModal(true);
    await fetchQuizLessons(quizType);
  };

  const handleLessonSelect = (lessonInfo) => {
    setShowLessonModal(false);

    navigate(
      `/courses/${courseName}/quizzes/${courseId}/${lessonInfo.lesson_id}/${selectedQuizType}`,
      {
        state: {
          quizData: lessonInfo,
          courseName: courseName,
          formattedTitle: formattedTitle,
        },
      }
    );
    setSelectedQuizType(null);
    setAvailableLessonsForQuiz([]);
  };

  const handleCloseModal = () => {
    setShowLessonModal(false);
    setSelectedQuizType(null);
    setAvailableLessonsForQuiz([]);
  };

  const navigateToSection = (sectionName) => {
    setActiveSection(sectionName);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handlePostAssessment = () => {
    if (!areAllRecommendedCompleted()) {
      const remaining = recommendedLessons.length - recommendedLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
      setUnlockReason(`Complete ${remaining} more recommended lesson${remaining > 1 ? 's' : ''} to unlock Post-Assessment!`);
      return;
    }
    navigate(`/courses/${courseName}/Post-assessment`);
  };

  useEffect(() => {
    if (user) {
      fetchCourseData();
    }
  }, [user, courseName]);

  useEffect(() => {
    if (activeSection === 'quizzes' && courseId) {
      fetchQuizModes();
    }
  }, [activeSection, courseId]);

  useEffect(() => {
    const checkMilestone2 = async () => {
      if (!user || !courseId) return;

      try {
        const response = await fetch(`${API_URL}/milestones/check/${user.user_id}/2`);
        const data = await response.json();

        if (data.earned) {
          const milestonesResponse = await fetch(`${API_URL}/milestones/${user.user_id}`);
          const milestones = await milestonesResponse.json();
          const milestone2 = milestones.find(m => m.id === 2);

          if (milestone2 && milestone2.status === "earned" && !milestone2.notification_shown) {
            setTimeout(() => {
              showMilestone(milestone2);
              fetch(`${API_URL}/milestones/mark-shown/${user.user_id}/2`, {
                method: 'POST'
              }).catch(err => console.error("Error marking milestone as shown:", err));
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error checking Milestone #2:", error);
      }
    };

    checkMilestone2();
  }, [user, courseId, showMilestone]);

  useEffect(() => {
    if (areAllRecommendedCompleted() && !hasShownCompletionModal && recommendedLessons.length > 0) {
      const modalShownKey = `completion_modal_shown_${user?.user_id}_${courseId}`;
      const wasShown = localStorage.getItem(modalShownKey);

      if (!wasShown) {
        setShowCompletionModal(true);
        setHasShownCompletionModal(true);
        localStorage.setItem(modalShownKey, 'true');
      }
    }
  }, [completedLessons, recommendedLessons, courseId, user]);

  const handleStartLesson = (lessonId) => {
    navigate(`/courses/${courseName}/lesson`, {
      state: { lessonId }
    });
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  const handleSeeQuizzes = () => {
    setShowCompletionModal(false);
    navigateToSection('quizzes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!lessonsData) {
    return <div className="p-10 text-[20px] font-bold text-center">Loading lessons...</div>;
  }

  return (
    <div className="min-h-screen bg-[#DFDFEE] text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex w-full relative">
        <LessonListSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          lessonsData={lessonsData}
          formattedTitle={formattedTitle}
          activeSection={activeSection}
          navigateToSection={navigateToSection}
          recommendedLessons={recommendedLessons}
          completedLessons={completedLessons}
          areAllRecommendedCompleted={areAllRecommendedCompleted}
          handlePostAssessment={handlePostAssessment}
        />

        <div className="flex-1 p-4 md:p-8 relative z-0">
          {!isSidebarOpen && (
            <motion.button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mb-4 w-full bg-[#4C5173] hover:bg-[#5a5f8a] rounded-lg px-4 py-3 flex items-center justify-center gap-3 shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-[15px]">Open Sidebar</span>
            </motion.button>
          )}

          {activeSection === 'recommended' && (
            <RecommendedLessons
              lessonsData={lessonsData}
              recommendedLessons={recommendedLessons}
              completedLessons={completedLessons}
              onStartLesson={handleStartLesson}
            />
          )}

          {activeSection === 'allLessons' && (
            <AllLessons
              lessonsData={lessonsData}
              formattedTitle={formattedTitle}
              completedLessons={completedLessons}
              recommendedLessons={recommendedLessons}
              onStartLesson={handleStartLesson}
            />
          )}

          {activeSection === 'quizzes' && (
            <QuizSection
              quizModes={quizModes}
              loadingQuizData={loadingQuizData}
              onQuizModeSelect={handleQuizModeSelect}
              recommendedLessons={recommendedLessons}
              allQuizLessonsByType={allQuizLessonsByType}
              courseName={courseName}
              formattedTitle={formattedTitle}
              courseId={courseId}
            />
          )}
        </div>
      </div>

      <LessonSelectionModal
        isOpen={showLessonModal}
        onClose={handleCloseModal}
        selectedQuizType={selectedQuizType}
        availableLessons={availableLessonsForQuiz}
        loadingQuizData={loadingQuizData}
        onLessonSelect={handleLessonSelect}
      />

      {unlockReason && (
        <TekiDialog
          message={unlockReason}
          onClose={() => setUnlockReason("")}
        />
      )}

      <LessonsCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseCompletionModal}
        onSeeQuizzes={handleSeeQuizzes}
      />
    </div>
  );
};

export default LessonList;