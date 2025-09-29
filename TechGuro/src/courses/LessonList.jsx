//LessonList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import CourseNavbar from './courseNavbar';
import { useUser } from '../context/UserContext';
import TekiDialog from '../components/TekiDialog';
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";
import { MousePointer, Keyboard, Image, X, Play } from 'lucide-react';

const LessonList = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user } = useUser();
  const [lessonsData, setLessonsData] = useState(null);
  const [courseId, setCourseId] = useState(null); // Add courseId state
  const [completedLessons, setCompletedLessons] = useState([]);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [completedActivities, setCompletedActivities] = useState(false);
  const [activeSection, setActiveSection] = useState('recommended');
  const [postAssessmentUnlocked, setPostAssessmentUnlocked] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  // Quiz-related states
  const [quizModes, setQuizModes] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [availableLessonsForQuiz, setAvailableLessonsForQuiz] = useState([]);
  const [loadingQuizData, setLoadingQuizData] = useState(false);

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  // Helper function to check if all recommended lessons are completed
  const areAllRecommendedCompleted = () => {
    if (recommendedLessons.length === 0) return false;
    return recommendedLessons.every(lessonId => completedLessons.includes(lessonId));
  };

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/courses`);
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
      setCourseId(foundCourseId); // Store courseId

      const lessonsRes = await fetch(`http://localhost:8000/lesson-courses/${foundCourseId}`);
      if (!lessonsRes.ok) throw new Error("Failed to fetch lessons data.");
      const lessonsData = await lessonsRes.json();
      setLessonsData(lessonsData);

      try {
        const bktRes = await fetch(
          `http://localhost:8000/bkt/recommendations/${user.user_id}/${foundCourseId}?threshold=0.7&limit=10`
        );

        if (!bktRes.ok) throw new Error("Failed to fetch BKT recommendations.");
        const bktData = await bktRes.json();

        console.log("BKT recommendations data:", bktData);

        const recommended = bktData.recommended_lessons || bktData.recommend || [];
        setRecommendedLessons(recommended);

        const progressRes = await fetch(
          `http://localhost:8000/progress-recommendations/${user.user_id}/${foundCourseId}`
        );

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const completed = progressData.completed_lessons || [];
          setCompletedLessons(completed);
          setCompletedActivities(progressData.completed_activities || false);

          const recommendedCompleted = recommended.filter(lessonId => completed.includes(lessonId));
          const shouldUnlockPostAssessment = recommended.length > 0 && recommendedCompleted.length === recommended.length;
          setPostAssessmentUnlocked(shouldUnlockPostAssessment);

        } else {
          console.warn("Progress endpoint failed, assuming no completed lessons");
          setCompletedLessons([]);
          setCompletedActivities(false);
          setPostAssessmentUnlocked(false);
        }

      } catch (bktError) {
        console.error("BKT recommendations failed:", bktError);

        try {
          const progressRes = await fetch(
            `http://localhost:8000/progress-recommendations/${user.user_id}/${foundCourseId}`
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const completed = progressData.completed_lessons || [];
            setCompletedLessons(completed);
            const fallbackRecommended = progressData.recommended_lessons || progressData.recommend || [];
            setRecommendedLessons(fallbackRecommended);
            setCompletedActivities(progressData.completed_activities || false);

            const recommendedCompleted = fallbackRecommended.filter(lessonId => completed.includes(lessonId));
            const shouldUnlockPostAssessment = fallbackRecommended.length > 0 && recommendedCompleted.length === fallbackRecommended.length;
            setPostAssessmentUnlocked(shouldUnlockPostAssessment);
          }
        } catch (fallbackError) {
          console.error("All recommendation endpoints failed:", fallbackError);
          setCompletedLessons([]);
          setRecommendedLessons([]);
          setCompletedActivities(false);
          setPostAssessmentUnlocked(false);
        }
      }

    } catch (err) {
      console.error("Error fetching course data:", err);
    }
  };

  // Fetch quiz modes when courseId is available and quiz section is active
  const fetchQuizModes = async () => {
    if (!courseId) return;

    setLoadingQuizData(true);
    try {
      const response = await fetch(`http://localhost:8000/quiz-modes/${courseId}`);
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

  // Fetch lessons for selected quiz type
  const fetchQuizLessons = async (quizType) => {
    if (!courseId) return;

    setLoadingQuizData(true);
    try {
      const response = await fetch(`http://localhost:8000/quiz-lessons/${courseId}/${quizType}`);
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

  // Handle quiz mode selection
  const handleQuizModeSelect = async (quizType) => {
    setSelectedQuizType(null);
    setAvailableLessonsForQuiz([]);
    setSelectedQuizType(quizType);
    setShowLessonModal(true);
    await fetchQuizLessons(quizType);
  };

  // Handle lesson selection in modal
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

  // Get quiz mode icon and color
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

  useEffect(() => {
    if (user) {
      fetchCourseData();
    }
  }, [user, courseName]);

  // Fetch quiz modes when switching to quiz section
  useEffect(() => {
    if (activeSection === 'quizzes' && courseId) {
      fetchQuizModes();
    }
  }, [activeSection, courseId]);

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

  if (!lessonsData) {
    return <div className="p-10 text-[20px] font-bold text-center">Loading lessons...</div>;
  }

  return (
    <div className="min-h-screen bg-[#DFDFEE] text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex w-full">
        {/* Sidebar - No changes to existing sidebar code */}
        <motion.div
          className="w-[320px] bg-gradient-to-br from-[#BFC4D7] to-[#A8B0C8] p-6 sticky top-0 h-screen overflow-y-auto border-r-2 border-[#6B708D] shadow-lg z-20"
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
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
              onClick={() => setActiveSection('recommended')}
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
              onClick={() => setActiveSection('allLessons')}
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

            {/* Updated Quiz Section */}
            <motion.div
              onClick={() => setActiveSection('quizzes')}
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

          {/* Rest of sidebar code remains the same */}
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

        {/* Main Content */}
        <div className="flex-1 p-8 relative z-0">
          {activeSection === 'recommended' ? (
            /* Existing recommended section code - no changes */
            <>
              <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">
                Teki's Recommended Lessons
              </h1>
              <p className="text-[16px] mb-6">
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
                    <p className="text-[18px] italic text-gray-700 mb-2">No recommendations yet.</p>
                    <p className="text-[14px] text-gray-600">Complete your pre-assessment to get personalized lesson recommendations.</p>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-[14px] font-semibold text-blue-800">
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
                              className={`bg-[#F9F8FE] border-2 rounded-lg p-6 flex justify-between items-center transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-[#6B708D]'}`}
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
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-[12px] font-bold">
                                    RECOMMENDED #{index + 1}
                                  </span>
                                </div>
                                <h2 className="text-[20px] font-bold mb-2 text-[#4C5173]">
                                  {lesson.lesson_title}
                                </h2>
                                <p className="text-[14px] text-gray-600 mb-2">
                                  {lesson.slides?.[0]?.content?.[0] ?? "Learn essential concepts in this lesson."}
                                </p>
                                {isCompleted && (
                                  <p className="text-green-700 font-bold mt-2 text-[14px] flex items-center gap-1">
                                    ✓ Completed - Great job!
                                  </p>
                                )}
                              </div>
                              <motion.button
                                onClick={() => handleStartLesson(lesson.lesson_id)}
                                className={`px-6 py-3 rounded font-semibold text-[16px] transition-all ${isCompleted
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
            /* Existing all lessons section code - no changes */
            <>
              <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">
                All Course Lessons
              </h1>
              <p className="text-[16px] mb-6">
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
                        className={`bg-[#F9F8FE] border-2 rounded-lg p-6 flex justify-between items-center transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-[#6B708D]'
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-500 text-white px-2 py-1 rounded text-[12px] font-bold">
                              LESSON {index + 1}
                            </span>
                            {isRecommended && (
                              <span className="bg-yellow-400 text-black px-2 py-1 rounded text-[12px] font-bold">
                                ★ RECOMMENDED
                              </span>
                            )}
                          </div>
                          <h2 className="text-[20px] font-bold mb-2 text-[#4C5173]">
                            {lesson.lesson_title}
                          </h2>
                          <p className="text-[14px] text-gray-600 mb-2">
                            {lesson.slides?.[0]?.content?.[0] ?? "Learn essential concepts in this lesson."}
                          </p>
                          {isCompleted && (
                            <p className="text-green-700 font-bold mt-2 text-[14px] flex items-center gap-1">
                              ✓ Completed - Great job!
                            </p>
                          )}
                        </div>
                        <motion.button
                          onClick={() => handleStartLesson(lesson.lesson_id)}
                          className={`px-6 py-3 rounded font-semibold text-[16px] transition-all ${isCompleted
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
            /* NEW QUIZ SECTION */
            <>
              <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">Quizzes</h1>
              <p className="text-[16px] mb-6">
                Test your knowledge with practice quizzes and exercises.
              </p>

              {loadingQuizData ? (
                <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C5173] mb-4"></div>
                  <p className="text-[16px] text-gray-600">Loading quiz modes...</p>
                </div>
              ) : quizModes.length === 0 ? (
                <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
                  <p className="text-[18px] italic text-gray-700 mb-2">No quizzes available yet.</p>
                  <p className="text-[14px] text-gray-600">Quiz exercises will be available soon for this course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                          <h3 className={`text-[18px] font-bold mb-2 ${details.textColor}`}>
                            {mode.display_name}
                          </h3>

                          <p className="text-[14px] text-gray-600 mb-4">
                            {mode.quiz_type === 'multiple_choice' && 'Choose the correct answer from image options (10 random questions)'}
                            {mode.quiz_type === 'drag_drop' && 'Drag items to their correct positions (5 random questions)'}
                            {mode.quiz_type === 'typing' && 'Type the correct answers within time limit (5 random questions)'}
                          </p>

                          <div className="flex justify-center items-center gap-2 mb-4">
                            <span className="text-[12px] text-gray-500">Available Lessons:</span>
                            <span className="bg-white px-2 py-1 rounded-full text-[12px] font-bold text-gray-700">
                              {mode.available_lessons}
                            </span>
                          </div>

                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuizModeSelect(mode.quiz_type);
                            }}
                            className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${details.color} hover:opacity-90 transition-all`}
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
            className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}  // ← Add this
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}  // ← Add this to prevent closing when clicking inside modal
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[#4C5173]">Select a Lesson</h2>
                  <p className="text-[16px] text-gray-600">
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
                  <p className="text-[16px] text-gray-600">Loading available lessons...</p>
                </div>
              ) : availableLessonsForQuiz.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[18px] text-gray-700 mb-2">No lessons available</p>
                  <p className="text-[14px] text-gray-600">This quiz type is not available for any lessons yet.</p>
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
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-[18px] font-bold text-[#4C5173] mb-2">
                            {lessonInfo.lesson_title}
                          </h3>
                          <div className="flex items-center gap-4 text-[14px] text-gray-600">
                            <span>📝 {selectedQuizType === "multiple_choice" ? 10 : selectedQuizType === "drag_drop" ? 5 : selectedQuizType === "typing" ? 5 : lessonInfo.total_questions} questions</span>
                            {lessonInfo.time_limit && (
                              <span>⏱️ {lessonInfo.time_limit}s time limit</span>
                            )}
                            {lessonInfo.difficulty && (
                              <span className={`px-2 py-1 rounded-full text-[12px] font-bold ${lessonInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                lessonInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {lessonInfo.difficulty.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <motion.button
                          className="px-4 py-2 bg-[#B6C44D] text-black font-semibold rounded-lg hover:bg-[#a5b83d] transition-colors"
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
    </div>
  );
};

export default LessonList;