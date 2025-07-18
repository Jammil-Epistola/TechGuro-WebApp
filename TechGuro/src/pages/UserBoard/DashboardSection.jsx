import React, { useState, useEffect } from "react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const DashboardSection = () => {
  const [selectedCourse, setSelectedCourse] = useState("Computer Basics");
  const [selectedAssessment, setSelectedAssessment] = useState("Pre-Assessment");
  const [recommended, setRecommended] = useState([]);

  const courses = [
    "Computer Basics",
    "File & Document Handling",
    "Office Tools & Typing Essentials",
    "Internet Safety",
    "Digital Communication",
    "Intro to Online Selling"
  ];

  const unaccessedCourses = [
    "File & Document Handling",
    "Office Tools & Typing Essentials",
    "Internet Safety",
    "Digital Communication",
    "Intro to Online Selling",
    "Creative Tools (Photos & Design)"
  ];

  const hasTakenAssessment = false; // placeholder logic

  useEffect(() => {
    const shuffled = [...unaccessedCourses].sort(() => 0.5 - Math.random());
    setRecommended(shuffled.slice(0, 3));
  }, []);

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
            <h2 className="text-[24px] font-bold">TestUser</h2>
            <p className="text-[18px]">testuser@gmail.com</p>
            <p className="text-[18px]">I am a Test User I Test Things :)</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <button className="border border-black px-4 py-2 rounded-md font-semibold text-[16px] hover:bg-gray-200">
            Edit Profile
          </button>
          <div className="flex items-center gap-6 text-[18px] font-semibold">
            <div className="text-yellow-400">🏅 0</div>
            <div className="text-cyan-400">🏅 0</div>
            <div className="text-yellow-800">🏅 0</div>
          </div>
        </div>
      </div>

      {/* User Dashboard Label */}
      <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">USER DASHBOARD</h1>

      {/* Learning Mastery & Assessment Scores */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Learning Mastery */}
        <div className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[180px]">
          <h2 className="text-[20px] font-bold mb-4">Learning Mastery:</h2>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-black px-4 py-2 rounded text-[18px] mb-4"
          >
            {courses.map((course) => (
              <option key={course}>{course}</option>
            ))}
          </select>
          <p className="text-[18px] mb-2">0/3 Units Completed</p>
          <div className="w-full h-4 border border-black rounded-full overflow-hidden">
            <div className="bg-[#6B708D] h-full w-[0%]"></div>
          </div>
        </div>

        {/* Assessment Scores */}
        <div className="flex-1 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6 min-h-[180px]">
          <h2 className="text-[20px] font-bold mb-4">Assessment Scores:</h2>
          <div className="mb-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border border-black px-4 py-2 rounded text-[18px] mb-3"
            >
              {courses.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full border border-black px-4 py-2 rounded text-[18px]"
            >
              <option>Pre-Assessment</option>
              <option>Post-Assessment</option>
            </select>
          </div>
          <p className="text-[18px] text-center mb-3">
            {hasTakenAssessment
              ? `You have taken ${selectedAssessment}`
              : `You have not taken ${selectedAssessment}`}
          </p>
          <button
            disabled={!hasTakenAssessment}
            className={`w-full py-2 rounded-md border-2 border-black text-white font-bold text-[18px] ${hasTakenAssessment ? "bg-[#479DFF]" : "bg-[#8E8E8E]"
              }`}
          >
            See Results
          </button>
        </div>
      </div>

      {/* Your Performance Section */}
      <div className="mt-8 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6">
        <h2 className="text-[20px] font-bold mb-4">Your Performance:</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* TechGuro Progression */}
          <div className="flex flex-col items-center justify-center border border-black rounded-md p-4">
            <h3 className="font-semibold text-lg mb-2">TechGuro Progression:</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#27ae60"
                  strokeWidth="3"
                  strokeDasharray="25, 100"
                />
              </svg>
              <div className="absolute text-xl font-bold text-[#27ae60]">25%</div>
            </div>
            <p className="text-center text-[#4C5173] mt-2">TechGuro Progress</p>
          </div>

          {/* Learning Growth */}
          <div className="flex flex-col items-center justify-center border border-black rounded-md p-4">
            <h3 className="font-semibold text-lg mb-2">Learning Growth</h3>
            <p className="text-center text-sm text-gray-700">
              Keep going! Your skills are growing every lesson.
            </p>
          </div>
        </div>

        {/* Course Progression */}
        <div className="border border-black rounded-md p-4">
          <h3 className="font-semibold text-lg mb-4 text-center">Course Progression</h3>
          <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
            {courses.map((course, index) => (
              <div key={index} className="bg-white border border-gray-400 rounded-lg p-3">
                <h4 className="font-semibold text-[18px] mb-2">{course}</h4>
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                  <div className="bg-[#6B708D] h-full w-[0%]"></div>
                </div>
                <p className="text-sm text-right text-gray-700 mt-1">0% Complete</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="mt-10 bg-[#F9F8FE] border-[1.5px] border-[#6B708D] rounded-lg p-6">
        <h2 className="text-[20px] font-bold mb-4">Recommended Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((course, index) => (
            <div
              key={index}
              className="border border-black rounded-lg p-4 flex flex-col items-center justify-center bg-[#F1F1FA] shadow-md"
            >
              <img
                src={placeholderimg}
                alt={course}
                className="w-28 h-28 object-contain mb-4"
              />
              <p className="text-center text-[18px] font-semibold">{course}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
