//courseNavbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaCalendar,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaHome,
  FaBook,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { BookOpen, ExternalLink, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/TechGuroLogo_2.png";
import { useUser } from "../context/UserContext";
import TekiDialog from "../components/TekiDialog";
import API_URL from "../config/api";

const CourseNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  
  // NEW: Sources Modal State
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState(null);
  const [loadingSources, setLoadingSources] = useState(false);
  
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user, logout } = useUser();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // NEW: Fetch course ID when courseName changes
  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const response = await fetch(`${API_URL}/courses`);
        const courses = await response.json();
        
        const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');
        
        const matchedCourse = courses.find(
          c => normalize(c.title) === normalize(courseName)
        );
        
        if (matchedCourse) {
          setCourseId(matchedCourse.id);
        }
      } catch (error) {
        console.error('Error fetching course ID:', error);
      }
    };
    
    if (courseName) {
      fetchCourseId();
    }
  }, [courseName]);

  // NEW: Fetch sources when modal opens
  const fetchSources = async () => {
    if (!courseId) return;
    
    setLoadingSources(true);
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/sources`);
      if (!response.ok) throw new Error('Failed to fetch sources');
      
      const data = await response.json();
      setSources(data.sources || []);
      setCourseTitle(data.course_title || '');
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoadingSources(false);
    }
  };

  // NEW: Open sources modal
  const handleSourcesClick = () => {
    setIsSourcesModalOpen(true);
    fetchSources();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLessonsClick = () => {
    if (location.pathname.includes("pre-assessment")) {
      setUnlockMessage("Complete the Pre-Assessment first to unlock this function!");
    } else {
      navigate(`/courses/${courseName}`);
    }
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate("/UserDashboard");
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-6 py-4 bg-[#4C5173] text-white h-[70px] relative">
        {/* Left Side Logo + Title */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src={Logo}
            alt="TechGuro Logo"
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <h1 className="text-lg md:text-2xl font-bold">TechGuro.</h1>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-6">
          {/* Date */}
          <div className="flex items-center gap-2 text-[16px]">
            <FaCalendar className="text-[20px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20" />

          {/* Dashboard Link */}
          <button
            onClick={() => navigate("/UserDashboard")}
            className="text-[16px] font-medium hover:underline"
          >
            Dashboard
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20" />

          {/* Sources Button */}
          <button
            onClick={handleSourcesClick}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-[15px] font-medium"
            title="View course sources"
          >
            <BookOpen className="w-4 h-4" />
            <span>Sources</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20" />

          {/* User Dropdown */}
          <div className="relative user-dropdown">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
              onClick={toggleDropdown}
            >
              <FaUser className="text-white text-[20px]" />
              <span className="text-white font-medium">
                {user?.username || "User"}
              </span>
              <FaChevronDown className="text-white" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-56 z-50 overflow-hidden">
                <div
                  onClick={() => navigate("/UserDashboard")}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                >
                  <FaHome />
                  <span>Return to Dashboard</span>
                </div>

                <div
                  onClick={handleLessonsClick}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                >
                  <FaBook />
                  <span>Lessons</span>
                </div>

                <hr className="border-t border-gray-200" />

                <div
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <FaCalendar className="text-[16px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="text-white text-2xl p-2 hover:bg-white/10 rounded transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[70px] right-0 left-0 bg-white text-black shadow-lg z-50 md:hidden">
            <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border-b border-gray-200">
              <FaUser className="text-[#4C5173] text-[20px]" />
              <span className="font-medium text-[#4C5173]">
                {user?.username || "User"}
              </span>
            </div>

            <div
              onClick={handleDashboardClick}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition cursor-pointer border-b border-gray-100"
            >
              <FaHome className="text-[18px]" />
              <span>Return to Dashboard</span>
            </div>

            <div
              onClick={handleLessonsClick}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition cursor-pointer border-b border-gray-100"
            >
              <FaBook className="text-[18px]" />
              <span>Lessons</span>
            </div>

            {/* Sources Button for Mobile */}
            <div
              onClick={handleSourcesClick}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition cursor-pointer border-b border-gray-100"
            >
              <BookOpen className="w-[18px] h-[18px]" />
              <span>Course Sources</span>
            </div>

            <div
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <FaSignOutAlt className="text-[18px]" />
              <span>Sign Out</span>
            </div>
          </div>
        )}
      </nav>

      {/* Sources Modal */}
      <AnimatePresence>
        {isSourcesModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSourcesModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-[80] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#4C5173] to-[#6B708D] p-6 text-white relative">
                  <button
                    onClick={() => setIsSourcesModalOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Course Sources</h2>
                      <p className="text-blue-100 text-sm mt-1">{courseTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {loadingSources ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#4C5173] animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Description */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Content for this course has been adapted and modified from the sources listed below to fit the TechGuro learning system.
                        </p>
                      </div>

                      {/* Sources List */}
                      {sources.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No sources available for this course.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sources.map((source, index) => (
                            <motion.div
                              key={index}
                              className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#4C5173] hover:shadow-md transition-all group"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800 group-hover:text-[#4C5173] transition-colors mb-2">
                                    {source.name}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-white border border-gray-200">
                                      {source.type === 'primary' ? '📚 Primary Source' : '📖 Supplementary'}
                                    </span>
                                  </div>
                                </div>

                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4C5173] hover:bg-[#3a3f5c] rounded-lg transition-all transform hover:scale-105 whitespace-nowrap"
                                >
                                  Visit
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Teki Dialog */}
      {unlockMessage && (
        <TekiDialog
          message={unlockMessage}
          onClose={() => setUnlockMessage("")}
        />
      )}
    </>
  );
};

export default CourseNavbar;