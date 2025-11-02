//HomePage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import Navbar from "./HomeNavbar";
import { FaEnvelope, FaPhone, FaBookOpen } from "react-icons/fa";
import home_background1 from "../assets/Home/home_background1.jpg";
import about_image from "../assets/Home/about_image.png";
import jammil_img from "../assets/Home/jammil_photo.png";
import raquel_img from "../assets/Home/raquel_photo.jpg";
import angel_img from "../assets/Home/angel_photo.jpg";
import CB_img from "../assets/Home/computer_basics_imghead.png";
import DCM_img from "../assets/Home/digi_comms_imghead.png";
import IS_img from "../assets/Home/internet_safety_imghead.png";
import tutorial_slide1 from "../assets/Home/tutorial_slide1.png";
import tutorial_slide2 from "../assets/Home/tutorial_slide2.png";
import tutorial_slide3 from "../assets/Home/tutorial_slide3.png";

const courses = [
  {
    title: "Computer Basics",
    image: CB_img,
    description: "Learn how to navigate and use a computer for daily tasks with ease.",
    lessons: 5,
    keyPoints: [
      "Using a mouse and keyboard",
      "Managing files and folders",
      "Installing applications",
      "Basic troubleshooting"
    ],
  },
  {
    title: "Internet Safety",
    image: IS_img,
    description: "Stay safe online by understanding how to protect your information.",
    lessons: 5,
    keyPoints: [
      "Recognizing fake news",
      "Safe social media practices",
      "Avoiding malware",
      "Online privacy tips"
    ],
  },
  {
    title: "Digital Communication & Messaging",
    image: DCM_img,
    description: "Learn how to communicate effectively online using different platforms.",
    lessons: 5,
    keyPoints: [
      "Using email and messaging apps",
      "Online etiquette and safety",
      "Video conferencing basics",
      "Effective digital writing"
    ],
  },
];

