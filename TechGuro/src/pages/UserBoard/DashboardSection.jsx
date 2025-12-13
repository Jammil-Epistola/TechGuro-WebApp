// DashboardSection.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import ProfileSection from "../../components/Dashboard/ProfileSection";
import API_URL from '../../config/api';
import RecentMilestones from "../../components/Dashboard/RecentMilestones";
import AssessmentPerformance from "../../components/Dashboard/AssessmentPerformance";
import RecentQuizScores from "../../components/Dashboard/RecentQuizScores";
import PerformanceOverview from "../../components/Dashboard/PerformanceOverview";
import LearningGrowth from "../../components/Dashboard/LearningGrowth";
import AssessmentResultsModal from "../../components/Dashboard/AssessmentResultsModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardSection = ({ goToProfile, navigateToSection }) => {
  const { user } = useUser();

  // Course configuration
  const courses = [
    "Computer Basics",
    "Internet Safety",
    "Digital Communication & Messaging"
  ];

  const courseLessonCounts = {
    "Computer Basics": 5,
    "Internet Safety": 5,
    "Digital Communication & Messaging": 5
  };

  // State management
  const [selectedCourse, setSelectedCourse] = useState("Computer Basics");
  const [selectedAssessment, setSelectedAssessment] = useState("Pre-Assessment");
  const [courseProgress, setCourseProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [completeMasteryData, setCompleteMasteryData] = useState(null);
  const [masteryLoading, setMasteryLoading] = useState(false);

  // Assessments
  const [assessments, setAssessments] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalQuestions, setModalQuestions] = useState([]);
  const [modalResponses, setModalResponses] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Milestones
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [milestonesError, setMilestonesError] = useState(null);
  const [allMilestonesData, setAllMilestonesData] = useState([]);

  // Quiz scores
  const [quizScores, setQuizScores] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const profileRef = React.useRef(null);

  // Scroll to profile when requested
  useEffect(() => {
    if (goToProfile && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [goToProfile]);

  // Helper functions
  const getCourseName = (courseId) => {
    const index = courseId - 1;
    return courses[index] || "Unknown Course";
  };

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

  const processMilestonesData = (data) => {
    const sorted = [...data].sort((a, b) =>
      new Date(b.date_earned) - new Date(a.date_earned)
    );
    setMilestones(sorted);
  };

  const processQuizData = (data) => {
    if (Array.isArray(data.results)) {
      const sorted = [...data.results].sort((a, b) =>
        new Date(b.completed_at) - new Date(a.completed_at)
      );
      setQuizScores(sorted);
    } else {
      setQuizScores([]);
    }
  };

  // Centralized data fetching
  const fetchAllDashboardData = async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const [
        progressResponse,
        assessmentsResponse,
        milestonesResponse,
        quizResponse,
        allMilestonesResponse,
        completeMasteryResponse
      ] = await Promise.all([
        fetch(`${API_URL}/progress/${user.user_id}`),
        fetch(`${API_URL}/assessment/${user.user_id}`),
        fetch(`${API_URL}/milestones/earned/${user.user_id}`),
        fetch(`${API_URL}/quiz/results/${user.user_id}`),
        fetch(`${API_URL}/milestones/${user.user_id}`),
        fetch(`${API_URL}/bkt/mastery-complete/${user.user_id}/${courses.indexOf(selectedCourse) + 1}`)
      ]);

      const responses = [
        { name: 'progress', response: progressResponse },
        { name: 'assessments', response: assessmentsResponse },
        { name: 'milestones', response: milestonesResponse },
        { name: 'quiz', response: quizResponse },
        { name: 'allMilestones', response: allMilestonesResponse },
        { name: 'completeMastery', response: completeMasteryResponse }
      ];

      const failedRequests = responses.filter(r => !r.response.ok);
      if (failedRequests.length > 0) {
        const failedNames = failedRequests.map(r => r.name).join(', ');
        throw new Error(`Failed to fetch: ${failedNames}`);
      }

      const [
        progressData,
        assessmentsData,
        milestonesData,
        quizData,
        allMilestonesData,
        completeMasteryData
      ] = await Promise.all([
        progressResponse.json(),
        assessmentsResponse.json(),
        milestonesResponse.json(),
        quizResponse.json(),
        allMilestonesResponse.json(),
        completeMasteryResponse.json()
      ]);

      processProgressData(progressData);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
      processMilestonesData(milestonesData);
      processQuizData(quizData);
      setAllMilestonesData(allMilestonesData);
      setCompleteMasteryData(completeMasteryData);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setFetchError(error.message);
      setCourseProgress({});
      setOverallProgress(0);
      setAssessments([]);
      setMilestones([]);
      setQuizScores([]);
      setAllMilestonesData([]);
      setCompleteMasteryData({});
      setMilestonesError(error.message);
      setQuizError(error.message);
    } finally {
      setIsLoading(false);
      setMilestonesLoading(false);
      setQuizLoading(false);
    }
  };

  // Fetch course-specific mastery data when course changes
  const fetchCourseMasteryData = async () => {
    if (!user?.user_id) return;

    setMasteryLoading(true);
    try {
      const courseId = courses.indexOf(selectedCourse) + 1;
      const response = await fetch(
        `${API_URL}/bkt/mastery-complete/${user.user_id}/${courseId}`
      );

      if (response.ok) {
        const data = await response.json();
        setCompleteMasteryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch mastery data:", error);
    } finally {
      setMasteryLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseMasteryData();
  }, [selectedCourse, user]);

  useEffect(() => {
    fetchAllDashboardData();
  }, [user]);

  // Assessment modal functions
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

      const assessRes = await fetch(`${API_URL}/assessment/${user.user_id}`);
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

      const questionsRes = await fetch(`${API_URL}/assessment/questions/${courseId}?assessment_type=${assessmentType}`);
      if (!questionsRes.ok) throw new Error("Failed to fetch questions for this assessment");
      const questions = await questionsRes.json();

      const responsesRes = await fetch(`${API_URL}/assessment/responses/${latest.id}`);
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

  // Get assessment data
  const preAssessment = assessments.find(
    a => a.course_id === courses.indexOf(selectedCourse) + 1 && a.assessment_type === "pre"
  );
  const postAssessment = assessments.find(
    a => a.course_id === courses.indexOf(selectedCourse) + 1 && a.assessment_type === "post"
  );

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

  // Loading state
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

  // Error state
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

  return (
    <div className="bg-[#DFDFEE] min-h-screen pt-10 text-black text-[18px]">
      <motion.h1
        className="text-[30px] font-bold text-[#4C5173] mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        PROFILE
      </motion.h1>

      {/* PROFILE SECTION WRAPPER */}
      <div ref={profileRef} className="profile-card">
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

      {/* WRAPPED COMPONENTS FOR TUTORIAL HIGHLIGHTING */}
      <div className="flex flex-col xl:flex-row gap-6 xl:items-stretch">
        
        {/* Wrapper for Recent Milestones */}
        <div className="recent-milestones-section flex-1 flex">
          <RecentMilestones
            milestones={milestones}
            allMilestonesData={allMilestonesData}
            milestonesLoading={milestonesLoading}
            milestonesError={milestonesError}
            navigateToSection={navigateToSection}
          />
        </div>

        {/* Wrapper for Assessment Scores */}
        <div className="assessment-section flex-1 flex">
          <AssessmentPerformance
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedAssessment={selectedAssessment}
            setSelectedAssessment={setSelectedAssessment}
            preAssessment={preAssessment}
            postAssessment={postAssessment}
            totalQuestions={totalQuestions}
            openResultsModal={openResultsModal}
          />
        </div>

        {/* Wrapper for Recent Quiz */}
        <div className="recent-quiz-section flex-1 flex">
          <RecentQuizScores
            quizScores={quizScores}
            quizLoading={quizLoading}
            quizError={quizError}
            navigateToSection={navigateToSection}
          />
        </div>
      </div>

      {/* Performance Section */}
      <motion.div
        className="mt-8 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-[25px] font-bold mb-4">Your Performance:</h2>

        {/* PERFORMANCE OVERVIEW WRAPPER */}
        <div className="performance-overview-section">
          <PerformanceOverview
            courses={courses}
            courseLessonCounts={courseLessonCounts}
            courseProgress={courseProgress}
            overallProgress={overallProgress}
          />
        </div>

        {/* LEARNING GROWTH WRAPPER */}
        <div className="learning-growth-section">
          <LearningGrowth
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            preAssessment={preAssessment}
            postAssessment={postAssessment}
            completeMasteryData={completeMasteryData}
            masteryLoading={masteryLoading}
            barData={barData}
            barOptions={barOptions}
            userId={user.user_id}
          />
        </div>
      </motion.div>

      {/* Assessment Results Modal */}
      <AssessmentResultsModal
        showModal={showModal}
        closeModal={closeResultsModal}
        loadingModal={loadingModal}
        modalError={modalError}
        modalQuestions={modalQuestions}
        modalResponses={modalResponses}
        selectedAssessment={selectedAssessment}
        selectedCourse={selectedCourse}
        preAssessment={preAssessment}
        postAssessment={postAssessment}
      />
    </div>
  );
};

export default DashboardSection;