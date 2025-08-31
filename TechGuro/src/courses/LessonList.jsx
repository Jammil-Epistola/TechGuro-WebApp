import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseNavbar from './courseNavbar';
import { useUser } from '../context/UserContext';
import placeholderimg from "../assets/Dashboard/placeholder_teki.png";

const LessonList = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const { user } = useUser();
  const [lessonsData, setLessonsData] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [completedActivities, setCompletedActivities] = useState(false);
  const [activeSection, setActiveSection] = useState('recommended');
  const [postAssessmentUnlocked, setPostAssessmentUnlocked] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  const formattedTitle = courseName.replace(/([A-Z])/g, ' $1').trim();

  const normalize = (str) => str.toLowerCase().replace(/[\s_-]+/g, '');

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/courses`);
      if (!res.ok) throw new Error("Failed to fetch courses list.");
      const courses = await res.json();

      const matchedCourse = courses.find(
        c => normalize(c.title) === normalize(courseName)
      );
      if (!matchedCourse) {
        console.error(`No course found for ${courseName}`);
        return;
      }

      const courseId = matchedCourse.id;

      const lessonsRes = await fetch(`http://localhost:8000/lesson-courses/${courseId}`);
      if (!lessonsRes.ok) throw new Error("Failed to fetch lessons data.");
      const lessonsData = await lessonsRes.json();
      setLessonsData(lessonsData);

      // UPDATED: Use new BKT recommendations endpoint instead of old progress endpoint
      try {
        const bktRes = await fetch(
          `http://localhost:8000/bkt/recommendations/${user.user_id}/${courseId}?threshold=0.7&limit=10`
        );

        if (!bktRes.ok) throw new Error("Failed to fetch BKT recommendations.");
        const bktData = await bktRes.json();

        console.log("BKT recommendations data:", bktData);

        // Extract recommended lessons from BKT response
        setRecommendedLessons(bktData.recommended_lessons || []);

        // Fetch progress (completed lessons + unlock status)
        const progressRes = await fetch(
          `http://localhost:8000/progress-recommendations/${user.user_id}/${courseId}`
        );

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setCompletedLessons(progressData.completed_lessons || []);
          setCompletedActivities(progressData.completed_activities || false);
          setPostAssessmentUnlocked(progressData.post_assessment_unlocked || false); // ✅ NEW
        } else {
          console.warn("Progress endpoint failed, assuming no completed lessons");
          setCompletedLessons([]);
          setCompletedActivities(false);
          setPostAssessmentUnlocked(false);
        }

      } catch (bktError) {
        console.error("BKT recommendations failed:", bktError);

        // Fallback to old endpoint if BKT fails
        try {
          const progressRes = await fetch(
            `http://localhost:8000/progress-recommendations/${user.user_id}/${courseId}`
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setCompletedLessons(progressData.completed_lessons || []);
            setRecommendedLessons(progressData.recommended_lessons || []);
            setCompletedActivities(progressData.completed_activities || false);
            setPostAssessmentUnlocked(progressData.post_assessment_unlocked || false); // ✅ NEW
          }
        } catch (fallbackError) {
          console.error("All recommendation endpoints failed:", fallbackError);
          setCompletedLessons([]);
          setRecommendedLessons([]);
          setCompletedActivities(false);
          setPostAssessmentUnlocked(false);
        }
      }

    } catch (err) {
      console.error("Error fetching course data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourseData();
    }
  }, [user, courseName]);

  const handleStartLesson = (lessonId) => {
    navigate(`/courses/${courseName}/lesson`, {
      state: { lessonId }
    });
  };

  const handlePostAssessment = () => {
    if (!postAssessmentUnlocked) {
      // Show Teki dialog with unlock reason
      setUnlockReason(progressData?.unlock_reason || "Post-Assessment is locked.");
      return;
    }
    navigate(`/courses/${courseName}/Post-assessment`);
  };

  const TekiDialog = ({ message, onClose }) => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border-2 border-[#6B708D] rounded-2xl shadow-lg p-4 flex items-center gap-4 max-w-lg">
        <img src={placeholderimg} alt="Teki" className="w-14 h-14 rounded-full border border-black" />
        <div className="flex-1">
          <p className="font-bold text-[#4C5173]">Teki</p>
          <p className="text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-lg font-bold text-gray-600">✖</button>
      </div>
    </div>
  );

  if (!lessonsData) {
    return <div className="p-10 text-[20px] font-bold text-center">Loading lessons...</div>;
  }

  return (
    <div className="min-h-screen bg-[#DFDFEE] text-black">
      <CourseNavbar courseTitle={formattedTitle} />

      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-[300px] bg-[#BFC4D7] p-4 sticky top-0 h-screen overflow-y-auto border-r border-gray-400">

          {/* Course Header */}
          <div className="flex items-center gap-4 mb-6">
            <img src={placeholderimg} alt="Teki" className="w-16 h-16 rounded-full border border-black" />
            <h2 className="text-[20px] font-bold">{formattedTitle}</h2>
          </div>

          {/* Recommended Lessons */}
          <div
            onClick={() => setActiveSection('recommended')}
            className={`p-4 mb-2 rounded cursor-pointer transition ${activeSection === 'recommended' ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
          >
            <div className="font-bold text-[16px] mb-1">TEKI'S RECOMMENDED LESSONS</div>
            <div className="text-[14px]">Lessons based on your pre-assessment</div>
          </div>

          {/* Units */}
          {Array.isArray(lessonsData?.units) && lessonsData.units.map((unit, index) => (
            <div
              key={unit.unit_id}
              onClick={() => setActiveSection(index)}
              className={`p-4 mb-2 rounded cursor-pointer transition ${activeSection === index ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
            >
              <div className="font-bold text-[16px] mb-1">UNIT {index + 1}:</div>
              <div className="text-[14px]">{unit.unit_title}</div>
            </div>
          ))}

          {/* Activities */}
          <div
            onClick={() => setActiveSection('activities')}
            className={`p-4 mb-2 rounded cursor-pointer transition ${activeSection === 'activities' ? 'bg-[#F4EDD9]' : 'hover:bg-[#e2e6f1]'}`}
          >
            <div className="font-bold text-[16px] mb-1">ACTIVITIES</div>
            <div className="text-[14px]">Practice exercises</div>
          </div>

          {/* Post-Assessment */}
          <div className="mt-6">
            <button
              onClick={() => {
                if (postAssessmentUnlocked) {
                  handlePostAssessment();
                } else {
                  setUnlockReason("Hold on! You need to finish your recommended lessons before unlocking this assessment!");
                }
              }}
              className={`w-full px-4 py-3 rounded font-bold text-[16px] ${postAssessmentUnlocked
                  ? "bg-[#B6C44D] text-black hover:bg-[#a5b83d]"
                  : "bg-gray-400 text-white hover:bg-gray-500"
                }`}
            >
              Post-Assessment
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'recommended' ? (
            <>
              <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">
                Teki’s Recommended Lessons
              </h1>
              <p className="text-[16px] mb-6">
                Based on your Pre-Assessment. Here are lessons to improve your knowledge of the course.
              </p>
              <div className="flex flex-col gap-5">
                {recommendedLessons.length === 0 ? (
                  <p className="text-[16px] italic text-gray-700">No recommendations yet.</p>
                ) : (
                  lessonsData.units?.flatMap(unit =>
                    unit.lessons.filter(lesson => recommendedLessons.includes(lesson.lesson_id))
                  ).map(lesson => {
                    const isCompleted = completedLessons.includes(lesson.lesson_id);
                    return (
                      <div
                        key={lesson.lesson_id}
                        className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 flex justify-between items-center"
                      >
                        <div>
                          <h2 className="text-[20px] font-bold mb-2">
                            {lesson.lesson_title}
                          </h2>
                          {isCompleted && (
                            <p className="text-green-700 font-bold mt-1 text-[14px]">✓ Completed</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartLesson(lesson.lesson_id)}
                          className="px-6 py-2 rounded font-semibold text-[16px] bg-[#B6C44D] text-black hover:bg-[#a5b83d]"
                        >
                          {isCompleted ? "Review" : "Start"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : activeSection === 'activities' ? (
            <>
              <h1 className="text-[24px] font-bold text-[#4C5173] mb-4">Activities</h1>
              <p className="text-[16px] italic text-gray-700">Activity section coming soon...</p>
            </>
          ) : (
            typeof activeSection === "number" &&
            lessonsData?.units?.[activeSection] && (
              <>
                <h1 className="text-[24px] font-bold text-[#4C5173] mb-6">
                  UNIT {activeSection + 1}: {lessonsData.units[activeSection].unit_title}
                </h1>
                <div className="flex flex-col gap-5">
                  {lessonsData.units[activeSection].lessons.map(lesson => {
                    const isCompleted = completedLessons.includes(lesson.lesson_id);
                    const isRecommended = recommendedLessons.includes(lesson.lesson_id);

                    return (
                      <div
                        key={lesson.lesson_id}
                        className="bg-[#F9F8FE] border border-[#6B708D] rounded-lg p-6 flex justify-between items-center"
                      >
                        <div>
                          <h2 className="text-[20px] font-bold mb-2">{lesson.lesson_title}</h2>
                          <p className="text-[16px]">{lesson.slides?.[0]?.content?.[0] ?? ""}</p>
                          {isCompleted && (
                            <p className="text-green-700 font-bold mt-1 text-[14px]">✓ Completed</p>
                          )}
                          {isRecommended && (
                            <p className="text-yellow-700 font-semibold text-[14px] mt-1">★ Recommended</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartLesson(lesson.lesson_id)}
                          className="px-6 py-2 rounded font-semibold text-[16px] bg-[#B6C44D] text-black hover:bg-[#a5b83d]"
                        >
                          {isCompleted ? "Review" : "Start"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )

          )}
          {/* Global Teki Dialog */}
          {unlockReason && (
            <TekiDialog
              message={unlockReason}
              onClose={() => setUnlockReason("")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonList;