// Tutorial slides with Cloudinary URLs
const tutorialSlides = [
  {
    image: tutorial_slide1,
    title: "Step 1: Gumawa ng Account o Mag-Sign In",
    description: "Bago sa TechGuro? I-click ang 'Sign Up' para gumawa ng account. May account na? I-click ang 'Sign In' para magsimula."
  },
  {
    image: tutorial_slide2,
    title: "Step 2: Punan ang Iyong Detalye",
    description: "I-enter ang iyong email, username, password, at birthday para makagawa ng TechGuro account. Siguraduhing tanggapin ang Terms and Conditions."
  },
  {
    image: tutorial_slide3,
    title: "Step 3: Mag-Log In at Magsimulang Matuto",
    description: "Gamitin ang iyong email at password para mag-log in. Pagkapasok, makikita mo ang dashboard kung saan pwede kang pumili ng courses at subaybayan ang iyong progress."
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("About");
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialSlide, setCurrentTutorialSlide] = useState(0);


  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Home Section */}
      <section
        id="home"
        className="relative flex items-center h-screen bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: `url(${home_background1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black from-0% via-black/90 via-50% to-black/20 to-100% z-0"></div>
        <div className="relative z-10 max-w-3xl px-6 md:px-16 lg:px-24">
          <h2 className="text-[2rem] md:text-[2.5rem] font-bold mb-[-0.5rem]">LEARNING</h2>
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold leading-tight">COMPUTER LITERACY</h1>
          <p className="text-[1.2rem] md:text-[1.5rem] mt-4 text-justify">
            TechGuro helps adults and elderly learners build essential computer skills through beginner-friendly lessons and AI-based learning paths.
          </p>
          <div className="mt-8 flex justify-center md:justify-start space-x-[20px]">
            <a
              href="#about"
              className="px-6 py-3 md:px-8 md:py-4 text-[1.2rem] md:text-[1.5rem] font-bold rounded bg-[#6b6f92] text-white hover:bg-[#5a5d85] transition-colors"
            >
              Learn More
            </a>
            <button
              onClick={() => setShowTutorial(true)}
              className="px-6 py-3 md:px-8 md:py-4 text-[1.2rem] md:text-[1.5rem] font-bold rounded bg-[#2E6F40] text-white hover:bg-[#06402B] transition-colors"
            >
              Get Started
            </button>
          </div>

        </div>

        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/70 z-[300]"
                onClick={() => {
                  setShowTutorial(false);
                  setCurrentTutorialSlide(0);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Modal */}
              <motion.div
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[95%] max-w-[900px] h-[85vh] sm:h-[80vh] z-[301] flex flex-col overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                {/* Close Button - Black X */}
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    setCurrentTutorialSlide(0);
                  }}
                  className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                >
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Content with Side Navigation */}
                <div className="flex-1 flex items-center justify-between p-4 md:p-8">
                  {/* Left Chevron */}
                  <button
                    onClick={() => setCurrentTutorialSlide(Math.max(0, currentTutorialSlide - 1))}
                    disabled={currentTutorialSlide === 0}
                    className={`flex-shrink-0 p-3 rounded-full transition-all ${currentTutorialSlide === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Center Content */}
                  <div className="flex-1 flex flex-col items-center justify-center mx-4">
                    {/* Image */}
                    <motion.div
                      key={currentTutorialSlide}
                      className="w-full h-[50%] sm:h-[60%] mb-6 flex items-center justify-center"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={tutorialSlides[currentTutorialSlide].image}
                        alt={tutorialSlides[currentTutorialSlide].title}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      />
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                      key={`text-${currentTutorialSlide}`}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <h3 className="text-2xl md:text-3xl font-bold text-[#4C5173] mb-3">
                        {tutorialSlides[currentTutorialSlide].title}
                      </h3>
                      <p className="text-lg md:text-xl text-gray-600 max-w-[600px] mx-auto">
                        {tutorialSlides[currentTutorialSlide].description}
                      </p>
                    </motion.div>

                    {/* Progress Dots */}
                    <div className="flex gap-2 mt-6">
                      {tutorialSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTutorialSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all ${index === currentTutorialSlide
                            ? "bg-[#4C5173] w-8"
                            : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        />
                      ))}
                    </div>

                    {/* Get Started Button - Only on Last Slide */}
                    {currentTutorialSlide === tutorialSlides.length - 1 && (
                      <motion.button
                        onClick={() => navigate("/login")}
                        className="mt-6 px-8 py-3 bg-[#B6C44D] text-black rounded-lg font-semibold text-lg hover:bg-[#a5b83d] transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Get Started Now!
                      </motion.button>
                    )}
                  </div>

                  {/* Right Chevron */}
                  <button
                    onClick={() => setCurrentTutorialSlide(Math.min(tutorialSlides.length - 1, currentTutorialSlide + 1))}
                    disabled={currentTutorialSlide === tutorialSlides.length - 1}
                    className={`flex-shrink-0 p-3 rounded-full transition-all ${currentTutorialSlide === tutorialSlides.length - 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative flex flex-col justify-center items-center min-h-screen bg-[#229799] px-4 md:px-8 pt-6"
      >
        <div className="relative w-full max-w-[1400px] min-h-[80vh] bg-[#48CFCB] shadow-lg overflow-hidden text-black flex flex-col">
          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "About" && (
                <motion.div
                  key="about-tab"
                  className="flex flex-col lg:flex-row h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Left Side Image */}
                  <motion.div className="w-full lg:w-1/3 h-64 lg:h-full flex-shrink-0 flex justify-center items-center overflow-hidden p-2 md:p-4 bg-[#282c4a]">
                    <img
                      src={about_image}
                      alt="About TechGuro"
                      className="w-full h-full object-cover object-[10%_40%] scale-[1.1] lg:object-scale-down lg:scale-[1.2]"
                    />
                  </motion.div>

                  {/* Right Side Text */}
                  <motion.div className="w-full lg:w-2/3 flex flex-col justify-center items-start text-left p-4 md:p-8 overflow-y-auto max-h-[60vh] lg:max-h-full">
                    <h2 className="text-[2.2rem] font-bold mb-4">About TechGuro</h2>
                    <p className="text-[1.2rem] leading-relaxed text-justify">
                      TechGuro is a platform that helps adults and seniors gain essential computer skills.
                      It addresses digital illiteracy by offering beginner-friendly lessons on everyday tasks—like managing files, using software, and staying safe online.
                      <br /><br />
                      By bridging the digital gap, TechGuro empowers learners with independence, confidence, and stronger connections in a technology-driven world.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "Researchers" && (
                <motion.div
                  key="researchers-tab"
                  className="flex flex-col h-full p-4 md:p-6 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-[1.8rem] sm:text-[2.2rem] text-center mb-4">THE RESEARCHERS</h2>
                  <hr className="w-full max-w-[50rem] mx-auto h-[3px] bg-white border-none mb-6" />

                  <div className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 w-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-4 lg:pb-0 px-4 lg:px-0">
                    {[
                      { name: "Jammil C. Epistola", email: "epistolajammil45@gmail.com", phone: "0921 729 4657", image: jammil_img },
                      { name: "Raquel H. Javier", email: "raquelhiraojavier@gmail.com", phone: "0991 584 9104", image: raquel_img },
                      { name: "Angel B. Ojoy", email: "ojoyangel14@gmail.com", phone: "0992 627 6650", image: angel_img },
                    ].map((res, idx) => (
                      <motion.div
                        key={idx}
                        className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[270px] lg:w-full rounded-lg shadow-md overflow-hidden snap-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ delay: idx * 0.3, duration: 0.6 }}
                      >
                        <div className="bg-[#4C5173] flex justify-center items-center p-4">
                          <div
                            className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[180px] md:h-[180px] rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${res.image})` }}
                          ></div>
                        </div>
                        <div className="bg-[#F9F8FE] text-black text-center p-4 md:p-6">
                          <h3 className="text-[1.1rem] sm:text-[1.2rem] md:text-[1.3rem] font-bold mb-2">{res.name}</h3>
                          <p className="flex items-center justify-center gap-2 text-xs sm:text-sm break-all">
                            <FaEnvelope className="text-black flex-shrink-0" />
                            <span className="break-all">{res.email}</span>
                          </p>
                          <p className="flex items-center justify-center gap-2 mt-1 text-xs sm:text-sm">
                            <FaPhone className="text-black flex-shrink-0" />
                            {res.phone}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab Bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row items-end">
            <button
              onClick={() => setActiveTab("About")}
              className={`w-full sm:flex-1 font-bold border transition-all duration-200
          ${activeTab === "About"
                  ? "bg-[#6B708D] border-[#F9F8FE] text-white h-[4rem] sm:h-[4rem] text-[1rem] sm:text-[1.2rem]"
                  : "bg-[#F9F8FE] border-[#6B708D] text-black h-[3.5rem] sm:h-[3.5rem] text-[0.9rem] sm:text-[1rem] hover:bg-[#e7e6f1]"
                }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("Researchers")}
              className={`w-full sm:flex-1 font-bold border transition-all duration-200
          ${activeTab === "Researchers"
                  ? "bg-[#6B708D] border-[#F9F8FE] text-white h-[4rem] sm:h-[4rem] text-[1rem] sm:text-[1.2rem]"
                  : "bg-[#F9F8FE] border-[#6B708D] text-black h-[3.5rem] sm:h-[3.5rem] text-[0.9rem] sm:text-[1rem] hover:bg-[#e7e6f1]"
                }`}
            >
              Researchers
            </button>
          </div>
        </div>
      </section>


      {/* Courses Section */}
      <section
        id="courses"
        className="min-h-screen flex flex-col justify-center items-center text-center bg-[#BFC4D7] text-white px-4 md:px-8 pt-[100px] pb-12"
      >
        <h2 className="text-[2.5rem] font-bold">TechGuro Courses</h2>
        <p className="text-[1.2rem] font-bold text-black mb-8">| We have the Following Categories |</p>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-[1500px]">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              className="w-full max-w-[25rem] h-[25rem] rounded-xl shadow-md overflow-hidden cursor-pointer mx-auto bg-[#F9F8FE] border border-[#6B708D] flex justify-center items-center"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCourse(course)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="w-full h-full flex justify-center items-center p-4 shadow-lg rounded-xl">
                <img src={course.image} alt={course.title} className="w-full h-full object-contain rounded-xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black z-[200]"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={() => setSelectedCourse(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Modal */}
              <motion.div
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl w-[95%] max-w-[1400px] h-[85vh] sm:h-[90vh] z-[201] flex flex-col lg:flex-row overflow-hidden"
                layoutId={selectedCourse.title}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                {/* Left: Image */}
                <div className="w-full lg:w-[45%] h-[40%] lg:h-full bg-[#BFC4D7] flex justify-center items-center p-2 md:p-4">
                  <motion.img
                    src={selectedCourse.image}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover lg:object-contain rounded-lg shadow-lg"
                    layoutId={selectedCourse.title}
                  />
                </div>

                {/* Right: Text / Content */}
                <div className="w-full lg:w-[55%] h-[60%] lg:h-full bg-[#F9F8FE] p-4 md:p-8 flex flex-col overflow-y-auto">
                  <h2 className="text-[2.2rem] md:text-[3rem] font-bold mb-6 text-[#333]">{selectedCourse.title}</h2>

                  <div className="flex items-center gap-2 text-[1.2rem] md:text-[1.4rem] text-[#666] mb-6 md:mb-8">
                    <FaBookOpen className="text-[1.4rem] md:text-[1.6rem] text-[#4c5173]" />
                    <span>{selectedCourse.lessons} Lessons Available</span>
                  </div>

                  <p className="text-[1.1rem] md:text-[1.3rem] leading-relaxed text-[#555] mb-6 md:mb-10">
                    {selectedCourse.description}
                  </p>

                  <ul className="list-none mb-6 md:mb-8">
                    {selectedCourse.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-center gap-2 text-[1rem] md:text-[1.2rem] text-[#444] mb-3 bg-white p-3 md:p-4 rounded-lg shadow-sm">
                        ✅ {point}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button
                      className="bg-[#4c5173] text-white w-full sm:w-1/2 py-3 md:py-4 rounded-lg text-[1.2rem] md:text-[1.4rem] font-bold transition-colors hover:bg-[#3b3f65]"
                      onClick={() => navigate("/login")}
                    >
                      Start Course
                    </button>
                    <button
                      className="bg-[#880808] text-white w-full sm:w-1/2 py-3 md:py-4 rounded-lg text-[1.2rem] md:text-[1.4rem] font-bold transition-colors hover:bg-[#FF0000]"
                      onClick={() => setSelectedCourse(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default HomePage;
