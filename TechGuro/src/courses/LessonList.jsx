import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseNavbar from './courseNavbar';
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

const LessonList = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const [activeUnit, setActiveUnit] = useState(1);

  const handleStartLesson = (lessonNumber) => {
    navigate(`/courses/${courseName}/lesson`, {
      state: {
        lessonNumber: lessonNumber,
        showQuiz: lessonNumber === 'quiz'
      }
    });
  };

  const units = [
    {
      number: 1,
      title: 'Introduction to Computers',
      lessons: [
        {
          number: 1,
          title: 'What is a Computer',
          description: 'Learn about the basic concepts of computers, including hardware and software components, and understand their role in our daily lives.'
        },
        {
          number: 2,
          title: 'Types of Computers',
          description: 'Explore different types of computers, from desktops to laptops, tablets, and smartphones. Understand their unique features and use cases.'
        },
        {
          number: 3,
          title: 'Computer Parts Overview',
          description: 'Discover the essential components that make up a computer system, including the CPU, memory, storage, and various input/output devices.'
        },
        {
          number: 4,
          title: 'Peripherals and Their Uses',
          description: 'Learn about different peripheral devices that enhance computer functionality, from keyboards and mice to printers and external storage.'
        },
        {
          number: 5,
          title: 'How to Turn a Computer On and Off Properly',
          description: 'Master the correct procedures for starting up and shutting down a computer to ensure system health and prevent data loss.'
        },
        {
          number: 6,
          title: 'Basic Safety & Handling Tips',
          description: 'Understand essential safety practices and proper handling techniques to maintain your computer and ensure safe operation.'
        },
        {
          number: 'quiz',
          title: 'Quiz 1',
          description: 'Test your knowledge of computer basics with this comprehensive quiz covering all topics from Unit 1.'
        }
      ]
    },
    {
      number: 2,
      title: 'Navigating the Desktop & Mouse/Keyboard Basics',
      lessons: []
    }
  ];

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="min-h-screen bg-[#DFDFEE] text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex w-full">
        {/* Sidebar - Old style restored with updated colors */}
        <div className="w-[300px] bg-[#BFC4D7] p-4 sticky top-0 h-screen overflow-y-auto border-r border-gray-400">
          <div className="flex items-center gap-4 mb-6">
            <img src={placeholderimg} alt="Course Icon" className="w-16 h-16 rounded-full border border-black" />
            <h2 className="text-[20px] font-bold">{formattedTitle}</h2>
          </div>

          {units.map(unit => (
            <div
              key={unit.number}
              onClick={() => setActiveUnit(unit.number)}
              className={`p-4 mb-2 rounded cursor-pointer transition 
                ${activeUnit === unit.number ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
            >
              <div className="font-bold text-[16px] mb-1">UNIT {unit.number}:</div>
              <div className="text-[15px]">{unit.title}</div>
            </div>
          ))}
        </div>

        {/* Lessons Section */}
        <div className="flex-1 p-8">
          <h1 className="text-[24px] font-bold text-[#4C5173] mb-6">
            UNIT {activeUnit}: {units[activeUnit - 1].title}
          </h1>

          <div className="flex flex-col gap-5">
            {units[activeUnit - 1].lessons.length === 0 ? (
              <p className="text-[18px] italic text-gray-600">No lessons available yet for this unit.</p>
            ) : (
              units[activeUnit - 1].lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-[20px] font-bold mb-2">
                      {lesson.number === 'quiz' ? 'Quiz 1' : `Lesson ${lesson.number}: ${lesson.title}`}
                    </h2>
                    <p className="text-[16px]">{lesson.description}</p>
                  </div>
                  <button
                    onClick={() => handleStartLesson(lesson.number)}
                    className={`px-6 py-2 rounded font-semibold text-[16px] 
                      ${lesson.number === 1 || lesson.number === 'quiz'
                        ? 'bg-[#B6C44D] text-black hover:bg-[#a5b83d]'
                        : 'bg-gray-400 text-white cursor-not-allowed'}`}
                    disabled={!(lesson.number === 1 || lesson.number === 'quiz')}
                  >
                    Start
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonList;
