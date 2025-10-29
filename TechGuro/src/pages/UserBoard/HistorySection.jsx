//HistorySection.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../../context/UserContext";
import { BookOpen, Target } from "lucide-react";
import {
  getCourseName,
  getQuizTypeLabel,
  formatDate,
  filterByDateRange,
  sortItems,
} from "../../utility/historyConstants";

import HistoryFilters from "../../components/HistoryFilters";
import AssessmentHistory from "../../components/AssessmentHistory";
import QuizHistory from "../../components/QuizHistory";
import API_URL from '../../config/api';

const HistorySection = () => {
  const { user } = useUser();

  // Data states
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("assessments");

  // Filters
  const [filters, setFilters] = useState({
    course: "all",
    quizType: "all",
    dateRange: "all",
    sortBy: "recent",
  });

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);
  const [detailQuestions, setDetailQuestions] = useState([]);
  const [detailResponses, setDetailResponses] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});

  useEffect(() => {
    if (user?.user_id) {
      fetchHistoryData();
    }
  }, [user]);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [assessmentRes, quizRes] = await Promise.all([
        fetch(`${API_URL}/assessment/${user.user_id}`),
        fetch(`${API_URL}/quiz/results/${user.user_id}`),
      ]);

      if (!assessmentRes.ok || !quizRes.ok) {
        throw new Error("Failed to fetch history data");
      }

      const assessmentData = await assessmentRes.json();
      const quizData = await quizRes.json();

      setAssessmentHistory(Array.isArray(assessmentData) ? assessmentData : []);
      setQuizHistory(Array.isArray(quizData.results) ? quizData.results : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      course: "all",
      quizType: "all",
      dateRange: "all",
      sortBy: "recent",
    });
  };

  return (
    <div className="bg-[#DFDFEE] min-h-screen p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#4C5173] mb-2">Learning History</h1>
        <p className="text-gray-600 mb-6">Track your progress and review performance</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <motion.button
            onClick={() => setActiveTab("assessments")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              activeTab === "assessments"
                ? "bg-[#4C5173] text-white"
                : "bg-white border border-[#4C5173] text-[#4C5173]"
            }`}
          >
            <BookOpen size={20} />
            Assessments ({assessmentHistory.length})
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              activeTab === "quizzes"
                ? "bg-[#4C5173] text-white"
                : "bg-white border border-[#4C5173] text-[#4C5173]"
            }`}
          >
            <Target size={20} />
            Quizzes ({quizHistory.length})
          </motion.button>
        </div>

        {/* Filters */}
        <HistoryFilters
          activeTab={activeTab}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "assessments" ? (
            <AssessmentHistory
              data={assessmentHistory}
              filters={filters}
              showFeedback={showFeedback}
              setShowFeedback={setShowFeedback}
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              detailModalData={detailModalData}
              setDetailModalData={setDetailModalData}
              detailQuestions={detailQuestions}
              setDetailQuestions={setDetailQuestions}
              detailResponses={detailResponses}
              setDetailResponses={setDetailResponses}
              loadingDetails={loadingDetails}
              setLoadingDetails={setLoadingDetails}
              handleFeedback={async () => {}}
            />
          ) : (
            <QuizHistory
              data={quizHistory}
              filters={filters}
              showFeedback={showFeedback}
              setShowFeedback={setShowFeedback}
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              detailModalData={detailModalData}
              setDetailModalData={setDetailModalData}
              loadingDetails={loadingDetails}
              setLoadingDetails={setLoadingDetails}
              handleFeedback={async () => {}}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HistorySection;
