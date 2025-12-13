// src/components/QuestionCard.jsx
import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import useTTS from "../../hooks/useTTS";

const QuestionCard = ({ question, selectedAnswer, onAnswerChange, assessmentType }) => {
  const { isPlaying, speak, isSupported } = useTTS();

  const speakQuestion = () => {
    if (!isSupported) {
      alert("Text-to-Speech is not supported in your browser.");
      return;
    }
    speak(question.text);
  };

  const getOptionValue = (option) => {
    if (typeof option === "object" && option.image) {
      return option.image;
    }
    return option;
  };

  const renderOptionContent = (option, index) => {
    if (typeof option === "object" && option.image) {
      return (
        <img
          src={option.image}
          alt={`Option ${index + 1}`}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return (
      <span className="text-base md:text-2xl text-black font-medium text-center">
        {option}
      </span>
    );
  };

  const parseTrueFalseStatements = (text) => {
    const statements = [];
    const lines = text.split(/\n|\.(?=\s*Statement|\s*\d+\.)/);

    for (let line of lines) {
      line = line.trim();
      if (
        line.includes("Statement 1:") ||
        line.includes("1.") ||
        line.includes("First:")
      ) {
        statements.push(
          line.replace(/^(Statement\s*1:|1\.|First:)\s*/i, "").trim()
        );
      } else if (
        line.includes("Statement 2:") ||
        line.includes("2.") ||
        line.includes("Second:")
      ) {
        statements.push(
          line.replace(/^(Statement\s*2:|2\.|Second:)\s*/i, "").trim()
        );
      } else if (statements.length === 0 && line.length > 0) {
        const parts = line
          .split(/\s+and\s+|\s*,\s*|\s*;\s*/)
          .filter((part) => part.length > 10);
        if (parts.length >= 2) {
          statements.push(...parts.slice(0, 2));
        } else if (line.length > 0) {
          statements.push(line);
        }
      }
    }

    if (statements.length < 2 && text.length > 0) {
      const sentences = text
        .split(/\.\s+(?=[A-Z])/)
        .filter((s) => s.trim().length > 0);
      if (sentences.length >= 2) {
        return sentences
          .slice(0, 2)
          .map((s, i) => (s.endsWith(".") ? s : s + "."));
      } else {
        const mid = Math.floor(text.length / 2);
        const breakPoint = text.indexOf(" ", mid);
        if (breakPoint > 0) {
          return [
            text.substring(0, breakPoint).trim(),
            text.substring(breakPoint).trim(),
          ];
        }
      }
    }

    return statements.slice(0, 2);
  };

  const isTrueFalseQuestion =
    question.type === "true_false" ||
    (question.options &&
      question.options.some(
        (opt) =>
          typeof opt === "string" &&
          (opt.toLowerCase().includes("true") ||
            opt.toLowerCase().includes("false"))
      ));

  // Layout depends on assessmentType
  const shouldUseGrid =
    question.type === "image_mcq" ||
    (question.type === "text_mcq" &&
      assessmentType === "post") || // only post makes text_mcq grid
    (isTrueFalseQuestion && assessmentType === "post"); // only post splits true/false

  return (
    <div className="bg-white border-2 md:border-4 border-gray-400 w-full md:w-[1000px] rounded-xl shadow-lg">
      <div className="min-h-[400px] md:h-[535px] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-8 border-b-2 border-gray-200 min-h-[80px] md:min-h-[120px] flex items-center justify-between">
          <div className="flex-1">
            {isTrueFalseQuestion && assessmentType === "post" ? (
              // Post-Assessment
              <div className="flex items-start gap-2 md:gap-4">
                <h2 className="text-lg md:text-2xl font-bold text-black leading-relaxed flex-shrink-0">
                  Q{question.questionNumber}.
                </h2>
                <div className="flex-1 space-y-2 md:space-y-3 bg-gray-50 p-3 md:p-4 rounded-lg border-2 border-gray-200">
                  {(() => {
                    const statements = parseTrueFalseStatements(question.text);
                    return statements.map((statement, index) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-[#4C5173] text-white rounded-full text-xs md:text-sm font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <p className="text-sm md:text-[20px] text-black leading-relaxed">
                          <strong>
                            Statement {index + 1}: {statement}
                          </strong>
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              // Pre-Assessment
              <h2 className="text-lg md:text-2xl font-bold text-black leading-relaxed mb-2 md:mb-4">
                Q{question.questionNumber}. {question.text}
              </h2>
            )}
          </div>

          {/* TTS Button */}
          {isSupported && (
            <button
              onClick={speakQuestion}
              className={`ml-2 md:ml-4 p-2 md:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${isPlaying
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : "bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600 hover:scale-105"
                }`}
              title={
                isPlaying
                  ? "I-stop ang pagbasa ng tanong"
                  : "Basahin ang tanong"
              }
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          )}
        </div>

        {/* Question Image */}
        {question.image && (
          <div className="h-[150px] md:h-[200px] flex justify-center items-center p-3 md:p-4 border-b-2 border-gray-200">
            <img
              src={question.image}
              alt="Question illustration"
              className="max-h-full max-w-full object-contain border-2 border-gray-300 rounded-lg"
            />
          </div>
        )}

        {/* Options */}
        <div
          className={`flex-1 p-3 md:p-6 flex ${question.type === "image_mcq"
              ? "justify-center items-center"
              : "flex-col justify-center"
            }`}
        >
          <div
            className={`w-full h-full ${shouldUseGrid
                ? question.type === "image_mcq"
                  ? "grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
                  : "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto"
                : "flex flex-col gap-2 md:gap-3"
              }`}
          >
            {question.options?.map((opt, i) => {
              const optionValue = getOptionValue(opt);
              const isSelected = selectedAnswer === optionValue;

              return (
                <label
                  key={i}
                  className={`cursor-pointer transition-all duration-300 ${question.type === "image_mcq"
                      ? `relative flex flex-col items-center justify-center rounded-xl border-3 md:border-4 overflow-hidden ${isSelected
                        ? "border-blue-600 bg-blue-100 shadow-lg transform scale-105"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-102"
                      }`
                      : shouldUseGrid
                        ? `flex items-center justify-center p-4 md:p-8 rounded-lg border-2 md:border-3 min-h-[60px] md:min-h-[80px] ${isSelected
                          ? "border-blue-600 bg-blue-100 shadow-md transform scale-105"
                          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:scale-102"
                        }`
                        : `flex items-center p-3 md:p-6 rounded-lg border-2 md:border-3 ${isSelected
                          ? "border-blue-600 bg-blue-100 shadow-md"
                          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }`
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}-${question.questionNumber}`}
                    value={optionValue}
                    checked={isSelected}
                    onChange={() => onAnswerChange(question.id, optionValue)}
                    className="sr-only accent-blue-600"
                  />

                  {question.type === "image_mcq" ? (
                    <div className="w-full h-full min-h-[120px] md:min-h-[160px] relative">
                      {renderOptionContent(opt, i)}
                      {/* Radio indicator for mobile images */}
                      <div
                        className={`absolute top-2 left-2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-400"
                          }`}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ) : shouldUseGrid ? (
                    <div className="relative flex flex-col items-center justify-center w-full h-full text-center">
                      <div
                        className={`absolute top-2 left-2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${isSelected ? "bg-blue-600" : "bg-gray-400"
                          }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="pt-6 md:pt-8">{renderOptionContent(opt, i)}</div>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <div
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 md:mr-4 ${isSelected ? "bg-blue-600" : "bg-gray-400"
                          }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      {renderOptionContent(opt, i)}
                    </div>
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