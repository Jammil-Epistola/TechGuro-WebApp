//LessonList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import CourseNavbar from './courseNavbar';
import { useUser } from '../context/UserContext';
import { useMilestone } from '../context/MilestoneContext';
import TekiDialog from '../components/TekiDialog';
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";
import LessonsCompletionModal from '../components/LessonsCompletionModal';
import { MousePointer, Keyboard, Image, X, Play, Menu, Trophy } from 'lucide-react';
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

  // Sidebar state - Initialize based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  // Quiz-related states
  const [quizModes, setQuizModes] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [availableLessonsForQuiz, setAvailableLessonsForQuiz] = useState([]);
  const [loadingQuizData, setLoadingQuizData] = useState(false);
  const [allQuizLessonsByType, setAllQuizLessonsByType] = useState({});

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  // Handle window resize to update sidebar state
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

  // Helper function to check if all recommended lessons are completed
  const areAllRecommendedCompleted = () => {
    if (recommendedLessons.length === 0) return false;
    return recommendedLessons.every(lessonId => completedLessons.includes(lessonId));
  };
  const getRecommendedQuizzes = () => {
    if (recommendedLessons.length === 0 || !availableLessonsForQuiz) return [];

    return availableLessonsForQuiz.filter(quiz =>
      recommendedLessons.includes(quiz.lesson_id)
    );
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

        console.log("BKT recommendations data:", bktData);

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
          console.warn("Progress endpoint failed, assuming no completed lessons");
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
        console.error("Failed to fetch quiz modes");
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
        console.error("Failed to fetch quiz lessons");
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

        // After quiz modes are fetched, fetch lessons for each type
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

  const getQuizModeDetails = (quizType) => {
    switch (quizType) {
      case 'multiple_choice':
        return {
          icon: Image,
          color: 'from-blue-400 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'drag_drop':
        return {
          icon: MousePointer,
          color: 'from-green-400 to-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'typing':
        return {
          icon: Keyboard,
          color: 'from-purple-400 to-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800'
        };
      default:
        return {
          icon: Play,
          color: 'from-gray-400 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const navigateToSection = (sectionName) => {
    setActiveSection(sectionName);
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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

          // Only show if notification hasn't been shown before
          if (milestone2 && milestone2.status === "earned" && !milestone2.notification_shown) {
            setTimeout(() => {
              showMilestone(milestone2);
              // Mark as shown in the database
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
    // Check if all recommended lessons are completed and modal hasn't been shown
    if (areAllRecommendedCompleted() && !hasShownCompletionModal && recommendedLessons.length > 0) {
      // Check localStorage to see if modal was already shown for this course
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

  const handlePostAssessment = () => {
    if (!areAllRecommendedCompleted()) {
      const remaining = recommendedLessons.length - recommendedLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
      setUnlockReason(`Complete ${remaining} more recommended lesson${remaining > 1 ? 's' : ''} to unlock Post-Assessment!`);
      return;
    }
    navigate(`/courses/${courseName}/Post-assessment`);
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  const handleSeeQuizzes = () => {
    setShowCompletionModal(false);
    navigateToSection('quizzes');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!lessonsData) {
    return <div className="p-10 text-[20px] font-bold text-center">Loading lessons...</div>;
  }

  return (
    <div className="min-h-screen bg-[#DFDFEE] text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex w-full relative">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className="w-[320px] bg-gradient-to-br from-[#BFC4D7] to-[#A8B0C8] p-6 h-screen overflow-y-auto border-r-2 border-[#6B708D] shadow-lg z-[60] fixed md:sticky top-0"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-10"
              >
                <X className="w-5 h-5 text-[#1A202C]" />
              </button>

              {/* Header Section */}
              <motion.div
                className="flex items-center gap-4 mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="relative">
                  <img
                    src={lessonsData.image_url || placeholderimg}
                    alt={formattedTitle}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#1A202C] mb-1">{formattedTitle}</h2>
                  <p className="text-[14px] text-[#2D3748] font-semibold">Learning Dashboard</p>
                </div>
              </motion.div>

              {/* Navigation Sections */}
              <div className="space-y-3 mb-8">
                <motion.div
                  onClick={() => navigateToSection('recommended')}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${activeSection === 'recommended'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                    }`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${activeSection === 'recommended' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex-1">
                      <div className="font-bold text-[17px] mb-1 text-[#1A202C]">TEKI'S RECOMMENDED</div>
                      <div className="text-[14px] text-[#2D3748] font-medium">AI-based lesson suggestions</div>
                    </div>
                    {recommendedLessons.length > 0 && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                        {recommendedLessons.length}
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  onClick={() => navigateToSection('allLessons')}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${activeSection === 'allLessons'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                    }`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activeSection === 'allLessons' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex-1">
                      <div className="font-bold text-[17px] mb-1 text-[#1A202C]">ALL LESSONS</div>
                      <div className="text-[14px] text-[#2D3748] font-medium">Complete course overview</div>
                    </div>
                    {lessonsData?.lessons && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                        {lessonsData.lessons.length}
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  onClick={() => navigateToSection('quizzes')}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${activeSection === 'quizzes'
                    ? 'bg-[#F4EDD9] border-[#B6C44D] shadow-md transform scale-[1.02]'
                    : 'bg-white/10 border-transparent hover:bg-white/20 hover:scale-[1.01]'
                    }`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activeSection === 'quizzes' ? 'bg-[#B6C44D]' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex-1">
                      <div className="font-bold text-[17px] mb-1 text-[#1A202C]">QUIZZES</div>
                      <div className="text-[14px] text-[#2D3748] font-medium">Practice and assessment</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] font-bold text-[#1A202C]">Recommended Progress</span>
                  <span className="text-[14px] text-[#2D3748] font-semibold">
                    {recommendedLessons.filter(lessonId => completedLessons.includes(lessonId)).length}/{recommendedLessons.length || 0}
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-[#B6C44D] to-[#9BB83D] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: recommendedLessons.length > 0
                        ? `${(recommendedLessons.filter(lessonId => completedLessons.includes(lessonId)).length / recommendedLessons.length) * 100}%`
                        : '0%'
                    }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
                <div className="text-[13px] text-[#2D3748] font-medium mt-2">
                  Complete recommended lessons to unlock Post-Assessment
                </div>
              </motion.div>

              <motion.button
                onClick={() => {
                  if (areAllRecommendedCompleted()) {
                    handlePostAssessment();
                  } else {
                    const remaining = recommendedLessons.length - recommendedLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
                    setUnlockReason(`Complete ${remaining} more recommended lesson${remaining > 1 ? 's' : ''} to unlock Post-Assessment!`);
                  }
                }}
                className={`w-full px-4 py-4 rounded-xl font-bold text-[18px] transition-all ${areAllRecommendedCompleted()
                  ? "bg-gradient-to-r from-[#B6C44D] to-[#9BB83D] text-black hover:from-[#a5b83d] hover:to-[#8aa936] shadow-lg transform hover:scale-[1.02]"
                  : "bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed"
                  }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                whileHover={areAllRecommendedCompleted() ? { scale: 1.02 } : {}}
                whileTap={areAllRecommendedCompleted() ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Post-Assessment</span>
                  {areAllRecommendedCompleted() ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay backdrop*/}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 relative z-0">
          {/* Open Sidebar Button */}
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

          {activeSection === 'recommended' ? (
            <>
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">
                Teki's Recommended Lessons
              </h1>
              <p className="text-[14px] md:text-[16px] mb-6">
                Based on your Pre-Assessment, here are the lessons Teki recommends to improve your knowledge of the course.
              </p>

              <div className="flex flex-col gap-5">
                {recommendedLessons.length === 0 ? (
                  <motion.div
                    className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-[16px] md:text-[18px] italic text-gray-700 mb-2">No recommendations yet.</p>
                    <p className="text-[13px] md:text-[14px] text-gray-600">Complete your pre-assessment to get personalized lesson recommendations.</p>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-[13px] md:text-[14px] font-semibold text-blue-800">
                        💡 {recommendedLessons.length} lesson{recommendedLessons.length > 1 ? 's' : ''} recommended based on your assessment results
                      </p>
                    </motion.div>

                    <AnimatePresence>
                      {lessonsData.lessons
                        ?.filter(lesson => recommendedLessons.includes(lesson.lesson_id))
                        .map((lesson, index) => {
                          const isCompleted = completedLessons.includes(lesson.lesson_id);
                          return (
                            <motion.div
                              key={lesson.lesson_id}
                              className={`bg-[#F9F8FE] border-2 rounded-lg p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-[#6B708D]'}`}
                              initial={{ opacity: 0, x: -100 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: index * 0.1,
                                ease: "easeOut"
                              }}
                              whileHover={{
                                scale: 1.02,
                                x: 10,
                                shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                transition: { duration: 0.2 }
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
                                    RECOMMENDED #{index + 1}
                                  </span>
                                </div>
                                <h2 className="text-[18px] md:text-[20px] font-bold mb-2 text-[#4C5173]">
                                  {lesson.lesson_title}
                                </h2>
                                <p className="text-[13px] md:text-[14px] text-gray-600 mb-2">
                                  {lesson.slides?.[0]?.content?.[0] ?? "Learn essential concepts in this lesson."}
                                </p>
                                {isCompleted && (
                                  <p className="text-green-700 font-bold mt-2 text-[13px] md:text-[14px] flex items-center gap-1">
                                    ✓ Completed - Great job!
                                  </p>
                                )}
                              </div>
                              <motion.button
                                onClick={() => handleStartLesson(lesson.lesson_id)}
                                className={`w-full md:w-auto px-6 py-3 rounded font-semibold text-[15px] md:text-[16px] transition-all ${isCompleted
                                  ? "bg-gray-500 text-white hover:bg-gray-600"
                                  : "bg-[#B6C44D] text-black hover:bg-[#a5b83d] shadow-lg hover:shadow-xl"
                                  }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isCompleted ? "Review" : "Start Learning"}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </>
          ) : activeSection === 'allLessons' ? (
            <>
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">
                All Course Lessons
              </h1>
              <p className="text-[14px] md:text-[16px] mb-6">
                Complete overview of all lessons available in {formattedTitle}.
              </p>

              <div className="space-y-5">
                <AnimatePresence>
                  {lessonsData.lessons?.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.lesson_id);
                    const isRecommended = recommendedLessons.includes(lesson.lesson_id);

                    return (
                      <motion.div
                        key={lesson.lesson_id}
                        className={`bg-[#F9F8FE] border-2 rounded-lg p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-[#6B708D]'
                          }`}
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.08,
                          ease: "easeOut"
                        }}
                        whileHover={{
                          scale: 1.02,
                          x: 10,
                          shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-gray-500 text-white px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
                              LESSON {index + 1}
                            </span>
                            {isRecommended && (
                              <span className="bg-yellow-400 text-black px-2 py-1 rounded text-[11px] md:text-[12px] font-bold">
                                ★ RECOMMENDED
                              </span>
                            )}
                          </div>
                          <h2 className="text-[18px] md:text-[20px] font-bold mb-2 text-[#4C5173]">
                            {lesson.lesson_title}
                          </h2>
                          <p className="text-[13px] md:text-[14px] text-gray-600 mb-2">
                            {lesson.slides?.[0]?.content?.[0] ?? "Learn essential concepts in this lesson."}
                          </p>
                          {isCompleted && (
                            <p className="text-green-700 font-bold mt-2 text-[13px] md:text-[14px] flex items-center gap-1">
                              ✓ Completed - Great job!
                            </p>
                          )}
                        </div>
                        <motion.button
                          onClick={() => handleStartLesson(lesson.lesson_id)}
                          className={`w-full md:w-auto px-6 py-3 rounded font-semibold text-[15px] md:text-[16px] transition-all ${isCompleted
                            ? "bg-gray-500 text-white hover:bg-gray-600"
                            : "bg-[#B6C44D] text-black hover:bg-[#a5b83d] shadow-lg hover:shadow-xl"
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isCompleted ? "Review" : "Start Learning"}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          ) : activeSection === 'quizzes' ? (
            <>
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">Quizzes</h1>
              <p className="text-[14px] md:text-[16px] mb-6">
                Test your knowledge with practice quizzes and exercises.
              </p>

              {loadingQuizData ? (
                <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C5173] mb-4"></div>
                  <p className="text-[14px] md:text-[16px] text-gray-600">Loading quiz modes...</p>
                </div>
              ) : quizModes.length === 0 ? (
                <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
                  <p className="text-[16px] md:text-[18px] italic text-gray-700 mb-2">No quizzes available yet.</p>
                  <p className="text-[13px] md:text-[14px] text-gray-600">Quiz exercises will be available soon for this course.</p>
                </div>
              ) : (
                <>
                  {/* Quiz Type Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {quizModes.map((mode, index) => {
                      const details = getQuizModeDetails(mode.quiz_type);
                      const IconComponent = details.icon;

                      return (
                        <motion.div
                          key={mode.quiz_type}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`${details.bgColor} ${details.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105`}
                          onClick={() => handleQuizModeSelect(mode.quiz_type)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-lg`}>
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>

                            <h3 className={`text-[16px] md:text-[18px] font-bold mb-2 ${details.textColor}`}>
                              {mode.display_name}
                            </h3>

                            <p className="text-[13px] md:text-[14px] text-gray-600 mb-4">
                              {mode.quiz_type === 'multiple_choice' && 'Choose the correct answer from image options (10 random questions)'}
                              {mode.quiz_type === 'drag_drop' && 'Drag items to their correct positions (5 random questions)'}
                              {mode.quiz_type === 'typing' && 'Type the correct answers within time limit (5 random questions)'}
                            </p>

                            <div className="flex justify-center items-center gap-2 mb-4">
                              <span className="text-[11px] md:text-[12px] text-gray-500">Available Lessons:</span>
                              <span className="bg-white px-2 py-1 rounded-full text-[11px] md:text-[12px] font-bold text-gray-700">
                                {mode.available_lessons}
                              </span>
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuizModeSelect(mode.quiz_type);
                              }}
                              className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${details.color} hover:opacity-90 transition-all text-[14px] md:text-[15px]`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Select Quiz Mode
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Recommended Quizzes Section */}
                  {recommendedLessons.length > 0 && quizModes.length > 0 && Object.keys(allQuizLessonsByType).length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full">
                          <Trophy className="w-5 h-5" />
                          <h2 className="text-[18px] md:text-[20px] font-bold">Teki's Recommended Quizzes</h2>
                        </div>
                      </div>

                      <p className="text-[13px] md:text-[14px] text-gray-600 mb-6">
                        Based on your recommended lessons, we suggest practicing these quizzes. Click on a quiz type above to see available quizzes for your recommended lessons.
                      </p>

                      {/* Show quizzes grouped by type */}
                      {quizModes.map((mode) => {
                        const details = getQuizModeDetails(mode.quiz_type);
                        const IconComponent = details.icon;

                        // Get lessons for this quiz type that are in recommended lessons
                        const lessonsForThisType = allQuizLessonsByType[mode.quiz_type] || [];
                        const recommendedForThisType = lessonsForThisType.filter(quiz =>
                          recommendedLessons.includes(quiz.lesson_id)
                        );

                        // Don't show this quiz type if no recommended lessons
                        if (recommendedForThisType.length === 0) return null;

                        return (
                          <div key={mode.quiz_type} className="mb-8">
                            {/* Quiz Type Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-md`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <h3 className={`text-[17px] md:text-[19px] font-bold ${details.textColor}`}>
                                {mode.display_name}
                              </h3>
                              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[11px] font-bold">
                                FOR RECOMMENDED
                              </span>
                            </div>

                            {/* Quiz Cards for this type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {recommendedForThisType.map((lessonInfo, index) => (
                                <motion.div
                                  key={`recommended-${mode.quiz_type}-${lessonInfo.lesson_id}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className={`${details.bgColor} border-2 ${details.borderColor} rounded-lg p-4 hover:shadow-md cursor-pointer transition-all`}
                                  onClick={() => {
                                    setSelectedQuizType(mode.quiz_type);
                                    handleLessonSelect(lessonInfo);
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-md`}>
                                        <span className="text-white font-bold text-lg">★</span>
                                      </div>
                                    </div>

                                    <div className="flex-1">
                                      <h4 className="text-[15px] md:text-[17px] font-bold text-gray-800 mb-2">
                                        {lessonInfo.lesson_title}
                                      </h4>

                                      <div className="flex items-center gap-3 text-[12px] md:text-[13px] text-gray-600 flex-wrap mb-2">
                                        <span>📝 {mode.quiz_type === "multiple_choice" ? 10 : mode.quiz_type === "drag_drop" ? 5 : mode.quiz_type === "typing" ? 5 : lessonInfo.total_questions} questions</span>
                                        {lessonInfo.difficulty && (
                                          <span className={`px-2 py-1 rounded-full text-[10px] md:text-[11px] font-bold ${lessonInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                            lessonInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                            {lessonInfo.difficulty.toUpperCase()}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-[12px] text-gray-600">
                                        Practice your recommended lessons
                                      </p>
                                    </div>

                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Navigate directly to quiz page
                                        navigate(
                                          `/courses/${courseName}/quizzes/${courseId}/${lessonInfo.lesson_id}/${mode.quiz_type}`,
                                          {
                                            state: {
                                              quizData: lessonInfo,
                                              courseName: courseName,
                                              formattedTitle: formattedTitle,
                                            },
                                          }
                                        );
                                      }}
                                      className={`px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${details.color} hover:opacity-90 transition-colors text-[13px] md:text-[14px]`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Start
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : null}

          {unlockReason && (
            <TekiDialog
              message={unlockReason}
              onClose={() => setUnlockReason("")}
            />
          )}
        </div>
      </div>

      {/* Lesson Selection Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white rounded-xl p-4 md:p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[20px] md:text-[24px] font-bold text-[#4C5173]">Select a Lesson</h2>
                  <p className="text-[14px] md:text-[16px] text-gray-600">
                    Choose which lesson you want to practice with {selectedQuizType?.replace('_', ' ')} quiz
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {loadingQuizData ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C5173] mb-4"></div>
                  <p className="text-[14px] md:text-[16px] text-gray-600">Loading available lessons...</p>
                </div>
              ) : availableLessonsForQuiz.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[16px] md:text-[18px] text-gray-700 mb-2">No lessons available</p>
                  <p className="text-[13px] md:text-[14px] text-gray-600">This quiz type is not available for any lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableLessonsForQuiz.map((lessonInfo, index) => (
                    <motion.div
                      key={lessonInfo.lesson_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => {
                        if (!showLessonModal) return;
                        handleLessonSelect(lessonInfo);
                      }}
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-[16px] md:text-[18px] font-bold text-[#4C5173] mb-2">
                            {lessonInfo.lesson_title}
                          </h3>
                          <div className="flex items-center gap-4 text-[13px] md:text-[14px] text-gray-600 flex-wrap">
                            <span>📝 {selectedQuizType === "multiple_choice" ? 10 : selectedQuizType === "drag_drop" ? 5 : selectedQuizType === "typing" ? 5 : lessonInfo.total_questions} questions</span>
                            {lessonInfo.time_limit && (
                              <span>⏱️ {lessonInfo.time_limit}s time limit</span>
                            )}
                            {lessonInfo.difficulty && (
                              <span className={`px-2 py-1 rounded-full text-[11px] md:text-[12px] font-bold ${lessonInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                lessonInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {lessonInfo.difficulty.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <motion.button
                          className="w-full md:w-auto px-4 py-2 bg-[#B6C44D] text-black font-semibold rounded-lg hover:bg-[#a5b83d] transition-colors text-[14px] md:text-[15px]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Start Quiz
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {unlockReason && (
        <TekiDialog
          message={unlockReason}
          onClose={() => setUnlockReason("")}
        />
      )}

      {/* Add Completion Modal */}
      <LessonsCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseCompletionModal}
        onSeeQuizzes={handleSeeQuizzes}
      />
    </div>
  );
};

export default LessonList;