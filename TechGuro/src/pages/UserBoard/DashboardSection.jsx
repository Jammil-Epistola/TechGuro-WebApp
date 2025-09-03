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
  const [carouselIndex, setCarouselIndex] = useState(0);
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

  // Fetch course progress and assessments when user changes
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/progress/${user.user_id}`
        );
        const data = await response.json();

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
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      }
    };

    const fetchAssessments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/assessment/${user.user_id}`);
        const data = await res.json();
        setAssessments(data);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        setAssessments([]);
      }
    };

    if (user?.user_id) {
      fetchProgress();
      fetchAssessments();
    }
  }, [user]);

  const getCourseName = (courseId) => {
    const index = courseId - 1;
    return courses[index] || "Unknown Course";
  };

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? 3 : prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === 3 ? 0 : prev + 1));
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
  const totalQuestions = 15; // default fallback
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

  // Dynamic units instead of hardcoded 18
  const totalUnits = Object.values(courseLessonCounts).reduce((a, b) => a + b, 0);
  const completedUnits = Math.round((overallProgress / 100) * totalUnits);

  const carouselContent = [
    <div className="w-full text-center" key="score-improvement">
      <h4 className="text-lg font-semibold mb-2">Score Improvement</h4>
      <Bar data={barData} options={barOptions} className="mx-auto max-w-xs" />
    </div>,
    <div className="w-full text-center" key="lessons-completed">
      <h4 className="text-lg font-semibold mb-2">Lessons Completed</h4>
      <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-2">
        <div className="bg-[#4C5173] h-full" style={{ width: `${overallProgress}%` }}></div>
      </div>
      <p>{overallProgress}% of lessons completed</p>
    </div>,
    <div className="w-full text-center" key="time-spent">
      <h4 className="text-lg font-semibold mb-2">Time Spent Learning</h4>
      <div className="w-32 h-32 mx-auto">
        <Doughnut data={donutData} />
      </div>
      <p className="mt-2">{Math.round(overallProgress / 10)} hrs spent</p>
    </div>,
    <div className="w-full text-center" key="units-completed">
      <h4 className="text-lg font-semibold mb-2">Units Completed</h4>
      <p className="text-xl font-bold">{completedUnits} / {totalUnits} Units</p>
    </div>
  ];

  // Modal functions
  const openResultsModal = async () => {
    setShowModal(true);
    setLoadingModal(true);
    setModalError(null);

    try {
      const courseId = courses.indexOf(selectedCourse) + 1;
      const assessmentType = selectedAssessment.toLowerCase();

      const questionsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/assessment/questions/${courseId}?assessment_type=${assessmentType}`
      );
      if (!questionsRes.ok) throw new Error("Failed to fetch questions");
      const questions = await questionsRes.json();

      const assessmentResult = assessments.find(
        a => a.course_id === courseId && a.assessment_type === assessmentType
      );
      if (!assessmentResult) {
        throw new Error("No assessment result found");
      }

      const responsesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/assessment/responses/${assessmentResult.id}`
      );
      if (!responsesRes.ok) throw new Error("Responses not available yet");
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

  const closeResultsModal = () => {
    setShowModal(false);
    setModalQuestions([]);
    setModalResponses([]);
    setModalError(null);
  };

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
            <img
              src={placeholderimg}
              alt="Milestone"
              className="w-20 h-20 rounded-full border border-black mb-2"
            />
            <p className="text-[18px] font-semibold">Welcome to TechGuro</p>
            <p className="text-sm text-gray-600">Click to view achievements</p>
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
                  ? `Post-Assessment: ${Math.round(postAssessment.score)}/${postAssessment.total || totalQuestions}l}`
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

        {/* Row with TechGuro Progression and Learning Growth side by side */}
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

          {/* Learning Growth Carousel */}
          <div className="flex-1 border border-black rounded-md p-4 relative flex flex-col items-center justify-center w-[444.5px] h-[277px]">
            <h3 className="font-semibold text-lg mb-4">Learning Growth</h3>
            <div className="w-full h-full flex items-center justify-center">
              {carouselContent[carouselIndex]}
            </div>

            {/* Carousel Arrow Buttons - centered vertically and larger */}
            <button onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#4C5173] font-bold text-3xl px-2 py-1 rounded hover:bg-gray-200">
              &lt;
            </button>
            <button onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#4C5173] font-bold text-3xl px-2 py-1 rounded hover:bg-gray-200">
              &gt;
            </button>
          </div>
        </div>

        {/* Course Progression below */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            {modalError && <p className="text-red-600">Error: {modalError}</p>}

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
