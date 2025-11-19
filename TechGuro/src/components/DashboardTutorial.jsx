// src/components/DashboardTutorial.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Tutorial slides data
const tutorialSections = [
  {
    id: "dashboard",
    title: "Dashboard Tutorial",
    slides: [
      {
        image: "/src/assets/Dashboard/dashboard_slide1.png",
        title: "Welcome to Your Dashboard",
        description: "Ito ang iyong personal dashboard kung saan makikita mo ang lahat ng iyong learning progress at available courses."
      },
      {
        image: "/src/assets/Dashboard/dashboard_slide2.png",
        title: "Your Milestones",
        description: "Dito mo makikita ang mga milestone na nakuha mo habang nag-aaral. Bawat achievement ay may special badge!"
      },
      {
        image: "/src/assets/Dashboard/dashboard_slide3.png",
        title: "History Section",
        description: "Tingnan ang iyong mga scores mula sa Pre-Assessment, Post-Assessment, at lahat ng quizzes na iyong tinake."
      },
      {
        image: "/src/assets/Dashboard/dashboard_slide4.png",
        title: "Available Courses",
        description: "Makikita mo dito ang lahat ng available courses sa TechGuro. Piliin kung alin ang gusto mong simulan!"
      }
    ]
  },
  {
    id: "journey",
    title: "Learning Journey",
    slides: [
      {
        image: "/src/assets/Dashboard/Journey_slide1.png",
        title: "Pre-Assessment",
        description: "Magsimula sa Pre-Assessment para malaman ni Teki kung anong mga lesson ang dapat mong pag-tuunan ng pansin."
      },
      {
        image: "/src/assets/Dashboard/Journey_slide2.png",
        title: "Teki's Recommended Lessons",
        description: "Based sa iyong Pre-Assessment results, makikita mo dito ang mga lesson na specially recommended ni Teki para sa iyo."
      },
      {
        image: "/src/assets/Dashboard/Journey_slide3.png",
        title: "Taking Lessons",
        description: "Mag-aral gamit ang bite-sized lessons na may text, images, at audio. Complete each lesson para mag-progress!"
      },
      {
        image: "/src/assets/Dashboard/Journey_slide4.png",
        title: "Practice with Quizzes",
        description: "Subukan ang iyong kaalaman sa 3 types ng quiz: Drag & Drop, Image Recognition, at Typing Quiz. Practice makes perfect!"
      },
      {
        image: "/src/assets/Dashboard/Journey_slide5.png",
        title: "Post-Assessment",
        description: "Tapusin ang lahat ng recommended lessons para ma-unlock ang Post-Assessment at makumpleto ang course!"
      }
    ]
  }
];

