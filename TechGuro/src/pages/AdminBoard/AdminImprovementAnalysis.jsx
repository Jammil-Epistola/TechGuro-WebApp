import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const AdminImprovementAnalysis = () => {
  const [improvementData, setImprovementData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchImprovementData();
  }, []);

  const fetchImprovementData = async () => {
    setLoading(true);
    try {
      const [analysisRes, summaryRes] = await Promise.all([
        fetch("http://localhost:8000/admin/improvement-analysis"),
        fetch("http://localhost:8000/admin/improvement-analysis/summary")
      ]);

      const analysisData = await analysisRes.json();
      const summaryData = await summaryRes.json();

      setImprovementData(analysisData);
      setSummaryData(summaryData);

      // Extract unique courses from the data
      if (analysisData.length > 0 && analysisData[0].courses) {
        const uniqueCourses = [];
        const courseMap = new Map();
        
        analysisData.forEach(user => {
          user.courses.forEach(course => {
            if (!courseMap.has(course.course_id)) {
              courseMap.set(course.course_id, {
                id: course.course_id,
                name: course.course_name
              });
            }
          });
        });
        
        setCourses(Array.from(courseMap.values()));
      }
    } catch (error) {
      console.error("Error fetching improvement data:", error);
      alert("Failed to fetch improvement analysis");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected course
  const getFilteredData = () => {
    if (selectedCourse === "all") {
      return improvementData;
    }

    return improvementData
      .map(user => {
        const filteredCourses = user.courses.filter(
          course => course.course_id.toString() === selectedCourse
        );
        
        if (filteredCourses.length === 0) return null;

        return {
          ...user,
          courses: filteredCourses,
          overall_improvement: filteredCourses[0].improvement_percentage
        };
      })
      .filter(user => user !== null);
  };

  // Calculate filtered summary stats
  const getFilteredSummary = () => {
    if (selectedCourse === "all") {
      return summaryData;
    }

    const filteredUsers = getFilteredData();
    const improvements = filteredUsers.map(user => user.overall_improvement);
    
    const improved = improvements.filter(i => i > 0).length;
    const declined = improvements.filter(i => i < 0).length;
    const noChange = improvements.filter(i => i === 0).length;
    const avgImprovement = improvements.length > 0 
      ? improvements.reduce((a, b) => a + b, 0) / improvements.length 
      : 0;

    return {
      total_users_with_both_assessments: filteredUsers.length,
      total_course_assessments: filteredUsers.length,
      total_improved: improved,
      total_declined: declined,
      total_no_change: noChange,
      average_improvement_percentage: avgImprovement,
      all_improvements: improvements
    };
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return "-";
    if (score > 1) {
      return score.toFixed(2) + "%";
    }
    return (score * 100).toFixed(2) + "%";
  };

  const formatImprovement = (improvement) => {
    const sign = improvement > 0 ? "+" : "";
    return sign + improvement.toFixed(2);
  };

  const getImprovementColor = (improvement) => {
    if (improvement > 0) return "text-green-600";
    if (improvement < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getImprovementBgColor = (improvement) => {
    if (improvement > 0) return "bg-green-100";
    if (improvement < 0) return "bg-red-100";
    return "bg-gray-100";
  };

  const filteredData = getFilteredData();
  const filteredSummary = getFilteredSummary();

  const pieData = filteredSummary
    ? [
        { name: "Improved", value: filteredSummary.total_improved, fill: "#10b981" },
        { name: "No Change", value: filteredSummary.total_no_change, fill: "#9ca3af" },
        { name: "Declined", value: filteredSummary.total_declined, fill: "#ef4444" }
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-[#4c5173] text-[48px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Filter */}
      {courses.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#4c5173]" />
              <label className="font-semibold text-[#4c5173] text-lg">
                Filter by Course:
              </label>
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4c5173] font-medium"
            >
              <option value="all">All Courses (Combined)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id.toString()}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCourse !== "all" && (
            <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Filtered View:</span> Showing results only for{" "}
                <span className="font-bold">
                  {courses.find(c => c.id.toString() === selectedCourse)?.name}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {filteredSummary && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                Users Analyzed
              </p>
              <p className="text-[#4c5173] text-[32px] font-bold">
                {filteredSummary.total_users_with_both_assessments}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                {selectedCourse === "all" ? "Total Assessments" : "Course Assessments"}
              </p>
              <p className="text-[#4c5173] text-[32px] font-bold">
                {filteredSummary.total_course_assessments}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                Average Improvement
              </p>
              <p className={`text-[32px] font-bold ${getImprovementColor(filteredSummary.average_improvement_percentage)}`}>
                {formatImprovement(filteredSummary.average_improvement_percentage)}%
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                Improved
              </p>
              <p className="text-green-600 text-[32px] font-bold">
                {filteredSummary.total_improved}
              </p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg shadow border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                Declined
              </p>
              <p className="text-red-600 text-[32px] font-bold">
                {filteredSummary.total_declined}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart - Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-[#1A202C] text-[18px] mb-4">
                Improvement Distribution
                {selectedCourse !== "all" && (
                  <span className="text-sm font-normal text-gray-600 block mt-1">
                    {courses.find(c => c.id.toString() === selectedCourse)?.name}
                  </span>
                )}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} ${selectedCourse === "all" ? "assessments" : "users"}`} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart - Improvement Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-[#1A202C] text-[18px] mb-4">
                Improvement Ranges
                {selectedCourse !== "all" && (
                  <span className="text-sm font-normal text-gray-600 block mt-1">
                    {courses.find(c => c.id.toString() === selectedCourse)?.name}
                  </span>
                )}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { 
                      range: "Declined\n(-50% to 0%)", 
                      count: filteredSummary.all_improvements.filter(i => i < 0).length,
                      fill: "#ef4444"
                    },
                    { 
                      range: "Small\n(0-25%)", 
                      count: filteredSummary.all_improvements.filter(i => i >= 0 && i < 25).length,
                      fill: "#fbbf24"
                    },
                    { 
                      range: "Moderate\n(25-50%)", 
                      count: filteredSummary.all_improvements.filter(i => i >= 25 && i < 50).length,
                      fill: "#10b981"
                    },
                    { 
                      range: "High\n(50%+)", 
                      count: filteredSummary.all_improvements.filter(i => i >= 50).length,
                      fill: "#059669"
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4c5173">
                    {[0, 1, 2, 3].map((index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? "#ef4444" : 
                        index === 1 ? "#fbbf24" : 
                        index === 2 ? "#10b981" : "#059669"
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed User Improvements */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#1A202C] text-[24px]">
          Detailed User Improvements
          {selectedCourse !== "all" && (
            <span className="text-lg font-normal text-gray-600 block mt-1">
              Filtered by: {courses.find(c => c.id.toString() === selectedCourse)?.name}
            </span>
          )}
        </h2>

        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-[18px]">
              {selectedCourse === "all" 
                ? "No users with both pre and post assessments yet"
                : `No users have completed both assessments for ${courses.find(c => c.id.toString() === selectedCourse)?.name}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((user) => (
              <div key={user.user_id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* User Header */}
                <div
                  className="p-4 bg-[#f9f9f9] cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
                  onClick={() =>
                    setExpandedUser(
                      expandedUser === user.user_id ? null : user.user_id
                    )
                  }
                >
                  <div className="flex-1">
                    <p className="font-bold text-[#1A202C]">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {selectedCourse === "all" ? "Overall Improvement" : "Course Improvement"}
                      </p>
                      <p
                        className={`text-[24px] font-bold ${getImprovementColor(
                          user.overall_improvement
                        )}`}
                      >
                        {formatImprovement(user.overall_improvement)}%
                      </p>
                    </div>

                    <div>
                      {user.overall_improvement > 0 ? (
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      ) : user.overall_improvement < 0 ? (
                        <TrendingDown className="w-8 h-8 text-red-600" />
                      ) : (
                        <Minus className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Course Details */}
                {expandedUser === user.user_id && (
                  <div className="p-4 border-t border-gray-200 space-y-3">
                    <h4 className="font-semibold text-[#1A202C] mb-3">
                      {selectedCourse === "all" ? "All Courses" : "Course Details"}
                    </h4>

                    {user.courses.map((course) => (
                      <div
                        key={course.course_id}
                        className={`p-4 rounded-lg border-2 ${
                          course.improvement_percentage > 0
                            ? "border-green-300 bg-green-50"
                            : course.improvement_percentage < 0
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-semibold text-[#1A202C] text-lg">
                            {course.course_name}
                          </p>
                          <div className="text-right">
                            <span
                              className={`text-2xl font-bold ${getImprovementColor(
                                course.improvement_percentage
                              )}`}
                            >
                              {formatImprovement(course.improvement_percentage)}%
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              {course.improvement_percentage > 0
                                ? "Improved"
                                : course.improvement_percentage < 0
                                ? "Declined"
                                : "No Change"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 items-center">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Pre-Assessment</p>
                            <p className="font-bold text-[#1A202C] text-lg">
                              {formatScore(course.pre_score)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(course.pre_date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="text-center">
                            <div className="text-3xl text-gray-400">→</div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Post-Assessment</p>
                            <p className="font-bold text-[#1A202C] text-lg">
                              {formatScore(course.post_score)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(course.post_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Score Difference */}
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Score Change:</span>
                            <span className={`font-semibold ${getImprovementColor(course.improvement_percentage)}`}>
                              {course.pre_score <= 1 
                                ? ((course.post_score - course.pre_score) * 100).toFixed(2)
                                : (course.post_score - course.pre_score).toFixed(2)
                              } points
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImprovementAnalysis;