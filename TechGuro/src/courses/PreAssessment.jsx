// src/pages/PreAssessmentPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseNavbar from "./courseNavbar";
import TekiDialog from "../components/TekiDialog";
import QuestionCard from "../components/PrePost/QuestionCard";
import AssessmentInstructions from "../components/PrePost/AssessmentInstructions";
import AssessmentResults from "../components/PrePost/AssessmentResults";
import SubmitConfirmationModal from "../components/PrePost/SubmitConfirmationModal";
import { useUser } from "../context/UserContext";
import API_URL from '../config/api';

const PreAssessment = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unlockReason, setUnlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSelectAnswer, setShowSelectAnswer] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lastQuestionTimer, setLastQuestionTimer] = useState(null);

  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const resCourses = await fetch(`${API_URL}/courses`);
        if (!resCourses.ok) throw new Error("Failed to fetch courses");
        const courses = await resCourses.json();

        const course = courses.find(
          (c) => c.title.replace(/\s+/g, "").toLowerCase() === courseName.toLowerCase()
        );
        if (!course) {
          setUnlockReason(`Course "${courseName}" not found.`);
          return;
        }

        const resQuestions = await fetch(
          `${API_URL}/assessment/questions/${course.id}?assessment_type=pre`
        );
        if (!resQuestions.ok) throw new Error("Failed to fetch questions");
        const data = await resQuestions.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setUnlockReason("Could not load questions. Please try again.");
      }
    };

    fetchQuestions();
  }, [courseName]);

  //  timer when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (lastQuestionTimer) {
        clearTimeout(lastQuestionTimer);
      }
    };
  }, [lastQuestionTimer, currentQuestionIndex]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    // Clear any existing timer
    if (lastQuestionTimer) {
      clearTimeout(lastQuestionTimer);
    }

    // If this is the last question, set timer for modal
    if (currentQuestionIndex === questions.length - 1) {
      const timer = setTimeout(() => {
        setShowSubmitModal(true);
      }, 1000);
      setLastQuestionTimer(timer);
    } else {
      // Auto-advance for non-last questions
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 800);
      }
    }
  };

  const handleNext = () => {
    const currentAnswer = answers[questions[currentQuestionIndex]?.id];
    if (!currentAnswer) {
      setShowSelectAnswer(true);
      return;
    }

    // If it's the last question, show confirmation modal
    if (currentQuestionIndex === questions.length - 1) {
      setShowSubmitModal(true);
      return;
    }

    // Otherwise, go to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setUnlockReason("Please log in to submit your assessment.");
      return;
    }

    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      setUnlockReason(`Please answer all questions. ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const resCourses = await fetch(`${API_URL}/courses`);
      const courses = await resCourses.json();
      const course = courses.find(
        (c) => c.title.replace(/\s+/g, "").toLowerCase() === courseName.toLowerCase()
      );

      const submissionData = {
        user_id: user.user_id,
        course_id: course.id,
        assessment_type: "pre",
        responses: questions.map(q => ({
          question_id: q.id,
          selected_choice: answers[q.id]
        }))
      };

      const response = await fetch(`${API_URL}/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error("Failed to submit assessment");

      const result = await response.json();
      setFinalScore(result.score || 0);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      setUnlockReason("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAssessment = () => setShowInstructions(false);

  // Show instructions first
  if (showInstructions) {
    return (
      <AssessmentInstructions
        assessmentType="pre"
        courseName={courseName}
        onStart={handleStartAssessment}
      />
    );
  }

  // Show results after submission
  if (showResults) {
    return (
      <AssessmentResults
        assessmentType="pre"
        courseName={courseName}
        score={finalScore}
        totalQuestions={questions.length}
        isProcessing={isSubmitting}
        onComplete={() => navigate(`/courses/${courseName}`)}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#DFDFEE]">
        <CourseNavbar courseTitle={`${courseName} Pre-Assessment`} />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-xl text-black">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];

  return (
    <div className="min-h-screen bg-[#DFDFEE]">
      <CourseNavbar courseTitle={`${courseName} Pre-Assessment`} />
      <div className="max-w-6xl mx-auto p-3 md:p-5">
        <div className="text-center mb-4 md:mb-6 px-2">
          <h1 className="text-xl md:text-3xl font-bold text-black mb-2">
            Pre-Assessment: {courseName}
          </h1>
          <div className="text-base md:text-xl text-black">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 md:h-3 mt-3 md:mt-4">
            <div
              className="bg-[#4C5173] h-2 md:h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-end justify-center gap-6">
          {/* Previous Button */}
          <div className="flex items-end">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all ${currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105 shadow-lg"
                }`}
            >
              Previous
            </button>
          </div>

          {/* Question Card */}
          <div className="flex justify-center">
            <QuestionCard
              question={{ ...currentQuestion, questionNumber: currentQuestionIndex + 1 }}
              selectedAnswer={currentAnswer}
              onAnswerChange={handleAnswerChange}
              assessmentType={"pre"}
            />
          </div>

          {/* Next Button  */}
          <div className="flex items-end">
            <button
              onClick={handleNext}
              className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg ${isLastQuestion ? "invisible" : ""
                }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Mobile Layout*/}
        <div className="md:hidden flex flex-col items-center gap-4">
          {/* Question Card */}
          <div className="w-full flex justify-center px-2">
            <QuestionCard
              question={{ ...currentQuestion, questionNumber: currentQuestionIndex + 1 }}
              selectedAnswer={currentAnswer}
              onAnswerChange={handleAnswerChange}
              assessmentType={"pre"}
            />
          </div>

          {/* Buttons Below Card */}
          <div className="w-full flex justify-between gap-3 px-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 px-4 py-3 rounded-lg text-base font-semibold transition-all ${currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 active:scale-95 shadow-lg"
                }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className={`flex-1 px-4 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg ${isLastQuestion ? "invisible" : ""
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onConfirm={handleSubmit}
        onCancel={() => {
          setShowSubmitModal(false);
          // Clear the timer when cancelled
          if (lastQuestionTimer) {
            clearTimeout(lastQuestionTimer);
            setLastQuestionTimer(null);
          }
        }}
        isSubmitting={isSubmitting}
      />

      {/* TekiDialog */}
      {showSelectAnswer && (
        <TekiDialog
          message="Please select an answer before proceeding to the next question."
          onClose={() => setShowSelectAnswer(false)}
        />
      )}

      {unlockReason && (
        <TekiDialog
          message={unlockReason}
          onClose={() => setUnlockReason("")}
        />
      )}
    </div>
  );
};

export default PreAssessment;