const DashboardTutorial = ({ isOpen, onClose, startSection = "dashboard" }) => {
  const [activeSection, setActiveSection] = useState(startSection);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Get current section and slide
  const currentSection = tutorialSections.find(s => s.id === activeSection);
  const currentSlide = currentSection?.slides[currentSlideIndex];
  const totalSlides = currentSection?.slides.length || 0;

  // Navigation handlers
  const handleNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // Move to next section
      const currentSectionIndex = tutorialSections.findIndex(s => s.id === activeSection);
      if (currentSectionIndex < tutorialSections.length - 1) {
        setActiveSection(tutorialSections[currentSectionIndex + 1].id);
        setCurrentSlideIndex(0);
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else {
      // Move to previous section
      const currentSectionIndex = tutorialSections.findIndex(s => s.id === activeSection);
      if (currentSectionIndex > 0) {
        const prevSection = tutorialSections[currentSectionIndex - 1];
        setActiveSection(prevSection.id);
        setCurrentSlideIndex(prevSection.slides.length - 1);
      }
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setCurrentSlideIndex(0);
  };

  const isFirstSlide = () => {
    return tutorialSections.findIndex(s => s.id === activeSection) === 0 && currentSlideIndex === 0;
  };

  const isLastSlide = () => {
    const currentSectionIndex = tutorialSections.findIndex(s => s.id === activeSection);
    return currentSectionIndex === tutorialSections.length - 1 && currentSlideIndex === totalSlides - 1;
  };

  if (!isOpen || !currentSlide) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-[300]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[95%] max-w-[1200px] h-[90vh] z-[301] flex flex-col md:flex-row overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            {/* Sidebar Navigation - Hidden on mobile, visible on md+ */}
            <div className="hidden md:flex md:w-64 bg-gradient-to-b from-[#4C5173] to-[#6B708D] text-white p-6 flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">TechGuro Tutorial</h2>
              
              <nav className="space-y-3">
                {tutorialSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? "bg-white text-[#4C5173] font-bold shadow-lg"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        activeSection === section.id
                          ? "bg-[#4C5173] text-white"
                          : "bg-white/20"
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm">{section.title}</span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Progress Indicator */}
              <div className="mt-auto pt-6 border-t border-white/20">
                <p className="text-sm text-white/70 mb-2">Overall Progress</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((tutorialSections.findIndex(s => s.id === activeSection) * 100 + (currentSlideIndex + 1) / totalSlides * 100) / tutorialSections.length)}%`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Section Tabs - Visible only on mobile */}
            <div className="md:hidden w-full bg-[#4C5173] flex">
              {tutorialSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex-1 py-3 text-center font-semibold transition-all ${
                    activeSection === section.id
                      ? "bg-white text-[#4C5173]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <div className="text-xs mb-1">Part {index + 1}</div>
                  <div className="text-sm">{section.title}</div>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <X className="w-6 h-6 text-black" />
              </button>

              {/* Content with Navigation */}
              <div className="flex-1 flex items-center justify-between p-4 md:p-8">
                {/* Left Chevron */}
                <button
                  onClick={handlePrevSlide}
                  disabled={isFirstSlide()}
                  className={`flex-shrink-0 p-2 md:p-3 rounded-full transition-all ${
                    isFirstSlide()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Center Content */}
                <div className="flex-1 flex flex-col items-center justify-center mx-4 md:mx-8">
                  {/* Image */}
                  <motion.div
                    key={`${activeSection}-${currentSlideIndex}`}
                    className="w-full h-[40vh] md:h-[50vh] mb-4 md:mb-6 flex items-center justify-center"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                      <p className="text-gray-500">Image placeholder</p>
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <motion.div
                    key={`text-${activeSection}-${currentSlideIndex}`}
                    className="text-center max-w-2xl px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <h3 className="text-2xl md:text-3xl font-bold text-[#4C5173] mb-2 md:mb-3">
                      {currentSlide.title}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-600">
                      {currentSlide.description}
                    </p>
                  </motion.div>

                  {/* Slide Progress Dots */}
                  <div className="flex gap-2 mt-4 md:mt-6">
                    {currentSection.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                          index === currentSlideIndex
                            ? "bg-[#4C5173] w-6 md:w-8"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Finish Button - Only on Last Slide */}
                  {isLastSlide() && (
                    <motion.button
                      onClick={onClose}
                      className="mt-4 md:mt-6 px-6 md:px-8 py-2 md:py-3 bg-[#B6C44D] text-black rounded-lg font-semibold text-base md:text-lg hover:bg-[#a5b83d] transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Tapos na! Simulan ang Pag-aaral
                    </motion.button>
                  )}
                </div>

                {/* Right Chevron */}
                <button
                  onClick={handleNextSlide}
                  disabled={isLastSlide()}
                  className={`flex-shrink-0 p-2 md:p-3 rounded-full transition-all ${
                    isLastSlide()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
                  }`}
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Bottom Section Info */}
              <div className="bg-gray-50 px-4 md:px-8 py-3 md:py-4 border-t">
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                  <span>Section {tutorialSections.findIndex(s => s.id === activeSection) + 1} of {tutorialSections.length}</span>
                  <span>Slide {currentSlideIndex + 1} of {totalSlides}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DashboardTutorial;