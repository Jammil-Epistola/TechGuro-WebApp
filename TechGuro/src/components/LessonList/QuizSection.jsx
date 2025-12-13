//QuizSection.jsx
import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizModeCard from './QuizModeCard';
import { getQuizModeDetails } from './QuizModeCard';

const QuizSection = ({
  quizModes,
  loadingQuizData,
  onQuizModeSelect,
  recommendedLessons,
  allQuizLessonsByType,
  courseName,
  formattedTitle,
  courseId
}) => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-[20px] md:text-[24px] font-bold text-[#4C5173] mb-4">
        Quizzes
      </h1>
      <p className="text-[14px] md:text-[16px] mb-6">
        Test your knowledge with practice quizzes and exercises.
      </p>

      {loadingQuizData ? (
        <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C5173] mb-4"></div>
          <p className="text-[14px] md:text-[16px] text-gray-600">
            Loading quiz modes...
          </p>
        </div>
      ) : quizModes.length === 0 ? (
        <div className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-8 text-center">
          <p className="text-[16px] md:text-[18px] italic text-gray-700 mb-2">
            No quizzes available yet.
          </p>
          <p className="text-[13px] md:text-[14px] text-gray-600">
            Quiz exercises will be available soon for this course.
          </p>
        </div>
      ) : (
        <>
          {/* Quiz Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {quizModes.map((mode, index) => (
              <QuizModeCard
                key={mode.quiz_type}
                mode={mode}
                index={index}
                onClick={onQuizModeSelect}
              />
            ))}
          </div>

          {/* Recommended Quizzes Section */}
          {recommendedLessons.length > 0 && 
           quizModes.length > 0 && 
           Object.keys(allQuizLessonsByType).length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full">
                  <Trophy className="w-5 h-5" />
                  <h2 className="text-[18px] md:text-[20px] font-bold">
                    Teki's Recommended Quizzes
                  </h2>
                </div>
              </div>

              <p className="text-[13px] md:text-[14px] text-gray-600 mb-6">
                Based on your recommended lessons, we suggest practicing these quizzes. 
                Click on a quiz type above to see available quizzes for your recommended lessons.
              </p>

              {/* Show quizzes grouped by type */}
              {quizModes.map((mode) => {
                const details = getQuizModeDetails(mode.quiz_type);
                const IconComponent = details.icon;

                const lessonsForThisType = allQuizLessonsByType[mode.quiz_type] || [];
                const recommendedForThisType = lessonsForThisType.filter(quiz =>
                  recommendedLessons.includes(quiz.lesson_id)
                );

                if (recommendedForThisType.length === 0) return null;

                return (
                  <div key={mode.quiz_type} className="mb-8">
                    {/* Quiz Type Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-md`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className={`text-[17px] md:text-[19px] font-bold ${details.textColor}`}>
                        {mode.display_name}
                      </h3>
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[11px] font-bold">
                        FOR RECOMMENDED
                      </span>
                    </div>

                    {/* Quiz Cards for this type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedForThisType.map((lessonInfo, index) => (
                        <motion.div
                          key={`recommended-${mode.quiz_type}-${lessonInfo.lesson_id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`${details.bgColor} border-2 ${details.borderColor} rounded-lg p-4 hover:shadow-md cursor-pointer transition-all`}
                          onClick={() => {
                            navigate(
                              `/courses/${courseName}/quizzes/${courseId}/${lessonInfo.lesson_id}/${mode.quiz_type}`,
                              {
                                state: {
                                  quizData: lessonInfo,
                                  courseName: courseName,
                                  formattedTitle: formattedTitle,
                                },
                              }
                            );
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center shadow-md`}>
                                <span className="text-white font-bold text-lg">★</span>
                              </div>
                            </div>

                            <div className="flex-1">
                              <h4 className="text-[15px] md:text-[17px] font-bold text-gray-800 mb-2">
                                {lessonInfo.lesson_title}
                              </h4>

                              <div className="flex items-center gap-3 text-[12px] md:text-[13px] text-gray-600 flex-wrap mb-2">
                                <span>
                                  📝 {mode.quiz_type === "multiple_choice" ? 10 : 
                                      mode.quiz_type === "drag_drop" ? 5 : 
                                      mode.quiz_type === "typing" ? 5 : 
                                      lessonInfo.total_questions} questions
                                </span>
                                {lessonInfo.difficulty && (
                                  <span className={`px-2 py-1 rounded-full text-[10px] md:text-[11px] font-bold ${
                                    lessonInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    lessonInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {lessonInfo.difficulty.toUpperCase()}
                                  </span>
                                )}
                              </div>

                              <p className="text-[12px] text-gray-600">
                                Practice your recommended lessons
                              </p>
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/courses/${courseName}/quizzes/${courseId}/${lessonInfo.lesson_id}/${mode.quiz_type}`,
                                  {
                                    state: {
                                      quizData: lessonInfo,
                                      courseName: courseName,
                                      formattedTitle: formattedTitle,
                                    },
                                  }
                                );
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${details.color} hover:opacity-90 transition-colors text-[13px] md:text-[14px]`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Start
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default QuizSection;