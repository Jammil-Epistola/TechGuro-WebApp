import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseNavbar from './courseNavbar.jsx';
import { useUser } from '../context/UserContext.jsx';
import Teki1 from "../assets/Teki 1.png";

const PreAssessment = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user } = useUser();
  const [dialogueStep, setDialogueStep] = useState(0);
  const [startTest, setStartTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/assessment/check/${user?.user_id || 1}/1`)
      .then(res => res.json())
      .then(data => {
        if (data.taken) {
          navigate(`/courses/${courseName}`, { replace: true }); // Avoid flash
        }
      })
      .catch(err => console.error("Failed to check pre-assessment:", err));
  }, [user]);

  useEffect(() => {
    fetch(`http://localhost:8000/assessment/questions/1?assessment_type=pre`)
      .then(response => response.json())
      .then(data => {
        const formattedQuestions = data.map(q => ({
          question_id: q.id,
          question: q.text,
          answer: q.correct_answer,
          options: q.choices ? JSON.parse(q.choices) : []
        }));
        setQuestions(formattedQuestions);
      })
      .catch(error => console.error("Failed to load questions:", error));
  }, []);

  const handleDialogueNext = () => {
    if (dialogueStep === 2) {
      setStartTest(true);
    } else {
      setDialogueStep(dialogueStep + 1);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedOption
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(selectedAnswers).length === questions.length - 1) {
      handleSubmit();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (!selected) return;

      if (q.answer_image) {
        if (selected.image === q.answer_image) correctAnswers++;
      } else {
        if (selected === q.answer) correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitting(true);
    setIsGeneratingRecommendations(true);

    const responses = questions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      let isCorrect = false;

      if (!selected) return { question_id: q.question_id, is_correct: false };

      if (q.answer_image) {
        isCorrect = selected.image === q.answer_image;
      } else {
        isCorrect = selected === q.answer;
      }

      return {
        question_id: q.question_id,
        is_correct: isCorrect
      };
    });

    const payload = {
      user_id: user?.user_id || 1,
      course_id: 1,
      assessment_type: "pre",
      responses: responses
    };

    // Submit assessment first
    fetch("http://localhost:8000/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(async data => {
        console.log("Pre-assessment submitted:", data);

        // UPDATED: Process with BKT system to establish baseline mastery
        try {
          console.log("Processing BKT baseline mastery...");

          const bktRes = await fetch(`http://localhost:8000/bkt/update-from-pre?user_id=${user?.user_id || 1}&course_id=1`, {
            method: "POST"
          });

          if (!bktRes.ok) {
            throw new Error(`BKT request failed: ${bktRes.status} ${bktRes.statusText}`);
          }

          const bktData = await bktRes.json();
          console.log("BKT pre-assessment processing complete:", bktData);

          // Show success and navigate after BKT processing
          setTimeout(() => {
            navigate(`/courses/${courseName}`, { replace: true });
          }, 2000);

        } catch (bktError) {
          console.error('BKT pre-assessment processing failed:', bktError);

          // Fallback: Navigate anyway but log the error
          console.log("Continuing without BKT processing...");
          setTimeout(() => {
            navigate(`/courses/${courseName}`, { replace: true });
          }, 2000);
        }
      })
      .catch(error => {
        console.error("Pre-assessment submission failed:", error);
        setIsSubmitting(false);
        setIsGeneratingRecommendations(false);
      });
  };

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="bg-[#DFDFEE] min-h-screen text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="text-center py-8">
        <h1 className="text-[42px] font-bold">{formattedTitle.toUpperCase()}</h1>
        <h2 className="text-[36px] font-semibold">Pre-Assessment Test</h2>
      </div>

      <div className="flex flex-col justify-center items-center p-8">
        {!startTest ? (
          <div className="bg-white border border-black rounded-lg p-10 max-w-[1000px] w-full relative">
            <img src={Teki1} alt="Teki" className="w-[180px] h-[180px] absolute top-[-90px] right-[-90px]" />
            <h2 className="text-[32px] font-bold mb-6 text-left">Teki</h2>
            <div className="text-[24px] text-justify mb-6">
              {dialogueStep === 0 && (
                <>
                  Before you begin, please answer the following multiple-choice questions honestly.
                  This questionnaire helps us recommend the right lessons for you.
                </>
              )}

              {/* 🔹 New Step (BKT explanation) */}
              {dialogueStep === 1 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-[20px] leading-relaxed">
                  <p className="mb-2">
                    We use the <strong>Bayesian Knowledge Tracing (BKT)</strong> model to measure your learning progress.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>P(known)</strong>: Chance you already know a skill before answering.</li>
                    <li><strong>P(will learn)</strong>: Chance you learn a skill after practicing.</li>
                    <li><strong>P(slip)</strong>: Chance you answer wrong even if you know the skill.</li>
                    <li><strong>P(guess)</strong>: Chance you answer right even if you don’t know it.</li>
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">
                    This helps us personalize your recommended lessons and track mastery growth.
                  </p>
                </div>
              )}

              {dialogueStep === 2 && (
                <>
                  There is no time limit, so take your time and choose the answers that best reflect what you know.
                  Good luck!
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDialogueNext}
                className="px-8 py-4 bg-blue-500 text-white text-[20px] rounded hover:bg-blue-600 transition"
              >
                {dialogueStep === 2 ? "Start Pre-Assessment" : "Next"}
              </button>
            </div>
          </div>
        ) : isGeneratingRecommendations ? (
          <div className="bg-white border border-black rounded-lg p-10 max-w-[1000px] w-full relative">
            <img src={Teki1} alt="Teki" className="w-[180px] h-[180px] absolute top-[-90px] right-[-90px]" />
            <h2 className="text-[32px] font-bold mb-6 text-left">Teki</h2>
            <p className="text-[24px] text-justify mb-6">
              You scored {score}/{questions.length}. Based on your answers,
              I’m figuring out the perfect lessons for you
              <span className="animate-typing ml-1"></span>
            </p>
            <p className="text-[20px] italic text-[#4c5173] mb-6">
              Please wait while I analyze your results
              <span className="animate-typing ml-1"></span>
            </p>
          </div>
        ) : (
          <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-10 max-w-[1000px] w-full">
            <h2 className="text-[30px] font-bold mb-8 text-center">
              Q{currentQuestion + 1}: {questions[currentQuestion]?.question}
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {questions[currentQuestion]?.options?.map((option, index) => {
                const selected = selectedAnswers[currentQuestion];
                const isSelected =
                  (option.image && selected?.image === option.image) ||
                  (!option.image && selected === option);

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`flex flex-col items-center justify-center px-6 py-6 rounded-lg text-white font-bold text-[20px] 
                      ${isSelected ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600 transition w-full sm:w-auto min-w-[250px]`}
                  >
                    {option.image ? (
                      <img src={option.image} alt={`Option ${index + 1}`} className="w-24 h-24 object-contain" />
                    ) : (
                      <span>{option}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreAssessment;