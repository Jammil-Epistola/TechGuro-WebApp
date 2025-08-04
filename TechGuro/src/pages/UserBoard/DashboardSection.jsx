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
    "Computer Basics": 15,
    "File & Document Handling": 15,
    "Office Tools & Typing Essentials": 15,
    "Internet Safety": 15,
    "Digital Communication": 15,
    "Intro to Online Selling": 15
  };

  const unaccessedCourses = [
    "File & Document Handling",
    "Office Tools & Typing Essentials",
    "Internet Safety",
    "Digital Communication",
    "Intro to Online Selling",
    "Creative Tools (Photos & Design)"
  ];

  const hasTakenAssessment = false; 

  useEffect(() => {
    const shuffled = [...unaccessedCourses].sort(() => 0.5 - Math.random());
    setRecommended(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`http://localhost:8000/progress/${user.user_id}`);
        const data = await response.json();

        const completedPerCourse = {};
        data.forEach(entry => {
          if (entry.completed) {
            const courseName = getCourseName(entry.course_id);
            console.log("Mapped course_id:", entry.course_id, "to courseName:", courseName);
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
        console.log("Fetched progress data:", data);
        console.log("Completed per course:", completedPerCourse);
        console.log("Progress percents:", progressPercents);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      }
    };

    console.log("User object in DashboardSection:", user);
    if (user?.user_id) {
      fetchProgress();
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

  const barData = {
    labels: ["Pre", "Post"],
    datasets: [{
      label: "Score (%)",
      data: [60, 80],
      backgroundColor: "#4C5173",
    }]
  };

  const barOptions = {
    scales: {
      y: { beginAtZero: true, max: 100 }
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

  const carouselContent = [
    <div className="w-full text-center">
      <h4 className="text-lg font-semibold mb-2">Score Improvement</h4>
      <Bar data={barData} options={barOptions} className="mx-auto max-w-xs" />
    </div>,
    <div className="w-full text-center">
      <h4 className="text-lg font-semibold mb-2">Lessons Completed</h4>
      <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-2">
        <div className="bg-[#4C5173] h-full" style={{ width: `${overallProgress}%` }}></div>
      </div>
      <p>{overallProgress}% of lessons completed</p>
    </div>,
    <div className="w-full text-center">
      <h4 className="text-lg font-semibold mb-2">Time Spent Learning</h4>
      <div className="w-32 h-32 mx-auto">
        <Doughnut data={donutData} />
      </div>
      <p className="mt-2">{Math.round(overallProgress / 10)} hrs spent</p>
    </div>,
    <div className="w-full text-center">
      <h4 className="text-lg font-semibold mb-2">Units Completed</h4>
      <p className="text-xl font-bold">{Math.round(overallProgress / 100 * 18)} / 18 Units</p>
    </div>
  ];

  return (
    <div className="bg-[#DFDFEE] min-h-screen p-6 text-black text-[18px]">
      {/* Profile Card */}
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

      {/* Recent Milestone & Assessment */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Milestone */}
        <div
          className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[180px] cursor-pointer text-center flex flex-col items-center justify-center"
          onClick={() => navigate("/UserDashboard/achievements")}
        >
          <img src={placeholderimg} alt="Milestone" className="w-20 h-20 rounded-full border border-black mb-2" />
          <p className="text-[18px] font-semibold">Welcome to TechGuro</p>
          <p className="text-sm text-gray-600">Click to view achievements</p>
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
            {hasTakenAssessment
              ? `You have taken ${selectedAssessment}`
              : `You have not taken ${selectedAssessment}`}
          </p>
          <button disabled={!hasTakenAssessment}
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
                  <p className="text-sm text-right text-gray-700 mt-1">{percent}% Complete</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="mt-10 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6">
        <h2 className="text-[20px] font-bold mb-4">Recommended Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((course, index) => (
            <div key={index} className="border border-black rounded-lg p-4 flex flex-col items-center bg-[#F1F1FA] shadow-md">
              <img src={placeholderimg} alt={course} className="w-28 h-28 object-contain mb-4" />
              <p className="text-center text-[18px] font-semibold">{course}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
