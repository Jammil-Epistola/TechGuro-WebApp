// src/components/AssessmentInstructions.jsx
import React, { useState } from "react";
import CourseNavbar from "../courses/courseNavbar";
import Teki1 from "../assets/Teki 1.png";

const AssessmentInstructions = ({ 
  assessmentType = "pre", 
  courseName, 
  onStart 
}) => {
  const [dialogueStep, setDialogueStep] = useState(0);

  const getDialogueContent = () => {
    if (assessmentType === "pre") {
      const preDialogues = [
        "Kumusta! Bago ka magsimula sa inyong pagaaral, sagutin muna natin ang mga tanong na ito. Ang mga sagot mo ay makakatulong sa akin na marekomenda ang tamang mga lesson para sa iyo.",
        "Walang time limit, kaya hindi mo kailangang mag-rush. Piliin lang ang sagot na pinakaangkop para sa inyong kaalaman. Handa ka na ba?",
        "Simulan na natin! Good luck sa inyong pre-assessment!"
      ];
      return preDialogues[dialogueStep];
    } else {
      const postDialogues = [
        "Congratulations sa pagkakompleto mo ng mga lesson! Ngayon naman, tingnan natin kung gaano karami ang inyong natutunan.",
        "Ang post-assessment na ito ay magiging basehan natin para malaman kung naging successful ang inyong pag-aaral. Kaya gawin mo lang ang best mo!",
        "Ready na? Simulan na natin ang inyong final assessment!"
      ];
      return postDialogues[dialogueStep];
    }
  };

  const handleNext = () => {
    if (dialogueStep === 2) {
      onStart();
    } else {
      setDialogueStep(dialogueStep + 1);
    }
  };

  const handlePrevious = () => {
    if (dialogueStep > 0) {
      setDialogueStep(dialogueStep - 1);
    }
  };

  const getButtonText = () => {
    if (dialogueStep === 2) {
      return assessmentType === "pre" ? "Start Pre-Assessment" : "Start Post-Assessment";
    }
    return "Next";
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      {/* CourseNavbar */}
      <CourseNavbar courseTitle={`${formattedTitle} ${assessmentType === "pre" ? "Pre-Assessment" : "Post-Assessment"}`} />
      
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          {formattedTitle.toUpperCase()}
        </h1>
        <h2 className="text-3xl font-semibold text-black">
          {assessmentType === "pre" ? "Pre-Assessment Test" : "Post-Assessment Test"}
        </h2>
      </div>

      <div className="flex justify-center items-center p-1">
        <div className="max-w-5xl w-full">
          {/* Dialogue Box */}
          <div className="bg-white border-4 border-gray-400 rounded-xl shadow-xl relative">
            {/* Teki */}
            <div className="absolute -top-30 -right-20 z-10">
              <img 
                src={Teki1} 
                alt="Teki" 
                className="w-73 h-73 drop-shadow-lg" 
              />
            </div>
            
            {/* Dialogue Content Container */}
            <div className="p-10 pt-16">
              <div className="mb-4">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-2xl font-bold">
                  Teki
                </span>
              </div>
              
              {/* Dialogue Text Box */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 mb-8 min-h-[200px] flex items-center">
                <p className="text-2xl text-black leading-relaxed">
                  {getDialogueContent()}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={`w-5 h-5 rounded-full transition-all ${
                      step === dialogueStep
                        ? "bg-blue-600 scale-125 ring-4 ring-blue-200"
                        : step < dialogueStep
                        ? "bg-blue-400"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Outside the dialogue container */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={dialogueStep === 0}
              className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
                dialogueStep === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-10 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructions;