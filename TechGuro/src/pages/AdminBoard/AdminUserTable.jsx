import React, { useState, useEffect } from "react";
import { Search, Trash2, Download, Eye } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import API_URL from '../config/api';

const AdminUserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);

      // Extract courses from first user's assessments_by_course
      if (data.length > 0 && data[0].assessments_by_course) {
        const courseList = Object.entries(data[0].assessments_by_course).map(
          ([courseId, courseData]) => ({
            id: courseId,
            name: courseData.course_name
          })
        );
        setCourses(courseList);
        // Set default to first course
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) {
      setDeleting(userId);
      try {
        const response = await fetch(`${API_URL}:8000/admin/user/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsers(users.filter((u) => u.user_id !== userId));
          setFilteredUsers(filteredUsers.filter((u) => u.user_id !== userId));
          alert("User deleted successfully");
        } else {
          const errorData = await response.json();
          alert(errorData.detail || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Server error. Failed to delete user");
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${API_URL}:8000/admin/export/csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users_export.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Server error. Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return "-";
    if (score > 1) {
      return score.toFixed(2) + "%";
    } else {
      return (score * 100).toFixed(2) + "%";
    }
  };

  const toggleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Helper function to check if course is completed
  const isCourseCompleted = (user, courseId) => {
    return user.course_progress?.[courseId]?.status === "completed";
  };

  // Helper function to get assessment data for selected course
  const getCourseAssessment = (user, courseId) => {
    return user.assessments_by_course?.[courseId] || { pre: null, post: null };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-[#4c5173] text-[48px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Export + Course Filter */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 relative flex gap-3 items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c5173]"
            />
          </div>

          {/* Course Filter Dropdown */}
          {courses.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#4c5173] whitespace-nowrap">Filter:</label>
              <select
                value={selectedCourse || ""}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4c5173]"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting || users.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            exporting || users.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {exporting ? (
            <>
              <FaSpinner className="animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Results Count */}
      <div className="text-[#4c5173] font-semibold">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-[18px]">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-[#4c5173] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Username</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Birthday</th>
                  <th className="px-6 py-4 text-left font-semibold">Date Created</th>
                  <th className="px-6 py-4 text-left font-semibold">Pre-Assessment</th>
                  <th className="px-6 py-4 text-left font-semibold">Post-Assessment</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredUsers.map((user, index) => {
                  const courseAssessment = getCourseAssessment(user, selectedCourse);
                  const courseCompleted = isCourseCompleted(user, selectedCourse);
                  
                  return (
                    <React.Fragment key={user.user_id}>
                      {/* Main Row */}
                      <tr
                        className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-[#1A202C]">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-[#4c5173]">{user.email}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(user.birthday)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(user.date_created)}
                        </td>

                        {/* Pre-Assessment Status - Course Specific */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Completion Status */}
                            <div className="flex flex-col gap-1">
                              {courseAssessment.pre ? (
                                <>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold w-fit bg-green-100 text-green-800">
                                    ✓ Taken
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    Score: {formatScore(courseAssessment.pre.score)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(courseAssessment.pre.date)}
                                  </span>
                                </>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold w-fit bg-red-100 text-red-800">
                                  ✗ Not Taken
                                </span>
                              )}
                            </div>

                            {/* Availability Status - Enabled only if NOT taken */}
                            {courseAssessment.pre ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit bg-gray-200 text-gray-700">
                                🔒 Disabled
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit bg-blue-200 text-blue-700">
                                🔓 Enabled
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Post-Assessment Status - Course Specific */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Completion Status */}
                            <div className="flex flex-col gap-1">
                              {courseAssessment.post ? (
                                <>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold w-fit bg-green-100 text-green-800">
                                    ✓ Taken
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    Score: {formatScore(courseAssessment.post.score)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(courseAssessment.post.date)}
                                  </span>
                                </>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold w-fit bg-red-100 text-red-800">
                                  ✗ Not Taken
                                </span>
                              )}
                            </div>

                            {/* Availability Status - Enabled only if course completed AND pre-assessment taken */}
                            {courseCompleted && courseAssessment.pre && !courseAssessment.post ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit bg-blue-200 text-blue-700">
                                🔓 Enabled
                              </span>
                            ) : courseAssessment.post ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit bg-gray-200 text-gray-700">
                                🔒 Disabled
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit bg-gray-200 text-gray-700">
                                🔒 Disabled
                                <span className="block text-[10px] mt-1">
                                  {!courseAssessment.pre 
                                    ? "(Pre required)" 
                                    : "(Course incomplete)"}
                                </span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center flex justify-center gap-3">
                          <button
                            onClick={() => toggleExpandUser(user.user_id)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteUser(user.user_id, user.username)
                            }
                            disabled={deleting === user.user_id}
                            className={`p-2 rounded-full transition ${
                              deleting === user.user_id
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                            title="Delete user"
                          >
                            {deleting === user.user_id ? (
                              <FaSpinner className="animate-spin w-5 h-5" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row - Assessment Details for All Courses */}
                      {expandedUser === user.user_id && (
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              {/* All Courses Assessment Status */}
                              <div>
                                <h4 className="font-bold text-[#1A202C] text-[16px] mb-3">
                                  Assessment Status by Course
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(user.assessments_by_course).map(
                                    ([courseId, courseData]) => (
                                      <div
                                        key={courseId}
                                        className="bg-white p-4 rounded-lg border border-gray-200"
                                      >
                                        <p className="font-semibold text-[#1A202C] mb-3">
                                          {courseData.course_name}
                                        </p>
                                        
                                        <div className="space-y-2">
                                          {/* Pre-Assessment */}
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Pre-Assessment:</span>
                                            {courseData.pre ? (
                                              <div className="text-right">
                                                <span className="font-semibold text-green-600">
                                                  {formatScore(courseData.pre.score)}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                  {formatDate(courseData.pre.date)}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-red-600 font-semibold">
                                                Not Taken
                                              </span>
                                            )}
                                          </div>

                                          {/* Post-Assessment */}
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Post-Assessment:</span>
                                            {courseData.post ? (
                                              <div className="text-right">
                                                <span className="font-semibold text-green-600">
                                                  {formatScore(courseData.post.score)}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                  {formatDate(courseData.post.date)}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-red-600 font-semibold">
                                                Not Taken
                                              </span>
                                            )}
                                          </div>

                                          {/* Course Progress */}
                                          <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                                            <span className="text-gray-600">Course Status:</span>
                                            <span
                                              className={`font-semibold ${
                                                user.course_progress[courseId]?.status === "completed"
                                                  ? "text-green-600"
                                                  : "text-yellow-600"
                                              }`}
                                            >
                                              {user.course_progress[courseId]?.status === "completed"
                                                ? "✓ Completed"
                                                : "○ In Progress"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;