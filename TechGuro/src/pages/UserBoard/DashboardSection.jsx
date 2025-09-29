//DashboardSection
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { TrendingUp, TrendingDown, Award, BookOpen, Target, Calendar } from "lucide-react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";
import CB_img from "../../assets/Home/computer_basics_imghead.png";
import DCM_img from "../../assets/Home/digi_comms_imghead.png";
import IS_img from "../../assets/Home/internet_safety_imghead.png";
import ProfileSection from "./ProfileSection";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardSection = ({ goToProfile, navigateToSection }) => {
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState("Computer Basics");
  const [selectedAssessment, setSelectedAssessment] = useState("Pre-Assessment");
  const [courseProgress, setCourseProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Store all assessments for user
  const [assessments, setAssessments] = useState([]);
  const [progressRecommendationsData, setProgressRecommendationsData] = useState({});
  // Modal state and detailed questions/answers
  const [showModal, setShowModal] = useState(false);
  const [modalQuestions, setModalQuestions] = useState([]);
  const [modalResponses, setModalResponses] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  //Milestones
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [milestonesError, setMilestonesError] = useState(null);
  const [allMilestonesData, setAllMilestonesData] = useState([]);

  // Quiz scores state
  const [quizScores, setQuizScores] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const navigate = useNavigate();
  const profileRef = React.useRef(null);

  useEffect(() => {
    if (goToProfile && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [goToProfile]);

  const courses = [
    "Computer Basics",
    "Internet Safety",
    "Digital Communication and Messaging"
  ];

  const courseLessonCounts = {
    "Computer Basics": 5,
    "Internet Safety": 5,
    "Digital Communication and Messaging": 5
  };

  // Centralized data fetching function
  const fetchAllDashboardData = async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const baseURL = import.meta.env.VITE_API_URL;

      const [
        progressResponse,
        assessmentsResponse,
        milestonesResponse,
        quizResponse,
        allMilestonesResponse,
        progressRecommendationsResponse
      ] = await Promise.all([
        fetch(`${baseURL}/progress/${user.user_id}`),
        fetch(`${baseURL}/assessment/${user.user_id}`),
        fetch(`${baseURL}/milestones/earned/${user.user_id}`),
        fetch(`${baseURL}/quiz/results/${user.user_id}`),
        fetch(`${baseURL}/milestones/${user.user_id}`),
        fetch(`${baseURL}/progress-recommendations/${user.user_id}/${courses.indexOf(selectedCourse) + 1}`) // NEW: Recommended lessons
      ]);

      // Check if all responses are successful
      const responses = [
        { name: 'progress', response: progressResponse },
        { name: 'assessments', response: assessmentsResponse },
        { name: 'milestones', response: milestonesResponse },
        { name: 'quiz', response: quizResponse },
        { name: 'allMilestones', response: allMilestonesResponse },
        { name: 'progressRecommendations', response: progressRecommendationsResponse }
      ];

      const failedRequests = responses.filter(r => !r.response.ok);
      if (failedRequests.length > 0) {
        const failedNames = failedRequests.map(r => r.name).join(', ');
        throw new Error(`Failed to fetch: ${failedNames}`);
      }

      // Parse all responses in parallel
      const [
        progressData,
        assessmentsData,
        milestonesData,
        quizData,
        allMilestonesData,
        progressRecommendationsData
      ] = await Promise.all([
        progressResponse.json(),
        assessmentsResponse.json(),
        milestonesResponse.json(),
        quizResponse.json(),
        allMilestonesResponse.json(),
        progressRecommendationsResponse.json()
      ]);

      // Process all data
      processProgressData(progressData);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
      processMilestonesData(milestonesData);
      processQuizData(quizData);

      // NEW: Process enhanced data for task completion
      setAllMilestonesData(allMilestonesData); // Store total milestones
      setProgressRecommendationsData(progressRecommendationsData); // Store recommended lessons data

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setFetchError(error.message);

      // Set default values on error
      setCourseProgress({});
      setOverallProgress(0);
      setAssessments([]);
      setMilestones([]);
      setQuizScores([]);
      setAllMilestonesData([]);
      setProgressRecommendationsData({});
      setMilestonesError(error.message);
      setQuizError(error.message);
    } finally {
      setIsLoading(false);
      setMilestonesLoading(false);
      setQuizLoading(false);
    }
  };
  // Helper function to process progress data
  const processProgressData = (data) => {
    const completedPerCourse = {};
    data.forEach(entry => {
      if (entry.completed) {
        const courseName = getCourseName(entry.course_id);
        if (completedPerCourse[courseName]) {
          completedPerCourse[courseName] += 1;
        } else {
          completedPerCourse[courseName] = 1;
        }
      }
    });

    const progressPercents = {};
    let totalCompleted = 0;
    let totalLessons = 0;

    Object.keys(courseLessonCounts).forEach(course => {
      const completed = completedPerCourse[course] || 0;
      const total = courseLessonCounts[course];
      const percent = Math.round((completed / total) * 100);
      progressPercents[course] = percent;
      totalCompleted += completed;
      totalLessons += total;
    });

    const overall = Math.round((totalCompleted / totalLessons) * 100);
    setCourseProgress(progressPercents);
    setOverallProgress(overall);
  };

  // Helper function to process milestones data
  const processMilestonesData = (data) => {
    const sorted = [...data].sort((a, b) =>
      new Date(b.date_earned) - new Date(a.date_earned)
    );
    setMilestones(sorted);
  };

  // Helper function to process quiz data
  const processQuizData = (data) => {
    if (Array.isArray(data.results)) {
      // Sort by completion date, most recent first
      const sorted = [...data.results].sort((a, b) =>
        new Date(b.completed_at) - new Date(a.completed_at)
      );
      setQuizScores(sorted);
    } else {
      setQuizScores([]);
    }
  };

  // Get quiz type display name
  const getQuizTypeDisplay = (quizType) => {
    const typeMap = {
      'multiple_choice': 'Image Quiz',
      'drag_drop': 'Drag & Drop',
      'typing': 'Typing Quiz'
    };
    return typeMap[quizType] || quizType;
  };

  // Get improvement indicator
  const getQuizImprovement = () => {
    if (quizScores.length < 2) return null;

    const latest = quizScores[0];
    const previous = quizScores.find(q =>
      q.quiz_type === latest.quiz_type &&
      q.lesson_id === latest.lesson_id &&
      q.completed_at !== latest.completed_at
    );

    if (!previous) return null;

    const improvement = latest.percentage - previous.percentage;
    return {
      value: improvement,
      isImprovement: improvement > 0,
      isDecline: improvement < 0
    };
  };

  // Fetch all data when user changes
  useEffect(() => {
    fetchAllDashboardData();
  }, [user]);

  const getCourseName = (courseId) => {
    const index = courseId - 1;
    return courses[index] || "Unknown Course";
  };

  // Extract pre and post assessment scores for the selected course
  const preAssessment = assessments.find(
    a => a.course_id === courses.indexOf(selectedCourse) + 1 && a.assessment_type === "pre"
  );
  const postAssessment = assessments.find(
    a => a.course_id === courses.indexOf(selectedCourse) + 1 && a.assessment_type === "post"
  );

  // Calculate bar chart data
  const preScore = preAssessment ? preAssessment.score : 0;
  const postScore = postAssessment ? postAssessment.score : 0;
  const totalQuestions = 20;
  const maxQuestions = postAssessment?.total || preAssessment?.total || totalQuestions;

  const barData = {
    labels: ["Pre", "Post"],
    datasets: [{
      label: "Score",
      data: [preScore, postScore],
      backgroundColor: "#4C5173"
    }]
  };

  const barOptions = {
    scales: {
      y: { beginAtZero: true, max: maxQuestions }
    },
    plugins: { legend: { display: false } }
  };

  const donutData = {
    labels: ["Learning", "Remaining"],
    datasets: [{
      data: [overallProgress, 100 - overallProgress],
      backgroundColor: ["#4C5173", "#ccc"]
    }]
  };

  const hasTakenAssessment = Boolean(
    (selectedAssessment === "Pre-Assessment" ? preAssessment : postAssessment)
  );

  const calculateAverageScores = () => {
    const courseAverages = {};
    const courseColors = [
      "#4C5173", "#6B708D", "#8E8FAD", "#A5A6C4", "#B8B9D1", "#CBCCDE"
    ];

    courses.forEach((courseName, index) => {
      const courseId = index + 1;
      const courseAssessments = assessments.filter(a => a.course_id === courseId);

      if (courseAssessments.length > 0) {
        const totalScore = courseAssessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const totalPossible = courseAssessments.reduce((sum, assessment) => sum + (assessment.total || 20), 0);
        const averagePercentage = Math.round((totalScore / totalPossible) * 100);

        courseAverages[courseName] = {
          percentage: averagePercentage,
          color: courseColors[index % courseColors.length]
        };
      }
    });

    return courseAverages;
  };

  const averageScores = calculateAverageScores();
  const hasAverageData = Object.keys(averageScores).length > 0;

  const averageDonutData = hasAverageData ? {
    labels: Object.keys(averageScores),
    datasets: [{
      data: Object.values(averageScores).map(course => course.percentage),
      backgroundColor: Object.values(averageScores).map(course => course.color),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  } : {
    labels: ['No Data'],
    datasets: [{
      data: [100],
      backgroundColor: ['#E5E5E5']
    }]
  };

  const averageDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  // Modal functions
  const openResultsModal = async () => {
    setShowModal(true);
    setLoadingModal(true);
    setModalError(null);
    setModalQuestions([]);
    setModalResponses([]);

    try {
      const courseId = courses.indexOf(selectedCourse) + 1;
      const rawType = (selectedAssessment || "").toLowerCase();
      const assessmentType = rawType.startsWith("pre") ? "pre" : rawType.startsWith("post") ? "post" : rawType;

      const assessRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/${user.user_id}`);
      if (!assessRes.ok) throw new Error(`Failed to fetch assessments (${assessRes.status})`);
      const assessAll = await assessRes.json();

      const matches = (assessAll || []).filter(a => a.course_id === courseId && (a.assessment_type === assessmentType || a.assessment_type === assessmentType[0]));
      if (!matches.length) {
        setModalError(`No ${selectedAssessment} found for ${selectedCourse}.`);
        return;
      }
      const latest = matches.sort((a, b) => {
        const ta = new Date(a.date_taken || a.date || 0).getTime();
        const tb = new Date(b.date_taken || b.date || 0).getTime();
        if (ta === tb) return (b.id || 0) - (a.id || 0);
        return tb - ta;
      })[0];

      const questionsRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/questions/${courseId}?assessment_type=${assessmentType}`);
      if (!questionsRes.ok) throw new Error("Failed to fetch questions for this assessment");
      const questions = await questionsRes.json();

      const responsesRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/responses/${latest.id}`);
      if (!responsesRes.ok) {
        setModalQuestions(Array.isArray(questions) ? questions : []);
        setModalResponses([]);
        setModalError("Responses not available yet for the latest assessment.");
        return;
      }
      const responses = await responsesRes.json();

      setModalQuestions(Array.isArray(questions) ? questions : []);
      setModalResponses(Array.isArray(responses) ? responses : []);
    } catch (err) {
      console.error("openResultsModal error:", err);
      setModalError(err.message || "Failed to load assessment results");
      setModalQuestions([]);
      setModalResponses([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeResultsModal = () => {
    setShowModal(false);
    setModalQuestions([]);
    setModalResponses([]);
    setModalError(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4C5173] mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-[20px] font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading Dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px] flex items-center justify-center">
        <motion.div
          className="text-center bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-[20px] font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{fetchError}</p>
          <motion.button
            onClick={fetchAllDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const latestQuiz = quizScores.length > 0 ? quizScores[0] : null;
  const quizImprovement = getQuizImprovement();

  return (
    <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px]">
      {/* Profile Section */}
      <div ref={profileRef}>
        <ProfileSection />
      </div>

      <motion.h1
        className="text-[30px] font-bold text-[#4C5173] mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        USER DASHBOARD
      </motion.h1>

      {/* Recent Achievements + Assessment Scores + Quiz Scores */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Recent Milestone */}
        <motion.div
          className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 cursor-pointer hover:bg-[#f0f0ff] flex flex-col"
          onClick={() => navigateToSection("achievements")}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-[#4C5173]" />
            <h2 className="text-[25px] font-bold text-left">Recent Milestones:</h2>
          </div>

          <div className="flex flex-col items-center justify-center flex-1">
            {milestonesLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full"
              />
            ) : milestonesError ? (
              <p className="text-red-600">Error loading milestones</p>
            ) : milestones.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-[18px] font-semibold">Walang milestone na nakamit pa</p>
                <p className="text-sm text-gray-600 mt-1">No milestones achieved yet</p>
              </motion.div>
            ) : (
              <motion.div
                className="text-center w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {/* Latest Milestone */}
                <motion.img
                  src={milestones[0]?.icon_url || placeholderimg}
                  alt={milestones[0]?.title || "Milestone"}
                  className="w-20 h-20 rounded-full border border-black mb-2 mx-auto"
                  onError={(e) => {
                    e.target.src = placeholderimg;
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <p className="text-[18px] font-semibold">{milestones[0].title}</p>

                {/* NEW: Task Completion Rate for Milestones */}
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#4C5173] font-semibold">Milestone Completion:</span>
                    <span className="text-[#4C5173] font-bold">
                      {milestones.length}/{allMilestonesData.length}
                      ({Math.round((milestones.length / Math.max(allMilestonesData.length, 1)) * 100)}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-[#4C5173] h-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(milestones.length / Math.max(allMilestonesData.length, 1)) * 100}%`
                      }}
                      transition={{ duration: 1.5, delay: 0.6 }}
                    />
                  </div>

                  {/* Tagalog + English Description */}
                  <p className="text-xs text-gray-600 mt-2">
                    {milestones.length}/{allMilestonesData.length} mga milestone na-unlock •
                    {allMilestonesData.length - milestones.length} pa ang natitira
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        {/* Assessment Scores */}
        <motion.div
          className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[240px]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-[#4C5173]" />
            <h2 className="text-[25px] font-bold">Assessment Scores:</h2>
          </div>

          {/* Course DropDown */}
          <motion.select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3"
            whileFocus={{ scale: 1.02 }}
          >
            {courses.map((course) => <option key={course}>{course}</option>)}
          </motion.select>

          {/*Assessment DropDown */}
          <motion.select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3"
            whileFocus={{ scale: 1.02 }}
          >
            <option>Pre-Assessment</option>
            <option>Post-Assessment</option>
          </motion.select>

          {/* Assessment Tasks Completed */}
          <div className="mb-3 text-center">
            <span className="text-[#4C5173] font-bold text-[18px]">
              Assessment Tasks Completed: {(preAssessment ? 1 : 0) + (postAssessment ? 1 : 0)}/2
              ({Math.round(((preAssessment ? 1 : 0) + (postAssessment ? 1 : 0)) / 2 * 100)}%)
            </span>
          </div>

          {/* Assessment Task Status: Shows only selected assessment */}
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-[#4C5173] mb-1">Assessment Task Status:</div>
            <div className="flex items-center gap-1">
              {selectedAssessment === "Pre-Assessment" ? (
                <>
                  <span className={preAssessment ? "text-green-600" : "text-gray-500"}>
                    {preAssessment ? "✅" : "❌"}
                  </span>
                  <span>Pre-Assessment: {preAssessment ? "Tapos na" : "Hindi pa"}</span>
                </>
              ) : (
                <>
                  <span className={postAssessment ? "text-green-600" : "text-gray-500"}>
                    {postAssessment ? "✅" : "❌"}
                  </span>
                  <span>Post-Assessment: {postAssessment ? "Tapos na" : "Hindi pa"}</span>
                </>
              )}
            </div>
          </div>

          {/* Show score if assessment is taken */}
          {hasTakenAssessment && (
            <motion.p
              className="text-[18px] text-center mt-3 mb-2"
              key={`${selectedCourse}-${selectedAssessment}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {assessments.length === 0 ? "Loading scores..." : (
                selectedAssessment === "Pre-Assessment" && preAssessment
                  ? `Pre-Assessment: ${Math.round(preAssessment.score)}/${preAssessment.total || totalQuestions}`
                  : selectedAssessment === "Post-Assessment" && postAssessment
                    ? `Post-Assessment: ${Math.round(postAssessment.score)}/${postAssessment.total || totalQuestions}`
                    : ""
              )}
            </motion.p>
          )}

          <motion.button
            disabled={!hasTakenAssessment}
            onClick={openResultsModal}
            className={`w-full py-2 rounded-md border-2 border-black text-white font-bold text-[18px] 
      ${hasTakenAssessment ? "bg-[#479DFF]" : "bg-[#8E8E8E]"}`}
            whileHover={hasTakenAssessment ? { scale: 1.02, backgroundColor: "#3A8FEF" } : {}}
            whileTap={hasTakenAssessment ? { scale: 0.98 } : {}}
          >
            See Results
          </motion.button>
        </motion.div>
        {/* Quiz Scores */}
        <motion.div
          className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[240px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-[#4C5173]" />
            <h2 className="text-[25px] font-bold">Recent Quiz:</h2>
          </div>

          <div className="flex flex-col justify-center flex-1">
            {quizLoading ? (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full"
                />
              </motion.div>
            ) : quizError ? (
              <p className="text-red-600 text-center">Error loading quiz data</p>
            ) : !latestQuiz ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-[30px] font-semibold">Walang quiz na na-try pa</p>
                <p className="text-[25px] text-gray-600 mt-2">No quizzes taken yet</p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {/* Quiz Score Display */}
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${latestQuiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {latestQuiz.score}/{latestQuiz.total_questions}
                  </div>
                  <div className={`text-lg font-semibold ${latestQuiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {latestQuiz.percentage}% {latestQuiz.passed ? '✓' : '✗'}
                  </div>
                </div>

                {/* NEW: Quiz Completion Counter */}
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm text-[#4C5173] font-semibold mb-1">Quiz Task Completion:</div>
                  <div className="text-lg font-bold text-[#4C5173]">
                    {quizScores.length} mga quiz na-try
                  </div>
                  <div className="text-xs text-gray-600">
                    {/* Count unique lesson+quiz_type combinations */}
                    {(() => {
                      const uniqueLessons = new Set(quizScores.map(q => `${q.lesson_id}-${q.quiz_type}`));
                      return `sa ${uniqueLessons.size} iba't ibang aralin`;
                    })()}
                  </div>
                </div>

                {/* Quiz Details */}
                <div className="text-center text-sm space-y-1">
                  <p className="font-medium">{getQuizTypeDisplay(latestQuiz.quiz_type)}</p>
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(latestQuiz.completed_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Improvement Indicator */}
                {quizImprovement && (
                  <motion.div
                    className={`flex items-center justify-center gap-1 text-sm ${quizImprovement.isImprovement ? 'text-green-600' :
                      quizImprovement.isDecline ? 'text-red-600' : 'text-gray-600'
                      }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {quizImprovement.isImprovement ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {quizImprovement.value > 0 ? '+' : ''}{quizImprovement.value}% from last attempt
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick Action Button */}
          <motion.button
            onClick={() => navigateToSection("history")}
            className="w-full py-2 mt-4 rounded-md border-2 border-[#4C5173] bg-[#4C5173] text-white font-bold text-[16px] hover:bg-[#3a3f5c]"
            whileHover={{ scale: 1.02, backgroundColor: "#3a3f5c" }}
            whileTap={{ scale: 0.98 }}
          >
            See All History
          </motion.button>
        </motion.div>
      </div>

      {/* Performance Section */}
      <motion.div
        className="mt-8 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-[25px] font-bold mb-4">Your Performance:</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* TechGuro Progression */}
          <motion.div
            className="flex-1 border border-black rounded-md p-4 flex flex-col items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-semibold text-[23px] mb-2 text-center">Task Completion Rate (Mga Aralin):</h3>

            {/* Numeric Counter */}
            <div className="text-[#4C5173] font-bold text-lg mb-4">
              {(() => {
                const totalCompleted = Object.values(courseProgress).reduce((sum, percent) => {
                  const courseTotal = courseLessonCounts[courses[Object.keys(courseProgress).indexOf(percent)]] || 5;
                  return sum + Math.round((percent / 100) * courseTotal);
                }, 0);
                const totalLessons = Object.values(courseLessonCounts).reduce((sum, count) => sum + count, 0);
                return `${totalCompleted}/${totalLessons} mga aralin tapos na`;
              })()}
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#ccc" strokeWidth="3" />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#27ae60" strokeWidth="3"
                  strokeDasharray={`${isNaN(overallProgress) ? 0 : overallProgress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${isNaN(overallProgress) ? 0 : overallProgress}, 100` }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </svg>
              <motion.div
                className="absolute text-xl font-bold text-[#27ae60]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {isNaN(overallProgress) ? 0 : overallProgress}%
              </motion.div>
            </div>
            <p className="text-center text-[#4C5173] mt-2">Overall Task Progress</p>
          </motion.div>

          {/* Learning Growth*/}
          <motion.div
            className="flex-1 border border-black rounded-md p-4 flex flex-col"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-semibold text-[23px] mb-4 text-center">Learning Growth</h3>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Score Improvement*/}
              <motion.div
                className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-md font-semibold mb-3 text-center">Score Improvement</h4>
                <div className="w-full max-w-[200px]">
                  <Bar data={barData} options={barOptions} />
                </div>
                <div className="mt-2 text-sm text-center">
                  <p className="text-gray-600">Course: {selectedCourse}</p>
                  <p className="font-medium">
                    {postScore > 0
                      ? postScore - preScore >= 0
                        ? `Improvement: +${postScore - preScore}`
                        : `Change: ${postScore - preScore}`
                      : 'No post-assessment yet'}
                  </p>
                </div>
              </motion.div>

              {/* NEW: Tasks to Unlock Post-Test */}
              <motion.div
                className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h4 className="text-md font-semibold mb-3 text-center">Post-Test Unlock Status</h4>

                {progressRecommendationsData.recommended_lessons ? (
                  <div className="text-center w-full">
                    <div className="text-2xl font-bold mb-2 text-[#4C5173]">
                      {progressRecommendationsData.recommended_completed_count || 0}/
                      {progressRecommendationsData.recommended_total || 0}
                    </div>

                    <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="bg-[#4C5173] h-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((progressRecommendationsData.recommended_completed_count || 0) /
                            Math.max(progressRecommendationsData.recommended_total || 1, 1)) * 100}%`
                        }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                      />
                    </div>

                    <p className="text-sm font-medium mb-1">
                      {progressRecommendationsData.post_assessment_unlocked
                        ? "✅ Post-Test Unlocked!"
                        : `${(progressRecommendationsData.recommended_total || 0) -
                        (progressRecommendationsData.recommended_completed_count || 0)} pa ang kulang`
                      }
                    </p>

                    <p className="text-xs text-gray-600">
                      Mga recommended na aralin para sa Post-Assessment
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Take pre-assessment first</p>
                    <p className="text-xs">to see unlock requirements</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Course Progression*/}
        <motion.div
          className="border border-black rounded-md p-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-semibold text-[23px] mb-4 text-center">Course Progression</h3>
          <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2">
            <AnimatePresence>
              {courses.map((course, index) => {
                const percent = courseProgress[course] || 0;
                const totalLessons = courseLessonCounts[course] || 5;
                const completedLessons = Math.round((percent / 100) * totalLessons);

                return (
                  <motion.div
                    key={index}
                    className="bg-white border border-gray-400 rounded-lg p-3 flex items-center gap-4 min-h-[200px]"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (index * 0.1) }}
                    whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                  >
                    {/* Left Side */}
                    <div className="w-1/3 flex justify-center">
                      <motion.img
                        src={
                          course === "Computer Basics"
                            ? CB_img
                            : course === "Digital Communication and Messaging"
                              ? DCM_img
                              : IS_img
                        }
                        alt={course}
                        className="w-full h-20 object-contain rounded-md scale-230"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    </div>

                    {/* Right Side - Enhanced with Task Completion */}
                    <div className="w-2/3">
                      <h4 className="font-semibold text-[25px] mb-2">{course}</h4>

                      {/* NEW: Explicit Lesson Counter */}
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[#4C5173] font-semibold">Lessons Completed:</span>
                        <span className="text-[#4C5173] font-bold">
                          {completedLessons}/{totalLessons} mga aralin
                        </span>
                      </div>

                      <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-[#6B708D] h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1.5, delay: 1 + (index * 0.1) }}
                        />
                      </div>

                      <motion.p
                        className="text-center mt-1 text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + (index * 0.1) }}
                      >
                        {percent}% completed
                      </motion.p>

                      {/* NEW: Task Status Indicator */}
                      <div className="mt-2 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${percent === 100
                          ? 'bg-green-100 text-green-800'
                          : percent > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {percent === 100
                            ? '✅ Course Complete'
                            : percent > 0
                              ? '🟡 In Progress'
                              : '⏳ Not Started'
                          }
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal for Assessment Details */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeResultsModal}
          >
            <motion.div
              className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#4C5173] to-[#6B708D] text-white p-6 relative">
                <motion.button
                  onClick={closeResultsModal}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedAssessment} Results
                    </h2>
                    <p className="text-lg opacity-90">{selectedCourse}</p>
                  </div>
                </div>

                {/* Score Summary */}
                {!loadingModal && !modalError && (
                  <div className="mt-4 flex items-center gap-6">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {selectedAssessment === "Pre-Assessment" && preAssessment
                          ? `${preAssessment.score}/${preAssessment.total || 20}`
                          : selectedAssessment === "Post-Assessment" && postAssessment
                            ? `${postAssessment.score}/${postAssessment.total || 20}`
                            : "N/A"
                        }
                      </div>
                      <div className="text-sm opacity-80">Final Score</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {selectedAssessment === "Pre-Assessment" && preAssessment
                          ? `${Math.round((preAssessment.score / (preAssessment.total || 20)) * 100)}%`
                          : selectedAssessment === "Post-Assessment" && postAssessment
                            ? `${Math.round((postAssessment.score / (postAssessment.total || 20)) * 100)}%`
                            : "N/A"
                        }
                      </div>
                      <div className="text-sm opacity-80">Percentage</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">
                        {modalResponses.filter(r => r.is_correct).length || 0}
                      </div>
                      <div className="text-sm opacity-80">Correct</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {loadingModal && (
                  <motion.div
                    className="flex flex-col justify-center items-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-[#4C5173] border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-lg text-gray-600">Loading assessment details...</p>
                  </motion.div>
                )}

                {!loadingModal && modalError && (
                  <motion.div
                    className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-red-600">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Results</h3>
                    <p className="text-red-700">{modalError}</p>
                  </motion.div>
                )}

                {!loadingModal && !modalError && modalQuestions.length === 0 && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-600">No questions found for this assessment.</p>
                  </motion.div>
                )}

                {!loadingModal && !modalError && modalQuestions.length > 0 && (
                  <div className="space-y-6">
                    {modalQuestions.map((q, index) => {
                      let choices = [];
                      try {
                        choices = Array.isArray(q.choices)
                          ? q.choices
                          : q.choices
                            ? JSON.parse(q.choices)
                            : [];
                      } catch (e) {
                        choices = [];
                      }

                      const userResp = modalResponses.find(r => r.question_id === q.id || r.question_id === q.question_id);
                      const isCorrect = userResp?.is_correct;

                      return (
                        <motion.div
                          key={q.id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#4C5173] text-white px-3 py-1 rounded-full text-sm font-bold">
                                  Q{index + 1}
                                </span>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}>
                                  {isCorrect ? (
                                    <>
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                      >
                                        ✓
                                      </motion.div>
                                      Correct
                                    </>
                                  ) : (
                                    <>
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                      >
                                        ✗
                                      </motion.div>
                                      Incorrect
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                                {q.text || q.question || q.question_text}
                              </p>
                            </div>
                          </div>

                          {/* Question Image (if exists) */}
                          {q.media_url && (
                            <div className="mb-4 flex justify-center">
                              <img
                                src={q.media_url}
                                alt="Question illustration"
                                className="max-w-xs max-h-48 object-contain rounded-lg border border-gray-300"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            </div>
                          )}

                          {/* Answer Choices */}
                          <div className="space-y-3">
                            {choices.map((choice, idx) => {
                              const isCorrectAnswer = choice === (q.correct_answer || q.answer || q.correct);
                              const isUserChoice = userResp && (choice === (userResp.selected_choice || userResp.user_answer));

                              return (
                                <motion.div
                                  key={idx}
                                  className={`p-4 rounded-lg border-2 transition-all ${isCorrectAnswer
                                    ? 'bg-green-50 border-green-300'
                                    : isUserChoice && !isCorrectAnswer
                                      ? 'bg-red-50 border-red-300'
                                      : 'bg-white border-gray-200'
                                    }`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1 + idx * 0.05 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                                        {String.fromCharCode(65 + idx)}
                                      </span>

                                      {/* Choice content - handle both text and image choices */}
                                      {typeof choice === 'object' && choice.image ? (
                                        <img
                                          src={choice.image}
                                          alt={`Choice ${String.fromCharCode(65 + idx)}`}
                                          className="w-16 h-16 object-contain rounded border"
                                          onError={(e) => { e.target.src = placeholderimg }}
                                        />
                                      ) : (
                                        <span className="text-gray-800">{choice}</span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && (
                                        <motion.div
                                          className="flex items-center gap-1 text-green-700 font-bold"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                          <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                            ✓
                                          </span>
                                          Correct
                                        </motion.div>
                                      )}

                                      {isUserChoice && !isCorrectAnswer && (
                                        <motion.div
                                          className="flex items-center gap-1 text-red-700 font-bold"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                          <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                                            ✗
                                          </span>
                                          Your Answer
                                        </motion.div>
                                      )}

                                      {isUserChoice && isCorrectAnswer && (
                                        <motion.div
                                          className="flex items-center gap-1 text-green-700 font-bold"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                          <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                            ✓
                                          </span>
                                          Your Correct Answer
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Answer Status */}
                          {!userResp?.selected_choice && !userResp?.user_answer && (
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                              <span className="text-gray-500 text-sm">No answer was recorded for this question</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!loadingModal && !modalError && modalQuestions.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total Questions: {modalQuestions.length} |
                      Correct: {modalResponses.filter(r => r.is_correct).length} |
                      Incorrect: {modalResponses.filter(r => !r.is_correct).length}
                    </div>
                    <motion.button
                      onClick={closeResultsModal}
                      className="px-6 py-2 bg-[#4C5173] text-white font-semibold rounded-lg hover:bg-[#3a3f5c] transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardSection;