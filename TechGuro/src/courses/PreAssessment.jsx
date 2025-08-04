import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseNavbar from './courseNavbar.jsx';
import Teki1 from "../assets/Teki 1.png";

const PreAssessment = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const [dialogueStep, setDialogueStep] = useState(0);
  const [startTest, setStartTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = questionsData[courseName] || [];

  const handleDialogueNext = () => {
    if (dialogueStep === 1) {
      setStartTest(true);
    } else {
      setDialogueStep(dialogueStep + 1);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: selectedOption
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(selectedAnswers).length === questions.length - 1) {
      handleSubmit();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    Object.keys(selectedAnswers).forEach(index => {
      if (selectedAnswers[index] === questions[index].answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="text-center py-4">
        <h1 className="text-[28px] font-bold">{formattedTitle.toUpperCase()}</h1>
        <h2 className="text-[24px] font-semibold">Pre-Assessment Test</h2>
      </div>

      <div className="flex flex-col justify-center items-center p-6">
        {!startTest ? (
          <div className="bg-white border border-black rounded-lg p-6 max-w-[800px] w-full relative">
            {/* Teki Image - Large and Positioned */}
            <img 
              src={Teki1} 
              alt="Teki" 
              className="w-[140px] h-[140px] absolute top-[-70px] right-[-70px]" 
            />

            {/* Header Left-Aligned */}
            <h2 className="text-[22px] font-bold mb-4 text-left">Teki</h2>

            {/* Dialogue Text Justified */}
            <p className="text-[18px] text-justify mb-4">
              {dialogueStep === 0 && (
                <>
                  Before you begin, please answer the following multiple-choice questions honestly.
                  This questionnaire is designed to assess your current knowledge and skills for the chosen course.
                  Your responses will help us better understand your learning needs and recommend lessons for you.
                </>
              )}
              {dialogueStep === 1 && (
                <>
                  There is no time limit, so take your time and choose the answers that best reflect what you currently know.
                  Good luck!
                </>
              )}
            </p>

            {/* Conditional Button Placement */}
            {dialogueStep === 1 ? (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDialogueNext}
                  className="px-6 py-3 bg-blue-500 text-white text-[16px] rounded hover:bg-blue-600 transition"
                >
                  Start Pre-Assessment
                </button>
              </div>
            ) : (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleDialogueNext}
                  className="px-6 py-3 bg-blue-500 text-white text-[16px] rounded hover:bg-blue-600 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : score !== null ? (
          <div className="bg-white border border-black rounded-lg p-6 max-w-[800px] w-full text-center">
            <h2 className="text-[28px] font-bold mb-4">Assessment Complete!</h2>
            <p className="text-[22px] font-semibold mb-4">Your Score: {score}/{questions.length}</p>
            <p className="text-[18px] italic mb-6 text-[#4c5173]">Preparing lessons based on results...</p>
            <button
              onClick={() => navigate(`/courses/${courseName}`)}
              className="px-6 py-3 bg-[#4c5173] text-white rounded text-[16px] hover:bg-[#3b3f65] transition"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 max-w-[900px] w-full">
            <h2 className="text-[20px] font-bold mb-4">Please Answer the Following Questions:</h2>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Question Box */}
              <div className="flex-1 bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-4">
                <h3 className="text-[20px] font-semibold">
                  Q{currentQuestion + 1}. {questions[currentQuestion]?.question || "No question available"}
                </h3>
              </div>

              {/* Image (if any) */}
              <div className="w-full lg:w-[250px] h-[200px] border border-black rounded-lg flex justify-center items-center">
                {questions[currentQuestion]?.image ? (
                  <img
                    src={questions[currentQuestion].image}
                    alt={`Question ${currentQuestion + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400 text-[16px]">No Image</span>
                )}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {questions[currentQuestion]?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full py-3 px-4 rounded-lg text-white font-bold text-[16px] 
                    ${selectedAnswers[currentQuestion] === option ? "bg-blue-700" : "bg-blue-500"} 
                    hover:bg-blue-600 transition`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreAssessment;
