//AchivementsSection.jsx
import React, { useState } from "react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AchievementsSection = () => {
  const [filter, setFilter] = useState("all");

  const achievements = [
    {
      title: "Welcome to TechGuro",
      description: "Sign in to TechGuro for the first time.",
      status: "Achievement Get!",
      image: placeholderimg,
    },
    {
      title: "First Steps",
      description: "Choose a course and complete the Pre-Assessment.",
      status: "Achievement Get!",
      image: placeholderimg,
    },
    {
      title: "First Lesson",
      description: "Complete your first lesson.",
      status: "Achievement Get!",
      image: placeholderimg,
    },
    {
      title: "Course Champ",
      description: "Complete all lessons and assessments in a course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Pop Quiz Pro",
      description: "Complete your first quiz.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Perfect Score!",
      description: "Get a perfect 100% on any quiz.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Quiz Machine",
      description: "Get 100% on 6 different quizzes.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Practice Makes Perfect",
      description: "Complete 10 practice quizzes.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "On a Roll!",
      description: "Complete your very first course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Computer Basics Master",
      description: "Finish the Computer Basics course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "File Savvy",
      description: "Complete File & Document Handling course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Office Ninja",
      description: "Complete the Microsoft Essentials course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Web Guardian",
      description: "Complete the Internet Safety course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Fix It Pro",
      description: "Complete the Computer Maintenance course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "Creative Whiz",
      description: "Complete the Creative Tools course.",
      status: "Achievement Locked",
      image: placeholderimg,
    },
    {
      title: "TechGuru",
      description: "Complete all TechGuro courses!",
      status: "Achievement Locked",
      image: placeholderimg,
    },
  ];

  // Filter logic
  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.status === "Achievement Get!";
    if (filter === "locked") return achievement.status === "Achievement Locked";
    return true;
  });

  return (
    <div className="bg-[#DFDFEE] p-6 min-h-screen text-[#4C5173]">
      <h1 className="text-[30px] font-bold mb-6">MILESTONES</h1>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md border ${
            filter === "all" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          All Milestones
        </button>
        <button
          onClick={() => setFilter("unlocked")}
          className={`px-4 py-2 rounded-md border ${
            filter === "unlocked" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          Unlocked Milestones
        </button>
        <button
          onClick={() => setFilter("locked")}
          className={`px-4 py-2 rounded-md border ${
            filter === "locked" ? "bg-[#BFC4D7] font-bold" : "bg-white"
          }`}
        >
          Locked Milestones
        </button>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAchievements.map((achievement, index) => (
          <div
            key={index}
            className="relative flex items-center bg-[#F9F8FE] text-black p-6 rounded-2xl overflow-hidden border border-[#6B708D]"
          >
            {/* Overlay for Locked */}
            {achievement.status === "Achievement Locked" && (
              <div className="absolute inset-0 bg-black opacity-50 z-10 rounded-2xl" />
            )}

            {/* Left Image */}
            <div className="w-[80px] h-[80px] mr-4 z-20 flex items-center justify-center">
              <img
                src={achievement.image}
                alt={achievement.title}
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            {/* Details */}
            <div className="flex-1 z-20">
              <h2 className="text-[22px] font-bold">{achievement.title}</h2>
              <p className="text-[16px] text-gray-800">{achievement.description}</p>
              <span
                className={`block text-right font-bold text-[16px] mt-2 ${
                  achievement.status === "Achievement Get!"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {achievement.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsSection;
