import React, { useState } from "react";
import Navbar from "./HomeNavbar";
import "../pagesCSS/HomePage.css";
import { FaEnvelope, FaPhone, FaLaptop, FaFileAlt, FaTools, FaGlobe, FaPaintBrush, FaBookOpen } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const courses = [
  { 
    icon: <FaLaptop />, 
    title: "Computer Basics", 
    description: "Learn how to navigate and use a computer for daily tasks with ease.",
    lessons: 6,
    imageClass: "computer-basics",
    keyPoints: [
      "Using a mouse and keyboard",
      "Managing files and folders",
      "Installing applications",
      "Basic troubleshooting"
    ]
  },
  { 
    icon: <FaFileAlt />, 
    title: "File & Document Handling", 
    description: "Learn about managing, sharing, and converting different file formats.",
    lessons: 6,
    imageClass: "online-transactions",
    keyPoints: [
      "Understanding different file types (PDF, DOCX, JPG, etc.)",
      "How to organize files into folders",
      "Saving and renaming documents",
      "Converting files (e.g., Word to PDF)"
    ]
  },
  { 
    icon: <FaBookOpen />, 
    title: "Microsoft Essentials", 
    description: "Master the basics of Microsoft Word, Excel, and PowerPoint.",
    lessons: 6,
    keyPoints: [
      "Formatting documents",
      "Creating spreadsheets",
      "Designing presentations",
      "File saving & sharing"
    ]
  },
  { 
    icon: <FaGlobe />, 
    title: "Internet Safety", 
    description: "Stay safe online by understanding how to protect your information.",
    lessons: 6,
    imageClass: "internet-safety",
    keyPoints: [
      "Recognizing fake news",
      "Safe social media practices",
      "Avoiding malware",
      "Online privacy tips"
    ]
  },
  { 
    icon: <FaTools />, 
    title: "Computer Maintenance", 
    description: "Learn how to maintain and troubleshoot your computer for better performance.",
    lessons: 6,
    keyPoints: [
      "Cleaning up unnecessary files and apps",
      "Running antivirus and system updates",
      "Understanding error messages and warnings",
      "When and how to ask for tech support"
    ]
  },
  { 
    icon: <FaPaintBrush />, 
    title: "Creative Tools (Photos & Design)", 
    description: "Use beginner-friendly tools to edit images and create visual content.",
    lessons: 6,
    keyPoints: [
      "Basic photo editing (crop, rotate, adjust brightness)",
      "Using templates to design posters or flyers",
      "Introduction to tools like Canva or MS Paint",
      "Ethics of using images online (copyright, sources)"
    ]
  }
];

