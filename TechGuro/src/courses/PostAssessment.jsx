// PostAssessment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseNavbar from './courseNavbar.jsx';
import { useUser } from '../context/UserContext.jsx';
import Teki1 from "../assets/Teki 1.png";

const PostAssessment = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user } = useUser();
  const [dialogueStep, setDialogueStep] = useState(0);
  const [startTest, setStartTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMastery, setIsCheckingMastery] = useState(false);
  const [isMastered, setIsMastered] = useState(null);
  const [reviewLessons, setReviewLessons] = useState([]);
  const [lessonTitles, setLessonTitles] = useState({});
  // Results modal state 
  const [showModal, setShowModal] = useState(false);
  const [modalQuestions, setModalQuestions] = useState([]);
  const [modalResponses, setModalResponses] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  // Debug state for BKT troubleshooting
  const [debugInfo, setDebugInfo] = useState(null);

  // NEW: Add state to track if assessment is completed
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
  const COURSE_PATH_TO_ID = { "ComputerBasics": 1 };
  const courseId = COURSE_PATH_TO_ID[courseName] || 1;

  useEffect(() => {
    if (!user?.user_id) return;
  }, [user, courseId, courseName]);

  useEffect(() => {
    // Load post-assessment questions for this course
    fetch(`${API_BASE}/assessment/questions/${courseId}?assessment_type=post&t=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        const formatted = data.map(q => ({
          question_id: q.id,
          question: q.text,
          answer: q.correct_answer,
          options: q.choices ? JSON.parse(q.choices) : []
        }));
        setQuestions(formatted);
      })
      .catch(error => console.error("Failed to load post questions:", error));
  }, [API_BASE, courseId]);

  useEffect(() => {
    // Load lesson list for mapping lesson_id -> title
    fetch(`${API_BASE}/lesson-courses/${courseId}?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const map = {};
        (data?.units || []).forEach(unit => {
          (unit.lessons || []).forEach(lesson => {
            map[lesson.lesson_id] = lesson.lesson_title;
          });
        });
        setLessonTitles(map);
      })
      .catch(err => console.error('Failed to fetch lesson titles:', err));
  }, [API_BASE, courseId]);

  const handleDialogueNext = () => {
    if (dialogueStep === 2) {
      setStartTest(true);
    } else {
      setDialogueStep(dialogueStep + 1);
    }
  };

  // FIXED: Improved handleAnswerSelect function
  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = {
      ...selectedAnswers,
      [currentQuestion]: selectedOption
    };
    setSelectedAnswers(newAnswers);

    // Check if this is the last question
    const isLastQuestion = currentQuestion >= questions.length - 1;

    if (isLastQuestion) {
      // Mark assessment as completed and submit immediately
      setAssessmentCompleted(true);
      handleSubmitWithAnswers(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (!selected) return;
      if (selected === q.answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const calculateScoreWithAnswers = (answers) => {
    let correctAnswers = 0;
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (!selected) return;
      if (selected === q.answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitting(true);
    setIsCheckingMastery(true);
    setAssessmentCompleted(true);

    const responses = questions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      let isCorrect = false;

      if (!selected) return { question_id: q.question_id, is_correct: false };
      isCorrect = selected === q.answer;

      return {
        question_id: q.question_id,
        is_correct: isCorrect,
        selected_choice: selected
      };
    });

    const payload = {
      user_id: user?.user_id || 1,
      course_id: courseId,
      assessment_type: "post",
      responses: responses
    };

    // Submit assessment first
    fetch(`${API_BASE}/assessment/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(async data => {
        console.log("Assessment submitted:", data);

        // Process with BKT system
        await processBKTMastery();
      })
      .catch(error => {
        console.error("Post-assessment submission failed:", error);
        setIsSubmitting(false);
        setIsCheckingMastery(false);
        // Don't reset assessmentCompleted on error to prevent going back to questions
      });
  };

  // FIXED: Improved handleSubmitWithAnswers function
  const handleSubmitWithAnswers = (answers = selectedAnswers) => {
    // Prevent multiple submissions
    if (isSubmitting || assessmentCompleted) {
      return;
    }

    const finalScore = calculateScoreWithAnswers(answers);
    setScore(finalScore);
    setIsSubmitting(true);
    setIsCheckingMastery(true);

    const responses = questions.map((q, idx) => {
      const selected = answers[idx];
      let isCorrect = false;

      if (!selected) return {
        question_id: q.question_id,
        is_correct: false,
        selected_choice: null
      };

      isCorrect = selected === q.answer;

      return {
        question_id: q.question_id,
        is_correct: isCorrect,
        selected_choice: selected
      };
    });

    const payload = {
      user_id: user?.user_id || 1,
      course_id: courseId,
      assessment_type: "post",
      responses: responses
    };

    console.log("Submitting assessment with payload:", payload);

    // Submit assessment first
    fetch(`${API_BASE}/assessment/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(async data => {
        console.log("Assessment submitted:", data);

        // Process with BKT system
        await processBKTMastery();
      })
      .catch(error => {
        console.error("Post-assessment submission failed:", error);
        setIsSubmitting(false);
        setIsCheckingMastery(false);
        // Don't reset assessmentCompleted on error to prevent going back to questions
      });
  };

  // NEW: Centralized BKT processing function
  const processBKTMastery = async () => {
    try {
      console.log("Processing BKT mastery...");

      const bktRes = await fetch(`${API_BASE}/bkt/update-from-post?user_id=${user?.user_id || 1}&course_id=${courseId}`, {
        method: "POST"
      });

      if (!bktRes.ok) {
        throw new Error(`BKT request failed: ${bktRes.status} ${bktRes.statusText}`);
      }

      const bktData = await bktRes.json();
      console.log("BKT Response:", bktData);

      // Store debug info for troubleshooting
      setDebugInfo(bktData);

      // Check BKT mastery result
      const courseIsMastered = bktData?.course_mastered || false;
      setIsMastered(courseIsMastered);

      if (courseIsMastered) {
        console.log("✅ Course mastered according to BKT");
      } else {
        console.log("❌ Course not mastered, lessons to review:", bktData?.recommend);
        // Set recommended lessons for review from BKT
        setReviewLessons(bktData?.recommend || []);
      }

    } catch (bktError) {
      console.error('BKT mastery processing failed:', bktError);

      // FALLBACK: Use recommendations endpoint if BKT fails
      try {
        console.log("Attempting fallback recommendations...");
        const recRes = await fetch(`${API_BASE}/bkt/recommendations/${user?.user_id || 1}/${courseId}?threshold=0.8&limit=5`);

        if (recRes.ok) {
          const recData = await recRes.json();
          const hasWeakLessons = (recData?.recommended_lessons || []).length > 0;

          // If no weak lessons found, consider mastered
          setIsMastered(!hasWeakLessons);

          if (hasWeakLessons) {
            setReviewLessons(recData.recommended_lessons);
          }

          console.log("Fallback result - Mastered:", !hasWeakLessons, "Recommendations:", recData?.recommended_lessons);
        } else {
          throw new Error("Recommendations endpoint also failed");
        }

      } catch (fallbackError) {
        console.error('All mastery checking methods failed:', fallbackError);

        // FINAL FALLBACK: Conservative approach - require high score for mastery
        const conservativePass = (score / questions.length) >= 0.90; // 90% minimum
        setIsMastered(conservativePass);

        if (!conservativePass) {
          // Show all lessons for review as we can't determine specific ones
          const allLessonIds = Object.keys(lessonTitles).map(id => parseInt(id));
          setReviewLessons(allLessonIds);
        }

        console.log("Final fallback - Conservative pass:", conservativePass);
      }
    } finally {
      setIsSubmitting(false);
      setIsCheckingMastery(false);
    }
  };

  const closeResultsModal = () => {
    setShowModal(false);
    setModalQuestions([]);
    setModalResponses([]);
    setModalError(null);
  };

  const openResultsModal = async () => {
    setShowModal(true);
    setLoadingModal(true);
    setModalError(null);

    try {
      // Fetch questions for this course/type
      const questionsRes = await fetch(`${API_BASE}/assessment/questions/${courseId}?assessment_type=post`);
      if (!questionsRes.ok) throw new Error('Failed to fetch questions');
      const questions = await questionsRes.json();

      // Find latest post assessment id for this user/course
      const assessRes = await fetch(`${API_BASE}/assessment/${user?.user_id || 1}`);
      if (!assessRes.ok) throw new Error('Failed to fetch assessments');
      const assessAll = await assessRes.json();
      const posts = (assessAll || []).filter(a => a.course_id === courseId && a.assessment_type === 'post');
      if (!posts.length) throw new Error('No post assessment found');
      const latest = posts.sort((a, b) => new Date(b.date_taken || 0) - new Date(a.date_taken || 0))[0];

      // Fetch responses for that assessment
      const responsesRes = await fetch(`${API_BASE}/assessment/responses/${latest.id}`);
      if (!responsesRes.ok) throw new Error('Failed to fetch responses');
      const responses = await responsesRes.json();

      setModalQuestions(questions);
      setModalResponses(responses);
    } catch (err) {
      console.error(err);
      setModalError(err.message);
      setModalQuestions([]);
      setModalResponses([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  // FIXED: Updated render logic to use assessmentCompleted flag
  const shouldShowResults = assessmentCompleted && (isCheckingMastery || isMastered !== null);
  const shouldShowQuestions = startTest && !assessmentCompleted && !shouldShowResults;

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="text-center py-8">
        <h1 className="text-[42px] font-bold">{formattedTitle.toUpperCase()}</h1>
        <h2 className="text-[36px] font-semibold">Post-Assessment Test</h2>
      </div>

      <div className="flex flex-col justify-center items-center p-8">
        {!startTest ? (
          <div className="bg-white border border-black rounded-lg p-10 max-w-[1000px] w-full relative">
            <img src={Teki1} alt="Teki" className="w-[180px] h-[180px] absolute top-[-90px] right-[-90px]" />
            <h2 className="text-[32px] font-bold mb-6 text-left">Teki</h2>
            <div className="text-[24px] text-justify mb-6">
              {dialogueStep === 0 && (
                <>You've completed the lessons. Now it's time for your Post-Assessment to measure your learning progress!</>
              )}

              {dialogueStep === 1 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-[20px] leading-relaxed">
                  <p className="mb-2">
                    Just like before, we’ll use the <strong>Bayesian Knowledge Tracing (BKT)</strong> model
                    to measure how your mastery has improved.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>P(known)</strong>: Chance you already know a skill before answering.</li>
                    <li><strong>P(will learn)</strong>: Chance you learn a skill after practicing.</li>
                    <li><strong>P(slip)</strong>: Chance you answer wrong even if you know the skill.</li>
                    <li><strong>P(guess)</strong>: Chance you answer right even if you don’t know it.</li>
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">
                    This helps us evaluate improvement and determine course completion eligibility.
                  </p>
                </div>
              )}

              {dialogueStep === 2 && (
                <>Answer the following questions carefully. There's no time limit—just do your best!</>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDialogueNext}
                className="px-8 py-4 bg-blue-500 text-white text-[20px] rounded hover:bg-blue-600 transition"
              >
                {dialogueStep === 2 ? "Start Post-Assessment" : "Next"}
              </button>
            </div>
          </div>
        ) : shouldShowResults ? (
          <div className="bg-white border border-black rounded-lg p-10 max-w-[1000px] w-full relative">
            <img src={Teki1} alt="Teki" className="w-[180px] h-[180px] absolute top-[-90px] right-[-90px]" />
            <h2 className="text-[32px] font-bold mb-6 text-left">Teki</h2>
            {isMastered === null ? (
              <div>
                <p className="text-[24px] text-justify mb-6">
                  You scored {score}/{questions.length}. Checking your mastery level<span className="animate-typing ml-1">...</span>
                </p>
                {/* DEBUG: Show BKT processing info during development */}
                {debugInfo && (
                  <div className="text-sm text-gray-600 mt-4 p-4 bg-gray-100 rounded">
                    <p><strong>Debug Info:</strong></p>
                    <p>BKT Eligible: {debugInfo.bkt_eligible ? "✅" : "❌"}</p>
                    <p>Score Eligible: {debugInfo.score_eligible ? "✅" : "❌"}</p>
                    <p>Overall Score: {Math.round((debugInfo.overall_score || 0) * 100)}%</p>
                    <p>Mastery Count: {debugInfo.debug_info?.mastery_count || 0} / {debugInfo.debug_info?.total_lessons || 0}</p>
                  </div>
                )}
              </div>
            ) : isMastered ? (
              // MASTERED STATE - Show success message
              <div>
                <p className="text-[24px] text-justify mb-4 text-green-600 font-bold">
                  🎉 Congratulations! You've mastered this course!
                </p>
                <p className="text-[18px] mb-6">Score: <span className="font-bold">{score}</span> / {questions.length}</p>

                {/* Show improvement analysis if available */}
                {debugInfo?.improvement_analysis && (
                  <div className="text-[16px] mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-semibold text-green-800">Learning Progress:</p>
                    <p>Average Improvement: +{Math.round((debugInfo.improvement_analysis.avg_improvement || 0) * 100)}%</p>
                    <p>Lessons Improved: {debugInfo.improvement_analysis.lessons_improved} / {debugInfo.improvement_analysis.total_lessons}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={openResultsModal}
                    className="flex-1 py-3 rounded-md border-2 border-black text-white font-bold text-[18px] bg-[#479DFF]"
                  >
                    See Assessment Result
                  </button>
                  <button
                    onClick={() => navigate('/UserDashboard')}
                    className="flex-1 py-3 rounded-md border-2 border-black text-white font-bold text-[18px] bg-[#6B708D]"
                  >
                    Return To Courses
                  </button>
                </div>
              </div>
            ) : (
              // FAILED STATE - Show review lessons message
              <div>
                <p className="text-[24px] text-justify mb-4 text-red-600 font-bold">
                  You're close! Review the lessons below, then try the Post-Assessment again.
                </p>
                <p className="text-[18px] mb-2">Score: <span className="font-bold">{score}</span> / {questions.length}</p>

                {/* Show BKT analysis if available */}
                {debugInfo?.improvement_analysis && (
                  <div className="text-[14px] mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-semibold text-yellow-800">Progress Analysis:</p>
                    <p>Average Improvement: +{Math.round((debugInfo.improvement_analysis.avg_improvement || 0) * 100)}%</p>
                    <p>Growth Level: {debugInfo.improvement_analysis.overall_growth}</p>
                  </div>
                )}

                {reviewLessons && reviewLessons.length > 0 && (
                  <div className="text-[18px] text-[#4c5173]">
                    <span className="font-semibold">Lessons to review:</span>
                    <ul className="list-disc list-inside mt-2">
                      {reviewLessons.map((lid) => (
                        <li key={lid} className="flex items-center gap-3 mb-1">
                          <span>{lessonTitles[lid] || `Lesson ${lid}`}</span>
                          <button
                            onClick={() => navigate(`/courses/${courseName}/lesson`, { state: { lessonId: lid } })}
                            className="px-3 py-1 rounded-md border border-black text-white bg-[#4C5173] text-sm"
                          >
                            Open
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={openResultsModal}
                    className="flex-1 py-3 rounded-md border-2 border-black text-white font-bold text-[18px] bg-[#479DFF]"
                  >
                    See Assessment Result
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${courseName}`)}
                    className="flex-1 py-3 rounded-md border-2 border-black text-white font-bold text-[18px] bg-[#6B708D]"
                  >
                    Return and Review Lessons
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : shouldShowQuestions ? (
          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-10 max-w-[1000px] w-full">
            <h2 className="text-[30px] font-bold mb-8 text-center">
              Q{currentQuestion + 1}: {questions[currentQuestion]?.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
              {questions[currentQuestion]?.options?.map((option, index) => {
                const selected = selectedAnswers[currentQuestion];
                const isSelected = selected === option;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`flex flex-col items-center justify-center px-6 py-6 rounded-lg text-white font-bold text-[20px] 
                      ${isSelected ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600 transition w-full sm:w-auto min-w-[250px]`}
                  >
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal for Assessment Details */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={closeResultsModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Post-Assessment Results - {formattedTitle}</h2>

            {loadingModal && <p>Loading assessment details...</p>}
            {modalError && <p className="text-red-600">Error: {modalError}</p>}

            {!loadingModal && !modalError && modalQuestions.length === 0 && (
              <p>No questions found for this assessment.</p>
            )}

            {!loadingModal && !modalError && modalQuestions.length > 0 && (
              <div>
                {modalQuestions.map((q) => {
                  const userResp = modalResponses.find(r => r.question_id === q.id);
                  return (
                    <div key={q.id} className="mb-4 border-b border-gray-300 pb-2">
                      <p className="font-semibold">{q.text}</p>
                      <ul className="list-disc list-inside">
                        {q.choices.map((choice, idx) => {
                          const isCorrectAnswer = choice === q.correct_answer;
                          const isUserChoice = userResp && choice === userResp.selected_choice;
                          return (
                            <li
                              key={idx}
                              className={`${isCorrectAnswer ? "text-green-600 font-bold" : ""} ${isUserChoice ? "underline" : ""}`}
                            >
                              {choice}
                              {isCorrectAnswer && " ✅"}
                              {isUserChoice && " (Your answer)"}
                            </li>
                          );
                        })}
                      </ul>
                      <p className="text-sm text-gray-600 mt-1">
                        {userResp?.selected_choice ? (
                          <span>
                            Your answer was: <span className={userResp.is_correct ? "text-green-600" : "text-red-600"}>
                              {userResp.is_correct ? "Correct" : "Incorrect"}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-500">No answer recorded</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAssessment;