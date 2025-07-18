import React from "react";
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";

const AchievementsSection = () => {
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

  return (
    <div className="text-[#4C5173]">
      <h1 className="text-left text-[40px] font-bold mb-5">MILESTONES</h1>
      <div className="flex flex-col gap-5">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className={`relative flex items-center bg-[#BFC4D7] text-black p-[50px] rounded-[30px] transition duration-300 overflow-hidden ${
              achievement.status === "Achievement Locked" ? "opacity-90" : ""
            }`}
          >
            {/* Overlay for Locked */}
            {achievement.status === "Achievement Locked" && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/75  z-[1] rounded-[30px]" />
            )}

            {/* Left Side: Image */}
            <div className="w-[120px] flex justify-center items-center z-[0]">
              <img
                src={achievement.image}
                alt={`${achievement.title} Icon`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Separator */}
            <div className="w-[3px] h-full bg-[#333] mx-5 z-[2]" />

            {/* Right Side */}
            <div className="flex-1 z-[2]">
              <h2 className="text-[45px] font-bold">{achievement.title}</h2>
              <p className="text-[20px] ml-[15px] mb-2">{achievement.description}</p>
              <span
                className={`block text-right font-bold text-[20px] ${
                  achievement.status === "Achievement Get!" ? "text-green-600" : "text-red-700"
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