const HomePage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div>
      <Navbar />

      {/* Home Section */}
      <section id="home" className="home-section">
        <div className="home-content">
          <h2>LEARNING</h2>
          <h1>COMPUTER LITERACY</h1>
          <p>TechGuro is a learning platform focused on building essential computer literacy skills for adults and the elderly. 
            From understanding basic computer functions to navigating the internet and using everyday applications, 
            TechGuro provides step-by-step lessons tailored for beginners. Our platform uses AI to recommend personalized 
            learning paths based on each user's progress, helping them learn at their own pace and gain confidence in using digital 
            tools for daily life.</p>
          <div className="home-buttons">
            <a href="#about" className="btn learn-more">Learn More</a>
            <a href="/register" className="btn join-now">Join Now</a>
          </div>
        </div>
      </section>

         {/* About Section with Swiper */}
         <section id="about" className="about-section">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="swiper-container"
        >
          {/* Slide 1 - About TechGuro */}
          <SwiperSlide>
            <div className="about-slide">
              <div className="about-left">
              </div>
              <div className="about-right">
                <h2 className="about-title">About TechGuro</h2>
                <p className="about-text">
                  TechGuro is a web-based learning platform dedicated to improving computer literacy among adults and elderly users. 
                  The platform addresses the growing need for foundational computer knowledge by offering accessible, easy-to-follow 
                  lessons on essential computer skills. From learning how to operate a computer and manage files to navigating software 
                  and staying safe online, TechGuro equips users with the practical skills needed for everyday digital tasks.
                  <br /><br />
                  By equipping adults and seniors with essential computer literacy, TechGuro unlocks new opportunities for independence, 
                  confidence, and connection. Whether it's reconnecting with loved ones online, managing personal tasks, or navigating 
                  the digital world with ease, learners gain not just skills—but the freedom to thrive in a technology-driven society.
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 - The Researchers */}
          <SwiperSlide>
            <div className="researchers-slide">
              <div className="researchers-title">
                <h3><b>ABOUT</b></h3>
                <h2><b>TECHGURO:</b> THE RESEARCHERS</h2>
                <hr />
              </div>

              <div className="researchers-grid">
                {/* Researcher 1 */}
                <div className="researcher">
                  <div className="researcher-image-container"></div>
                  <div className="researcher-content">
                    <h3>Jammil C. Epistola</h3>
                    <p><FaEnvelope className="icon" /> epistolajammil45@gmail.com</p>
                    <p><FaPhone className="icon" /> 0921 729 4657</p>
                  </div>
                </div>

                {/* Researcher 2 */}
                <div className="researcher">
                  <div className="researcher-image-container"></div>
                  <div className="researcher-content">
                    <h3>Raquel H. Javier</h3>
                    <p><FaEnvelope className="icon" /> raquelhiraojavier@gmail.com</p>
                    <p><FaPhone className="icon" /> 0991 584 9104</p>
                  </div>
                </div>

                {/* Researcher 3 */}
                <div className="researcher">
                  <div className="researcher-image-container"></div>
                  <div className="researcher-content">
                    <h3>Angel B. Ojoy</h3>
                    <p><FaEnvelope className="icon" /> ojoyangel14@gmail.com</p>
                    <p><FaPhone className="icon" /> 0992 627 6650</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3 - Features */}
          <SwiperSlide>
            <div className="features-slide">
              <div className="researchers-title">
                <h3><b>ABOUT</b></h3>
                <h2><b>TECHGURO:</b> PROFESSORS</h2>
                <hr />
              </div>

              <div className="features-content">
                <div className="feature-container left-feature">
                  <div className="feature-image"></div>
                  <div className="feature-text">
                    <h3>PROF. ROSELLE R. BENGCO</h3>
                    <p> Research Adviser</p>
                  </div>
                </div>

                <div className="feature-container right-feature">
                  <div className="feature-text">
                    <h3>ASST. PROF. FE L. HABLANIDA</h3>
                    <p>Research Teacher</p>
                  </div>
                  <div className="feature-image"></div>
                </div>
              </div>
            </div>
          </SwiperSlide>

        </Swiper>
      </section>

      {/* Courses Section */}
      <section id="courses" className="courses-section">
        <h2 className="courses-title">TechGuro Courses</h2>
        <p className="courses-subtitle">| We have the Following Categories |</p>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-card" onClick={() => setSelectedCourse(course)}>
              {course.icon}
              <p>{course.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course Modal (Fixed) */}
      {selectedCourse && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedCourse(null)}></div>
          <div className="course-modal">
            <div className="modal-left">
              <div className={`course-image ${selectedCourse.imageClass}`}></div>
            </div>
            <div className="modal-right">
              <h2>{selectedCourse.title}</h2>
              <p className="lesson-info">
                <FaBookOpen className="icon" /> {selectedCourse.lessons} Lessons Available
              </p>
              <p>{selectedCourse.description}</p>
              <ul>
                {selectedCourse.keyPoints.map((point, index) => (
                  <li key={index} className="key-point">
                    ✅ {point}
                  </li>
                ))}
              </ul>
              <button className="start-course-btn" onClick={() => window.location.href = "/login"}>
                Start Course
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
