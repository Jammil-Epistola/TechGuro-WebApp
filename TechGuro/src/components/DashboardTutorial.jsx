// src/components/DashboardTutorial.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import TekiAvatar from "../assets/Teki 1.png";

// Tutorial steps configuration
const tutorialSteps = [
  {
    id: "welcome",
    type: "welcome",
    title: "Welcome to TechGuro!",
    description: "Hi! I'm Teki, your virtual guide. Let me show you around TechGuro and help you get started with your learning journey!",
  },

  // Dashboard Section Spotlights
  {
    id: "profile",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".profile-card",
    title: "Your Profile",
    description: "Ito ang iyong profile. Dito makikita mo ang iyong username, email, at bio. Makikita mo rin dito ang iyong badges at achievements!",
    position: "bottom-right",
  },
  {
    id: "recent-milestones",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".recent-milestones-section",
    title: "Recent Milestones",
    description: "Makikita mo dito ang iyong latest achievement at milestone completion progress. Kumpletuhin ang iyong learning path para makuha ang mas maraming badges!",
    position: "top",
  },
  {
    id: "assessment",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".assessment-section",
    title: "Assessment Scores",
    description: "Tingnan ang iyong assessment scores para sa bawat course. Makikita mo ang Pre-Assessment at Post-Assessment results mo dito!",
    position: "top",
  },
  {
    id: "recent-quiz",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".recent-quiz-section",
    title: "Recent Quiz",
    description: "Makikita mo dito ang iyong recent quiz attempts at scores. Ito ay magpapakita kung paano mo ginagawa sa practice!",
    position: "top",
  },
  {
    id: "performance",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".performance-overview-section",
    title: "Task Completion & Course Progression",
    description: "Ito ang iyong performance overview - makikita mo ang overall task completion rate at progress sa bawat course!",
    position: "top",
  },
  {
    id: "learning-growth",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".learning-growth-section",
    title: "Learning Growth",
    description: "Dito ang iyong learning growth metrics - assessment performance, quiz performance, at mastery progress. Sumusubaybay ito sa iyong improvement!",
    position: "top",
  },
  {
    id: "sidebar-nav",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".sidebar-nav",
    title: "Dashboard Navigation",
    description: "Gamit ang menu na ito, makaka-navigate ka sa iba't ibang sections. I-click ang 'Milestones' para magpatuloy.",
    position: "right",
    actionRequired: true,
    actionTarget: "achievements",
  },
  // Milestones Section
  {
    id: "milestones-intro",
    type: "spotlight",
    section: "achievements",
    targetSelector: ".achievements-section",
    title: "Your Milestones",
    description: "Ito ang iyong Milestones section! Nakikita mo dito ang lahat ng achievements na nakuha mo habang nag-aaral. Bawat milestone ay may special badge! I-click ang 'History' para magpatuloy.",
    position: "top",
    actionRequired: true,
    actionTarget: "history",
  },
  // History Section
  {
    id: "history-intro",
    type: "spotlight",
    section: "history",
    targetSelector: ".history-section",
    title: "Your History",
    description: "Ito ang iyong History section! Dito mo makikita ang lahat ng scores mula sa Pre-Assessment, Post-Assessment, at lahat ng quizzes na iyong tinake. I-click ang 'Courses' para magpatuloy.",
    position: "top",
    actionRequired: true,
    actionTarget: "courses",
  },
  // Courses Section
  {
    id: "courses-intro",
    type: "spotlight",
    section: "courses",
    targetSelector: ".courses-section",
    title: "Available Courses",
    description: "Ito ang iyong Courses section! Makikita mo dito ang lahat ng available courses sa TechGuro. Piliin kung alin ang gusto mong simulan!",
    position: "top",
    actionRequired: false,
  },
  // Learning Journey Section (Traditional Slides)
  {
    id: "journey",
    type: "slides",
    title: "Learning Journey",
    slides: [
      {
        image: "/src/assets/Dashboard/Journey_slide1.png",
        title: "Pre-Assessment",
        description: "Magsimula sa Pre-Assessment para malaman ni Teki kung anong mga lesson ang dapat mong pag-tuunan ng pansin.",
      },
      {
        image: "/src/assets/Dashboard/Journey_slide2.png",
        title: "Teki's Recommended Lessons",
        description: "Based sa iyong Pre-Assessment results, makikita mo dito ang mga lesson na specially recommended ni Teki para sa iyo.",
      },
      {
        image: "/src/assets/Dashboard/Journey_slide3.png",
        title: "Taking Lessons",
        description: "Mag-aral gamit ang bite-sized lessons na may text, images, at audio. Complete each lesson para mag-progress!",
      },
      {
        image: "/src/assets/Dashboard/Journey_slide4.png",
        title: "Practice with Quizzes",
        description: "Subukan ang iyong kaalaman sa 3 types ng quiz: Drag & Drop, Image Recognition, at Typing Quiz. Practice makes perfect!",
      },
      {
        image: "/src/assets/Dashboard/Journey_slide5.png",
        title: "Post-Assessment",
        description: "Tapusin ang lahat ng recommended lessons para ma-unlock ang Post-Assessment at makumpleto ang course!",
      },
    ],
  },
  // Final Dialogue
  {
    id: "final-dialogue",
    type: "spotlight",
    section: "dashboard",
    targetSelector: ".floating-profile-dropdown button",
    title: "You're All Set!",
    description:
      "Whenever you want to revisit the tutorial, tap this Profile Menu and click 'Tutorial'.",
    position: "bottom",
    spotlightPadding: 10
  }
];

