import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
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
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardSection = () => {
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState("Computer Basics");
  const [selectedAssessment, setSelectedAssessment] = useState("Pre-Assessment");
  const [recommended, setRecommended] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Store all assessments for user
  const [assessments, setAssessments] = useState([]);
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

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const navigate = useNavigate();

  const courses = [
    "Computer Basics",
    "File & Document Handling",
    "Office Tools & Typing Essentials",
    "Internet Safety",
    "Digital Communication",
    "Intro to Online Selling"
  ];

  const courseLessonCounts = {
    "Computer Basics": 8,
    "File & Document Handling": 8,
    "Office Tools & Typing Essentials": 8,
    "Internet Safety": 8,
    "Digital Communication": 8,
    "Intro to Online Selling": 8
  };

  const unaccessedCourses = [
    "File & Document Handling",
    "Office Tools & Typing Essentials",
    "Internet Safety",
    "Digital Communication",
    "Intro to Online Selling",
    "Creative Tools (Photos & Design)"
  ];

  useEffect(() => {
    const shuffled = [...unaccessedCourses].sort(() => 0.5 - Math.random());
    setRecommended(shuffled.slice(0, 3));
  }, []);

  // Centralized data fetching function
  const fetchAllDashboardData = async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const baseURL = import.meta.env.VITE_API_URL;

      // Execute all fetch operations in parallel
      const [progressResponse, assessmentsResponse, milestonesResponse] = await Promise.all([
        fetch(`${baseURL}/progress/${user.user_id}`),
        fetch(`${baseURL}/assessment/${user.user_id}`),
        fetch(`${baseURL}/milestones/earned/${user.user_id}`)
      ]);

      // Check if all responses are successful
      const responses = [
        { name: 'progress', response: progressResponse },
        { name: 'assessments', response: assessmentsResponse },
        { name: 'milestones', response: milestonesResponse }
      ];

      const failedRequests = responses.filter(r => !r.response.ok);
      if (failedRequests.length > 0) {
        const failedNames = failedRequests.map(r => r.name).join(', ');
        throw new Error(`Failed to fetch: ${failedNames}`);
      }

      // Parse all responses in parallel
      const [progressData, assessmentsData, milestonesData] = await Promise.all([
        progressResponse.json(),
        assessmentsResponse.json(),
        milestonesResponse.json()
      ]);

      // Process progress data
      processProgressData(progressData);

      // Set assessments data
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);

      // Process milestones data
      processMilestonesData(milestonesData);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setFetchError(error.message);

      // Set default values on error
      setCourseProgress({});
      setOverallProgress(0);
      setAssessments([]);
      setMilestones([]);
      setMilestonesError(error.message);
    } finally {
      setIsLoading(false);
      setMilestonesLoading(false);
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
    // Sort milestones by date_earned if available
    const sorted = [...data].sort((a, b) =>
      new Date(b.date_earned) - new Date(a.date_earned)
    );
    setMilestones(sorted);
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
  const totalQuestions = 20; // default fallback
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
        // Calculate average of all assessments for this course
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

      // 1) fetch user assessments summary
      const assessRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/${user.user_id}`);
      if (!assessRes.ok) throw new Error(`Failed to fetch assessments (${assessRes.status})`);
      const assessAll = await assessRes.json();

      // filter by course & type and pick latest by date (or id if date missing)
      const matches = (assessAll || []).filter(a => a.course_id === courseId && (a.assessment_type === assessmentType || a.assessment_type === assessmentType[0] /* tolerate 'pre'/'post' vs 'p' */));
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

      // 2) fetch questions for this course/type
      const questionsRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/questions/${courseId}?assessment_type=${assessmentType}`);
      if (!questionsRes.ok) throw new Error("Failed to fetch questions for this assessment");
      const questions = await questionsRes.json();

      // 3) fetch responses for the latest assessment
      const responsesRes = await fetch(`${import.meta.env.VITE_API_URL}/assessment/responses/${latest.id}`);
      if (!responsesRes.ok) {
        // if responses not ready, show questions but inform user
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4C5173] mx-auto mb-4"></div>
          <p className="text-[20px] font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px] flex items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <h2 className="text-[20px] font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{fetchError}</p>
          <button
            onClick={fetchAllDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px]">
      {/* Profile Section */}
      <div className="flex items-center justify-between bg-[#F9F8FE] border-[1.5px] border-[#6B708D] p-6 rounded-lg mb-8">
        <div className="flex gap-6 items-center">
          <img
            src={placeholderimg}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover border border-black"
          />
          <div>
            <h2 className="text-[24px] font-bold">{user?.username || "User"}</h2>
            <p className="text-[18px]">{user?.email || "No Email"}</p>
            <p className="text-[18px]">{user?.bio || "Welcome to TechGuro!"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <button className="border border-black px-4 py-2 rounded-md font-semibold text-[16px] hover:bg-gray-200">
            Edit Profile
          </button>
          <div className="text-[18px] font-semibold flex items-center gap-2">
            <span className="text-yellow-500 text-[24px]">🏅</span>
            <span>{user?.milestone_awarded ? 1 : 0}</span>
          </div>
        </div>
      </div>

      <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">USER DASHBOARD</h1>

      {/* Recent Achievements + Assessment Scores */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Milestone */}
        <div
          className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 cursor-pointer hover:bg-[#f0f0ff] flex flex-col"
          onClick={() => navigate("/UserDashboard/achievements")}
        >
          <h2 className="text-[20px] font-bold mb-4 text-left">Recent Milestones:</h2>

          <div className="flex flex-col items-center justify-center flex-1">
            {milestonesLoading ? (
              <p>Loading milestones...</p>
            ) : milestonesError ? (
              <p className="text-red-600">Error loading milestones</p>
            ) : milestones.length === 0 ? (
              <p className="text-[18px] font-semibold">No Milestones Achieved at the moment</p>
            ) : (
              <>
                <img
                  src={milestones[0]?.icon_url || placeholderimg}
                  alt={milestones[0]?.title || "Milestone"}
                  className="w-20 h-20 rounded-full border border-black mb-2"
                  onError={(e) => {
                    e.target.src = placeholderimg;
                  }}
                />
                <p className="text-[18px] font-semibold">{milestones[0].title}</p>
                <p className="text-sm text-gray-600">{milestones[0].description || "Click to view achievements"}</p>
              </>
            )}
          </div>
        </div>
        {/* Assessment Scores */}
        <div className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[180px]">
          <h2 className="text-[20px] font-bold mb-4">Assessment Scores:</h2>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3">
            {courses.map((course) => <option key={course}>{course}</option>)}
          </select>
          <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}
            className="w-full border border-black px-4 py-2 rounded text-[18px]">
            <option>Pre-Assessment</option>
            <option>Post-Assessment</option>
          </select>
          <p className="text-[18px] text-center mt-3 mb-2">
            {assessments.length === 0 ? "Loading scores..." : (
              selectedAssessment === "Pre-Assessment" && preAssessment
                ? `Pre-Assessment: ${Math.round(preAssessment.score)}/${preAssessment.total || totalQuestions}`
                : selectedAssessment === "Post-Assessment" && postAssessment
                  ? `Post-Assessment: ${Math.round(postAssessment.score)}/${postAssessment.total || totalQuestions}`
                  : `You have not taken ${selectedAssessment}`
            )}
          </p>
          <button
            disabled={!hasTakenAssessment}
            onClick={openResultsModal}
            className={`w-full py-2 rounded-md border-2 border-black text-white font-bold text-[18px] 
              ${hasTakenAssessment ? "bg-[#479DFF]" : "bg-[#8E8E8E]"}`}>
            See Results
          </button>
        </div>
      </div>

      {/* Performance Section */}
      <div className="mt-8 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6">
        <h2 className="text-[20px] font-bold mb-4">Your Performance:</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* TechGuro Progression */}
          <div className="flex-1 border border-black rounded-md p-4 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-lg mb-2">TechGuro Progression:</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#ccc" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#27ae60" strokeWidth="3"
                  strokeDasharray={`${isNaN(overallProgress) ? 0 : overallProgress}, 100`} />
              </svg>
              <div className="absolute text-xl font-bold text-[#27ae60]">
                {isNaN(overallProgress) ? 0 : overallProgress}%
              </div>
            </div>
            <p className="text-center text-[#4C5173] mt-2">TechGuro Progress</p>
          </div>

          {/* Learning Growth*/}
          <div className="flex-1 border border-black rounded-md p-4 flex flex-col">
            <h3 className="font-semibold text-lg mb-4 text-center">Learning Growth</h3>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Score Improvement*/}
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
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
              </div>

              {/* Average Assessment Score*/}
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3 text-center">Average Assessment Score</h4>
                <div className="w-full max-w-[180px] h-[140px]">
                  <Doughnut data={averageDonutData} options={averageDonutOptions} />
                </div>
                <div className="mt-2 text-sm text-center">
                  {hasAverageData ? (
                    <p className="text-gray-600">
                      Overall Performance: {Math.round(Object.values(averageScores).reduce((sum, course) => sum + course.percentage, 0) / Object.keys(averageScores).length)}%
                    </p>
                  ) : (
                    <p className="text-gray-500">Take assessments to see your performance</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progression*/}
        <div className="border border-black rounded-md p-4">
          <h3 className="font-semibold text-lg mb-4 text-center">Course Progression</h3>
          <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
            {courses.map((course, index) => {
              const percent = courseProgress[course] || 0;
              return (
                <div key={index} className="bg-white border border-gray-400 rounded-lg p-3">
                  <h4 className="font-semibold text-[18px] mb-2">{course}</h4>
                  <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                    <div className="bg-[#6B708D] h-full" style={{ width: `${percent}%` }}></div>
                  </div>
                  <p className="text-center mt-1 text-sm">{percent}% completed</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 border border-black rounded-md p-4 bg-white">
        <h2 className="text-[20px] font-bold mb-3 text-center">Courses to Explore</h2>
        <div className="grid grid-cols-3 gap-4">
          {recommended.map((course, index) => (
            <div key={index} className="border border-gray-400 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100">
              {course}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Assessment Details */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={closeResultsModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">
              {selectedAssessment} Results - {selectedCourse}
            </h2>

            {loadingModal && <p>Loading assessment details...</p>}

            {!loadingModal && modalError && (
              <div className="text-red-600 mb-4">
                <p>{modalError}</p>
              </div>
            )}

            {!loadingModal && !modalError && modalQuestions.length === 0 && (
              <p>No questions found for this assessment.</p>
            )}

            {!loadingModal && !modalError && modalQuestions.length > 0 && (
              <div>
                {modalQuestions.map((q) => {
                  // safely get choices (either array or JSON string)
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

                  return (
                    <div key={q.id} className="mb-4 border-b border-gray-300 pb-2">
                      <p className="font-semibold">{q.text || q.question || q.question_text}</p>
                      <ul className="list-disc list-inside">
                        {choices.map((choice, idx) => {
                          const isCorrectAnswer = choice === (q.correct_answer || q.answer || q.correct);
                          const isUserChoice = userResp && (choice === (userResp.selected_choice || userResp.user_answer));
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
                        {userResp?.selected_choice || userResp?.user_answer ? (
                          <span>
                            Your answer was:{" "}
                            <span className={userResp.is_correct ? "text-green-600" : "text-red-600"}>
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

export default DashboardSection;