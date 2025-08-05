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

  // Check if pre-assessment already taken
  useEffect(() => {
    fetch(`http://localhost:8000/assessment/check/${user?.user_id || 1}/1`)
      .then(res => res.json())
      .then(data => {
        if (data.taken) {
          navigate(`/courses/${courseName}`);
        }
      })
      .catch(err => console.error("Failed to check pre-assessment:", err));
  }, [user]);

  useEffect(() => {
    fetch('/data/computer_basics_questions.json')
      .then(response => response.json())
      .then(data => setQuestions(data))
      .catch(error => console.error("Failed to load questions:", error));
  }, []);

  const handleDialogueNext = () => {
    if (dialogueStep === 1) {
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
      score: finalScore,
      responses: responses
    };

    // Step 1: Submit assessment
    fetch("http://localhost:8000/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        // Step 2: Trigger BKT update
        return fetch("http://localhost:8000/bkt/update-from-pre", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user?.user_id || 1, course_id: 1 })
        });
      })
      .then(res => res.json())
      .then(data => {
        console.log("BKT Update Success:", data);
        setTimeout(() => {
          navigate(`/courses/${courseName}`);
        }, 2500);
      })
      .catch(error => {
        console.error("Submission failed:", error);
        setIsSubmitting(false);
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
            <p className="text-[24px] text-justify mb-6">
              {dialogueStep === 0 && (
                <>
                  Before you begin, please answer the following multiple-choice questions honestly.
                  This questionnaire helps us recommend the right lessons for you.
                </>
              )}
              {dialogueStep === 1 && (
                <>
                  There is no time limit, so take your time and choose the answers that best reflect what you know.
                  Good luck!
                </>
              )}
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleDialogueNext}
                className="px-8 py-4 bg-blue-500 text-white text-[20px] rounded hover:bg-blue-600 transition"
              >
                {dialogueStep === 1 ? "Start Pre-Assessment" : "Next"}
              </button>
            </div>
          </div>
        ) : score !== null ? (
          <div className="bg-white border border-black rounded-lg p-10 max-w-[1000px] w-full relative">
            <img src={Teki1} alt="Teki" className="w-[180px] h-[180px] absolute top-[-90px] right-[-90px]" />
            <h2 className="text-[32px] font-bold mb-6 text-left">Teki</h2>
            <p className="text-[24px] text-justify mb-6">
              You scored {score}/{questions.length}. Based on your answers, we are recommending lessons for you...
            </p>
            <p className="text-[20px] italic text-[#4c5173] mb-6">Redirecting to lessons...</p>
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
