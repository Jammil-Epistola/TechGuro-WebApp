// src/components/Dashboard/LearningGrowth.jsx
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import API_URL from '../../config/api';

const LearningGrowth = ({
  courses,
  selectedCourse,
  setSelectedCourse,
  preAssessment,
  postAssessment,
  completeMasteryData,
  masteryLoading,
  barData,
  barOptions,
  userId
}) => {
  const preScore = preAssessment ? preAssessment.score : 0;
  const postScore = postAssessment ? postAssessment.score : 0;

  // Quiz Performance Breakdown State
  const [quizBreakdownData, setQuizBreakdownData] = useState(null);
  const [quizBreakdownLoading, setQuizBreakdownLoading] = useState(true);
  const [quizBreakdownError, setQuizBreakdownError] = useState(null);

  // Course-to-lesson mapping
  const courseLessonIds = {
    1: [1, 2, 3, 4, 5],           // Computer Basics
    2: [6, 7, 8, 9, 10],          // Internet Safety
    3: [11, 12, 13, 14, 15],      // Digital Communication
    4: [16, 17, 18, 19]           // Intro To Online Selling
  };

  const courseId = courses.indexOf(selectedCourse) + 1;
  const currentCourseLessons = courseLessonIds[courseId] || [];

  // Filter lessons for current course
  const courseSpecificLessons = completeMasteryData?.lessons
    ? completeMasteryData.lessons.filter(
      lesson => currentCourseLessons.includes(lesson.lesson_id)
    )
    : [];

  // Fetch Quiz Performance Breakdown when course changes
  useEffect(() => {
    const fetchQuizBreakdown = async () => {
      if (!userId || !courseId) return;

      setQuizBreakdownLoading(true);
      setQuizBreakdownError(null);

      try {
        const response = await fetch(
          `${API_URL}/quiz/performance-breakdown/${userId}/${courseId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch quiz performance data");
        }

        const data = await response.json();
        setQuizBreakdownData(data);
      } catch (err) {
        console.error("Error fetching quiz breakdown:", err);
        setQuizBreakdownError(err.message);
      } finally {
        setQuizBreakdownLoading(false);
      }
    };

    fetchQuizBreakdown();
  }, [userId, courseId]);

  const getMasteryColor = (mastery) => {
    if (mastery >= 0.8) return 'from-green-400 to-green-600';
    if (mastery >= 0.6) return 'from-blue-400 to-blue-600';
    if (mastery >= 0.4) return 'from-yellow-400 to-yellow-600';
    return 'from-orange-400 to-orange-600';
  };

  const getMasteryLabel = (mastery) => {
    if (mastery >= 0.8) return 'Mastered ✓';
    if (mastery >= 0.6) return 'Proficient';
    if (mastery >= 0.4) return 'Developing';
    return 'Beginner';
  };

  const getQuizTypeDisplay = (quizType) => {
    const typeMap = {
      'multiple_choice': 'Image Quiz',
      'drag_drop': 'Drag & Drop',
      'typing': 'Typing Quiz'
    };
    return typeMap[quizType] || quizType;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare chart data for quiz types
  let quizTypeDoughnutData = null;

  if (quizBreakdownData?.performance_by_type) {
    const quizTypes = Object.values(quizBreakdownData.performance_by_type);
    const quizTypeLabels = quizTypes.map(qt => qt.display_name);
    const quizTypeScores = quizTypes.map(qt => qt.average_score);

    quizTypeDoughnutData = {
      labels: quizTypeLabels,
      datasets: [
        {
          data: quizTypeScores,
          backgroundColor: ['#4C5173', '#6B708D', '#8E8FAD'],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`
        }
      }
    }
  };

  return (
    <motion.div
      className="border border-black rounded-md p-4 flex flex-col"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.8 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h3 className="font-semibold text-[23px]">Learning Growth</h3>

        {/* Course Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BookOpen className="w-5 h-5 text-[#4C5173] flex-shrink-0" />
          <motion.select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-[#4C5173] px-3 py-2 rounded text-[14px] sm:text-[16px] bg-white w-full sm:w-auto"
            whileFocus={{ scale: 1.02 }}
          >
            {courses.map((course) => <option key={course}>{course}</option>)}
          </motion.select>
        </div>
      </div>

      {/* GRID: 3 columns - Assessment, Quiz Breakdown, Mastery */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        
        {/* 1. Assessment Performance Chart */}
        <motion.div
          className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          key={`assessment-${selectedCourse}`}
        >
          <h4 className="text-md font-semibold mb-3 text-center text-gray-900">Assessment Performance</h4>
          <div className="w-full max-w-[200px]">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="mt-2 text-sm text-center">
            <p className="text-gray-600">Course: {selectedCourse}</p>
            <p className="font-medium">
              {postScore > 0
                ? postScore - preScore >= 0
                  ? `Improvement: +${postScore - preScore}`
                  : `Change: ${postScore - preScore}`
                : 'No post-assessment yet'}
            </p>
          </div>
        </motion.div>

        {/* 2. Quiz Performance Breakdown (NEW) */}
        <motion.div
          className="flex flex-col bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          key={`quiz-breakdown-${selectedCourse}`}
        >
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-700" />
              <h4 className="text-md font-semibold text-purple-900">
                Quiz Performance
              </h4>
            </div>

            {quizBreakdownLoading ? (
              <div className="text-center py-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"
                />
                <p className="text-xs text-gray-600 mt-2">Loading...</p>
              </div>
            ) : quizBreakdownError || !quizBreakdownData || quizBreakdownData.total_attempts === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">Walang quiz data pa</p>
                <p className="text-xs mt-1">No quiz data yet</p>
                <p className="text-xs mt-2 text-gray-400">
                  Complete quizzes for {selectedCourse}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quiz Type Performance Chart */}
                {quizTypeDoughnutData && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="h-[150px]">
                      <Doughnut data={quizTypeDoughnutData} options={doughnutOptions} />
                    </div>
                  </div>
                )}

                {/* Overall Stats */}
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700">Total Attempts:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {quizBreakdownData.total_attempts}
                    </span>
                  </div>
                  
                  {/* Performance by quiz type */}
                  {Object.values(quizBreakdownData.performance_by_type || {}).map((typeData, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{typeData.display_name}:</span>
                      <span className={`font-bold ${getPerformanceColor(typeData.average_score)}`}>
                        {typeData.average_score}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Weak Areas */}
                {quizBreakdownData.weak_areas && quizBreakdownData.weak_areas.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <h5 className="text-xs font-bold text-red-800">Areas to Improve:</h5>
                    </div>
                    <ul className="space-y-1">
                      {quizBreakdownData.weak_areas.slice(0, 3).map((area, idx) => (
                        <motion.li
                          key={idx}
                          className="text-xs text-red-700 flex items-start gap-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + idx * 0.1 }}
                        >
                          <span className="text-red-500 mt-0.5">•</span>
                          <span className="flex-1">
                            <strong>{area.lesson_title}:</strong> {area.average_score}%
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {quizBreakdownData.recommendations && quizBreakdownData.recommendations.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h5 className="text-xs font-bold text-green-800">Tips:</h5>
                    </div>
                    <ul className="space-y-1">
                      {quizBreakdownData.recommendations.slice(0, 2).map((rec, idx) => (
                        <motion.li
                          key={idx}
                          className="text-xs text-green-700 flex items-start gap-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + idx * 0.1 }}
                        >
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="flex-1">{rec.message}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Mastery Progress by Lesson */}
        <motion.div
          className="flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          key={`mastery-${selectedCourse}`}
        >
          <div className="w-full">
            <h4 className="text-md font-semibold mb-2 text-center text-blue-900">
              📊 Mastery Progress
            </h4>
            <p className="text-xs text-center text-blue-700 mb-3 italic">
              Based on Pre & Post Assessments
            </p>

            {masteryLoading ? (
              <div className="text-center py-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-[#4C5173] border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : !completeMasteryData || !completeMasteryData.lessons || courseSpecificLessons.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm font-semibold">Walang mastery data pa</p>
                <p className="text-xs mt-1">No mastery data yet</p>
                <p className="text-xs mt-2 text-gray-400">
                  Complete Pre-Assessment for {selectedCourse}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {courseSpecificLessons.slice(0, 5).map((lesson, idx) => {
                  const masteryStat = lesson.current_mastery;
                  const improvementDelta = lesson.improvement;

                  return (
                    <motion.div
                      key={lesson.lesson_id}
                      className="bg-white rounded-lg p-3 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Lesson Title */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">
                            {lesson.lesson_title}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ml-2 ${
                          lesson.status_color === 'green' ? 'bg-green-200 text-green-800' :
                          lesson.status_color === 'blue' ? 'bg-blue-200 text-blue-800' :
                          lesson.status_color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {lesson.status}
                        </span>
                      </div>

                      {/* Mastery Probability Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-gray-600">Mastery:</span>
                          <span className="text-xs font-bold text-blue-700">
                            {lesson.current_percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${getMasteryColor(masteryStat)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${lesson.current_percentage}%` }}
                            transition={{ duration: 1.5, delay: 1.1 + idx * 0.1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getMasteryLabel(masteryStat)}
                        </p>
                      </div>

                      {/* Improvement & Quiz Practice Counter */}
                      <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                        <div className={`flex items-center gap-1 font-bold ${
                          improvementDelta > 0 ? 'text-green-600' :
                          improvementDelta < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {improvementDelta > 0 ? '📈' : improvementDelta < 0 ? '📉' : '➡️'}
                          <span>{improvementDelta > 0 ? '+' : ''}{lesson.improvement_percentage}%</span>
                        </div>
                        <span className="text-purple-600 font-bold" title="Quiz practice attempts (for review only)">
                          {lesson.quiz_attempts} quiz{lesson.quiz_attempts !== 1 ? 'zes' : ''}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Summary Stats */}
                {completeMasteryData.statistics && (
                  <motion.div
                    className="bg-white rounded-lg p-3 border-2 border-green-400 mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    <h5 className="font-semibold text-sm text-green-800 mb-2">
                      📈 Summary
                    </h5>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-700">
                        <span className="font-semibold">Avg Mastery:</span>{' '}
                        <span className="text-green-600 font-bold">
                          {completeMasteryData.statistics.average_mastery_percentage}%
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Mastered:</span>{' '}
                        <span className="text-blue-600 font-bold">
                          {completeMasteryData.statistics.mastered_count}/{completeMasteryData.statistics.total_lessons}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Quiz Practice:</span>{' '}
                        <span className="text-purple-600 font-bold">
                          {completeMasteryData.statistics.total_quiz_attempts}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LearningGrowth;