const SpotlightOverlay = ({ targetElement, padding = 12 }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!targetElement) {
      setPosition(null);
      return;
    }

    let rafId = null;

    const updatePosition = () => {
      if (!targetElement) return;
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    };

    // #1 — Track any size change of the target element
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    resizeObserver.observe(targetElement);

    // #2 — Sync once AFTER scroll events using RAF (safe)
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // #3 — Initial alignment
    updatePosition();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [targetElement, padding]);

  if (!position) return null;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-[299]"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            x={position.left}
            y={position.top}
            width={position.width}
            height={position.height}
            fill="black"
            rx="12"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="black"
        opacity="0.5"
        mask="url(#spotlight-mask)"
      />
    </svg>
  );
};

// Determines whether Teki dialogue stays on TOP or BOTTOM
const getDialogueFixedPosition = (step) => {
  if (!step || step.type !== "spotlight") return "bottom";

  const topSteps = [
    "performance",
    "learning-growth",
  ];

  return topSteps.includes(step.id) ? "top" : "bottom";
};

const TekiDialogue = ({ step, onNext, onPrev, isFirst, isLast, targetElement, onNavigate, onSkip }) => {
  const [position, setPosition] = useState({ top: "50%", left: "50%" });

  useEffect(() => {
    const updatePosition = () => {
      const fixed = step.fixedPosition;
      const isMobile = window.innerWidth < 768;

      let top, left;

      if (isMobile) {
        // Mobile: Position at bottom but centered horizontally like WelcomeModal
        top = window.innerHeight - 280;
        left = window.innerWidth / 2;
      } else {
        // Desktop positioning
        if (fixed === "top") {
          top = 120;
          left = window.innerWidth / 2;
        } else {
          top = window.innerHeight - 400;
          left = window.innerWidth / 2;
        }
      }

      setPosition({
        top: `${top}px`,
        left: `${left}px`,
      });
    };

    updatePosition();

    // Update on resize
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [step.fixedPosition]);

  const handleNext = () => {
    if (step.actionRequired && step.actionTarget) {
      console.log("📍 Navigating to:", step.actionTarget);
      onNavigate(step.actionTarget);
      setTimeout(() => {
        onNext();
      }, 500);
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      className="fixed z-[302] bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-[92%] md:w-[95%] max-w-2xl border-3 border-[#4C5173]"
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Teki Character Avatar */}
      <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex-shrink-0">
          <motion.img
            src={TekiAvatar}
            alt="Teki"
            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-base md:text-lg">Teki</h3>
          <p className="text-xs md:text-sm text-gray-500">{step.title}</p>
        </div>
      </div>

      {/* Dialogue Text - Improved Readability */}
      <p className="text-gray-800 mb-6 md:mb-8 text-base md:text-lg leading-relaxed font-semibold">
        {step.description}
      </p>

      {/* Navigation Buttons - Mobile Responsive */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:justify-between md:items-center">
        {/* Skip Button - Full width on mobile */}
        <motion.button
          onClick={onSkip}
          className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all text-sm md:text-sm font-bold order-2 md:order-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip Tutorial
        </motion.button>

        {/* Back & Next Buttons */}
        <div className="flex gap-2 md:gap-3 order-1 md:order-2">
          {!isFirst && (
            <motion.button
              onClick={onPrev}
              className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all text-sm md:text-sm font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bumalik
            </motion.button>
          )}
          <motion.button
            onClick={handleNext}
            className="flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-[#4C5173] text-white hover:bg-[#3a3f5c] transition-all text-sm md:text-sm font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLast ? "Tapos!" : "Susunod →"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};



const WelcomeModal = ({ onStart }) => {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/70 z-[300] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-[90%] max-w-md z-[302] pointer-events-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Teki Character */}
        <div className="text-center mb-4 md:mb-6">
          <motion.img
            src={TekiAvatar}
            alt="Teki"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 object-cover shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#4C5173] mb-2 md:mb-3 text-center">
          Welcome to TechGuro!
        </h2>
        <p className="text-gray-700 text-center mb-6 md:mb-8 text-base md:text-base leading-relaxed font-medium">
          Hi! I'm Teki, your virtual guide. Let me show you around TechGuro and help you get started with your learning journey!
        </p>

        {/* Start Button */}
        <motion.button
          onClick={onStart}
          className="w-full px-6 py-3 bg-[#B6C44D] text-black rounded-lg font-semibold text-base md:text-lg hover:bg-[#a5b83d] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Let's Get Started! 🚀
        </motion.button>
      </motion.div>
    </>
  );
};

const SlidesModal = ({ step, onNext, onPrev, onClose, isFirst, isLast }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = step.slides[currentSlideIndex];
  const totalSlides = step.slides.length;

  const handleNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else {
      onPrev();
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/70 z-[300] pointer-events-auto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[95%] max-w-[900px] max-h-[85vh] z-[302] flex flex-col pointer-events-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <X className="w-6 h-6 text-black" />
        </button>

        {/* Content */}
        <div className="flex-1 flex items-center justify-between p-6 md:p-8 overflow-hidden">
          {/* Left Chevron */}
          <motion.button
            onClick={handlePrevSlide}
            className={`flex-shrink-0 p-3 rounded-full transition-all ${currentSlideIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
              }`}
            whileHover={currentSlideIndex > 0 ? { scale: 1.1 } : {}}
            whileTap={currentSlideIndex > 0 ? { scale: 0.9 } : {}}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          {/* Center Content */}
          <div className="flex-1 flex flex-col items-center justify-center mx-6">
            {/* Image */}
            <motion.div
              key={currentSlideIndex}
              className="w-full max-h-[40vh] mb-6 flex items-center justify-center"
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
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                <p className="text-gray-500">Image placeholder</p>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              key={`text-${currentSlideIndex}`}
              className="text-center max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-[#4C5173] mb-3">
                {currentSlide.title}
              </h3>
              <p className="text-base md:text-lg text-gray-600">
                {currentSlide.description}
              </p>
            </motion.div>

            {/* Slide Dots */}
            <div className="flex gap-2 mt-6">
              {step.slides.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`rounded-full transition-all ${index === currentSlideIndex
                    ? "bg-[#4C5173] w-8 h-3"
                    : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                    }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
          {/* Right Chevron */}
          <motion.button
            onClick={handleNextSlide}
            className={`flex-shrink-0 p-3 rounded-full transition-all ${currentSlideIndex === totalSlides - 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#4C5173] text-white hover:bg-[#3a3f5c]"
              }`}
            whileHover={currentSlideIndex < totalSlides - 1 ? { scale: 1.1 } : {}}
            whileTap={currentSlideIndex < totalSlides - 1 ? { scale: 0.9 } : {}}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Bottom Info */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Learning Journey Guide</span>
            <span>
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const FinalDialogueModal = ({ step, onClose, onRestart }) => {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/70 z-[300] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-[92%] md:w-[95%] max-w-2xl z-[302] pointer-events-auto border-3 border-[#4C5173]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Teki Character Avatar */}
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-shrink-0">
            <motion.img
              src={TekiAvatar}
              alt="Teki"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg">Teki</h3>
            <p className="text-xs md:text-sm text-gray-500">{step.title}</p>
          </div>
        </div>

        {/* Main Description - Better Readability */}
        <p className="text-gray-800 mb-5 md:mb-6 text-base md:text-lg leading-relaxed font-semibold">
          {step.description}
        </p>

        {/* Highlighted Info Box */}
        <motion.div
          className="bg-gradient-to-r from-[#B6C44D]/20 to-[#4C5173]/10 border-l-4 border-[#B6C44D] rounded-lg p-3 md:p-4 mb-6 md:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Look for the <span className="font-bold text-[#4C5173]">Tutorial</span> button in the top-right user menu dropdown to start again anytime! 📚
          </p>
        </motion.div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:justify-end">
          <motion.button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all text-sm font-bold order-2 md:order-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Finish
          </motion.button>
          <motion.button
            onClick={onRestart}
            className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#B6C44D] text-black hover:bg-[#a5b83d] transition-all text-sm font-bold order-1 md:order-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Over 🔄
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

const DashboardTutorial = ({ isOpen, onClose, currentPage = "dashboard" }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const currentStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      // Disable ALL clicks
      document.body.style.pointerEvents = "none";
    } else {
      // Restore when tutorial closes
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      // Safety cleanup (in case component unmounts)
      document.body.style.pointerEvents = "auto";
    };
  }, [isOpen]);

  // SYNC showModal with isOpen prop
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Update target element when step changes and scroll to it
  useEffect(() => {
    if (currentStep?.type === "spotlight" && currentStep?.targetSelector) {
      const timer = setTimeout(() => {
        const element = document.querySelector(currentStep.targetSelector);
        console.log("🔍 Looking for element:", currentStep.targetSelector, "Found:", !!element);
        setTargetElement(element);
        // AUTO-SCROLL to element if it's off-screen
        if (element) {
          // Use a small delay to ensure proper rendering before scroll
          setTimeout(() => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          }, 50);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setTargetElement(null);
    }
  }, [currentStep, currentPage]);

  // Check if step should be visible on current page
  const isStepForCurrentPage = () => {
    if (currentStep?.type === "welcome" || currentStep?.type === "slides") {
      return true;
    }

    // Always show final dialogue regardless of current page
    if (currentStep?.id === "final-dialogue") {
      return true;
    }

    return currentStep?.section === currentPage;
  };


  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      console.log("✅ Tutorial completed");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    console.log("⏭️ Tutorial skipped");
    onClose();
  };

  const handleRestart = () => {
    setCurrentStepIndex(1); // Skip welcome, start from first spotlight
  };

  const handleNavigate = (target) => {
    console.log("📍 Navigating to:", target);
    window.dispatchEvent(
      new CustomEvent("tutorial-navigate", {
        detail: { target },
      })
    );
  };

  const handleStart = () => {
    console.log("🚀 Tutorial started - current page:", currentPage);

    if (currentPage !== "dashboard") {
      console.log("📍 Not on dashboard - navigating there first");

      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      }

      setTimeout(() => {
        setCurrentStepIndex(1);
      }, 600);
    } else {
      setCurrentStepIndex(1);
    }
  };

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === tutorialSteps.length - 1;

  // Return null only when NOT open
  if (!isOpen) return null;
  return (
    <AnimatePresence mode="wait">

      {currentStep?.type === "welcome" && (
        <WelcomeModal key="welcome" onStart={handleStart} />
      )}

      {currentStep?.type === "spotlight" && isStepForCurrentPage() && (
        <motion.div key={`spotlight-${currentStepIndex}`} style={{ pointerEvents: "auto" }}>
          <SpotlightOverlay targetElement={targetElement} padding={12} />
          <TekiDialogue
            step={{
              ...currentStep,
              fixedPosition: getDialogueFixedPosition(currentStep)
            }}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            isFirst={isFirst}
            isLast={isLast}
            targetElement={targetElement}
            onNavigate={handleNavigate}
          />
        </motion.div>
      )}

      {currentStep?.type === "slides" && (
        <SlidesModal
          key="slides"
          step={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={() => {
            console.log("🎓 Slides modal closed");
            onClose();
          }}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}
    </AnimatePresence>
  );
};
export default DashboardTutorial;