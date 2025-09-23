// src/components/QuestionCard.jsx - Using simplified useTTS Hook
import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import useTTS from "../hooks/useTTS"; // Import the simplified custom hook

const QuestionCard = ({ question, selectedAnswer, onAnswerChange }) => {
  // Use the simplified TTS hook
  const { isPlaying, speak, isSupported } = useTTS();

  // Simple speak function for questions
  const speakQuestion = () => {
    if (!isSupported) {
      alert('Text-to-Speech is not supported in your browser.');
      return;
    }

    // Use the simple speak function - it toggles play/stop automatically
    speak(question.text);
  };

  // Helper function to get option value for comparison
  const getOptionValue = (option) => {
    if (typeof option === 'object' && option.image) {
      return option.image;
    }
    return option;
  };

  // Helper function to render option content
  const renderOptionContent = (option, index) => {
    if (typeof option === 'object' && option.image) {
      return (
        <img
          src={option.image}
          alt={`Option ${index + 1}`}
          className="w-full h-full object-cover rounded-lg scale-"
        />
      );
    }
    return <span className="text-2xl text-black font-medium">{option}</span>;
  };

  return (
    <div className="bg-white border-4 border-gray-400 w-[1000px] rounded-xl shadow-lg">
      <div className="h-[535px] flex flex-col">
        {/* Question Header with TTS */}
        <div className="p-8 border-b-2 border-gray-200 h-auto min-h-[120px] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black leading-relaxed flex-1">
            Q{question.questionNumber}. {question.text}
          </h2>
          
          {/* TTS Audio Button */}
          {isSupported && (
            <button
              onClick={speakQuestion}
              className={`ml-4 p-3 rounded-full transition-all duration-200 ${
                isPlaying 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600 hover:scale-105'
              }`}
              title={isPlaying ? "I-stop ang pagbasa ng tanong" : "Basahin ang tanong"}
            >
              {isPlaying ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Main Question Image */}
        {question.image && (
          <div className="h-[200px] flex justify-center items-center p-4 border-b-2 border-gray-200">
            <img
              src={question.image}
              alt="Question illustration"
              className="max-h-full max-w-full object-contain border-2 border-gray-300 rounded-lg"
            />
          </div>
        )}

        {/* Options Container */}
        <div className={`flex-1 p-6 flex ${
          question.type === 'image_mcq' 
            ? 'justify-center items-center' 
            : 'flex-col justify-center'
        }`}>
          
          <div className={`w-full h-full ${
            question.type === 'image_mcq' 
              ? 'grid grid-cols-3 gap-6' 
              : 'flex flex-col gap-4'
          }`}>
            {question.options?.map((opt, i) => {
              const optionValue = getOptionValue(opt);
              const isSelected = selectedAnswer === optionValue;
              
              return (
                <label
                  key={i}
                  className={`cursor-pointer transition-all duration-200 ${
                    question.type === 'image_mcq' 
                      ? `relative flex flex-col items-center justify-center rounded-xl border-4 overflow-hidden ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-100 shadow-lg transform scale-105' 
                            : 'border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-102'
                        }`
                      : `flex items-center p-6 rounded-lg border-3 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-100 shadow-md' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}-${question.questionNumber}`}
                    value={optionValue}
                    checked={isSelected}
                    onChange={() => onAnswerChange(question.id, optionValue)}
                    className={`${
                      question.type === 'image_mcq' 
                        ? 'absolute top-3 left-3 w-6 h-6 z-10' 
                        : 'mr-4 w-6 h-6'
                    } accent-blue-600`}
                  />
                  
                  {question.type === 'image_mcq' ? (
                    <div className="w-full h-full min-h-[160px] relative">
                      {renderOptionContent(opt, i)}
                    </div>
                  ) : (
                    renderOptionContent(opt, i)
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;