import React, { useState, useRef } from "react";
import Navbar from "./HomeNavbar";
import { FaEnvelope, FaPhone, FaLaptop, FaFileAlt, FaTools, FaGlobe, FaPaintBrush, FaBookOpen } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import home_background1 from "../assets/Home/home_background1.jpg";
import home_background2 from "../assets/Home/home_background2.jpg";
import jammil_img from "../assets/Home/jammil_photo.png";
import raquel_img from "../assets/Home/raquel_photo.jpg";
import angel_img from "../assets/Home/angel_photo.jpg";

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
  const swiperRef = useRef(null);

  return (
    <div>
      <Navbar/>

      {/* Home Section */}
      <section
        id="home"
        className="relative flex flex-col justify-center h-screen bg-cover bg-center bg-no-repeat text-white pl-48"
        style={{ backgroundImage: `url(${home_background1})` }}
      >
        {/* Overlay (replaces ::before) */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl">
          <h2 className="text-[3.2rem] font-bold mb-[-1.5rem]">LEARNING</h2>
          <h1 className="text-[4.2rem] font-bold">COMPUTER LITERACY</h1>
          <p className="text-[2rem] mt-2 mr-[10rem] text-justify">
            TechGuro is a learning platform focused on building essential computer literacy skills for adults and the elderly.
            From understanding basic computer functions to navigating the internet and using everyday applications,
            TechGuro provides step-by-step lessons tailored for beginners. Our platform uses AI to recommend personalized
            learning paths based on each user's progress, helping them learn at their own pace and gain confidence in using digital
            tools for daily life.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <a
              href="#about"
              className="px-6 py-4 text-[1.5rem] font-bold rounded bg-[#6b6f92] text-white hover:bg-[#5a5d85] transition-colors"
            >
              Learn More
            </a>
            <a
              href="/register"
              className="px-6 py-4 text-[1.5rem] font-bold rounded bg-[#4c5173] text-white hover:bg-[#3b3f65] transition-colors"
            >
              Join Now
            </a>
          </div>
        </div>
      </section>

      {/* About Section with Swiper */}
      <section id="about" className="min-h-screen flex justify-center items-center bg-[#4C5173] px-8 py-12">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {/* Slide 1 - About TechGuro */}
          <SwiperSlide>
            <div className="flex flex-col lg:flex-row w-full max-w-[1780px] min-h-[83vh] bg-[#6B708D] rounded-xl mt-14 overflow-hidden shadow-lg">
              {/* Left Image Section */}
              <div
                className="flex-1 bg-[#282c4a] bg-cover bg-center bg-no-repeat hidden lg:block"
                style={{ backgroundImage: `url(${home_background2})` }}
              ></div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col justify-center items-end text-right text-white p-8 bg-[#6B708D]">
                <h2 className="text-[2.5rem] font-bold pr-10 pb-20">About TechGuro</h2>
                <p className="text-[1.3rem] leading-relaxed pr-10 text-justify">
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

          {/* Slide 2 - Researchers */}
          <SwiperSlide>
            <div className="flex flex-col items-center text-center w-full max-w-[1780px] min-h-[83vh] mt-14 bg-[#6B708D] text-white p-8">
              {/* Title */}
              <div className="text-left w-full max-w-[1200px] mb-8">
                <h3 className="text-[2.5rem] mb-2">ABOUT</h3>
                <h2 className="text-[3rem] mb-4">TECHGURO: THE RESEARCHERS</h2>
                <hr className="w-full max-w-[100rem] h-[3px] bg-white border-none mx-auto" />
              </div>

              {/* Researchers Grid */}
              <div className="flex flex-col md:flex-row justify-between gap-8 w-full max-w-[1200px]">
                {[
                  {
                    name: "Jammil C. Epistola",
                    email: "epistolajammil45@gmail.com",
                    phone: "0921 729 4657",
                    image: jammil_img
                  },
                  {
                    name: "Raquel H. Javier",
                    email: "raquelhiraojavier@gmail.com",
                    phone: "0991 584 9104",
                    image: raquel_img
                  },
                  {
                    name: "Angel B. Ojoy",
                    email: "ojoyangel14@gmail.com",
                    phone: "0992 627 6650",
                    image: angel_img
                  }
                ].map((res, idx) => (
                  <div key={idx} className="flex-1 bg-[#4C5173] p-6 rounded-lg shadow-md flex flex-col items-center transition-transform hover:-translate-y-1">
                    <div
                      className="w-[200px] h-[300px] rounded-xl mb-4 shadow-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${res.image})` }}
                    ></div>
                    <div className="bg-[#BFC4D7] text-black text-center p-6 rounded-lg w-full">
                      <h3 className="text-[1.5rem] font-bold mb-2">{res.name}</h3>
                      <p className="flex items-center justify-center gap-2">
                        <FaEnvelope className="text-black" />
                        {res.email}
                      </p>
                      <p className="flex items-center justify-center gap-2 mt-1">
                        <FaPhone className="text-black" />
                        {res.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Courses Section */}
      <section id="courses" className="min-h-[95vh] flex flex-col justify-center items-center text-center bg-[#8B91B8] text-white px-8 py-12">
        <h2 className="text-[2.5rem] font-bold">TechGuro Courses</h2>
        <p className="text-[1.2rem] font-bold text-black mb-8">| We have the Following Categories |</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-[1500px]">
          {courses.map((course, index) => (
            <div
              key={index}
              className="w-full max-w-[25rem] h-[25rem] bg-white rounded-xl shadow-md flex flex-col justify-center items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg text-center p-8 mx-auto"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="text-[#4c5173] text-[5rem] mb-8">{course.icon}</div>
              <p className="text-[2rem] font-semibold text-[#333]">{course.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course Modal */}
      {selectedCourse && (
        <>
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[200] flex justify-center items-center"
            onClick={() => setSelectedCourse(null)}
          ></div>

          {/* Modal Content */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-[95%] max-w-[1400px] h-[80vh] z-[200] flex flex-col lg:flex-row overflow-hidden">

            {/* Left Side (Image) */}
            <div className="w-full lg:w-[45%] bg-white flex justify-center items-center p-4">
              <div
                className={`w-full h-full bg-center bg-no-repeat bg-contain rounded-lg`}
                style={{
                  backgroundImage: selectedCourse.imageClass
                    ? `url('/assets/Home/${selectedCourse.imageClass === 'computer-basics' ? 'CB_img.png' :
                      selectedCourse.imageClass === 'online-transactions' ? 'OT_img.jpg' :
                        selectedCourse.imageClass === 'internet-safety' ? 'IS_img.png' : ''}')`
                    : 'none'
                }}
              ></div>
            </div>

            {/* Right Side (Text) */}
            <div className="w-full lg:w-[55%] bg-[#f5f5f5] p-8 flex flex-col overflow-y-auto">
              <h2 className="text-[3rem] font-bold mb-6 text-[#333]">{selectedCourse.title}</h2>

              <div className="flex items-center gap-2 text-[1.4rem] text-[#666] mb-8">
                <FaBookOpen className="text-[1.6rem] text-[#4c5173]" />
                <span>{selectedCourse.lessons} Lessons Available</span>
              </div>

              <p className="text-[1.3rem] leading-relaxed text-[#555] mb-10">{selectedCourse.description}</p>

              <ul className="list-none mb-8">
                {selectedCourse.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-[1.2rem] text-[#444] mb-3 bg-white p-4 rounded-lg shadow-sm"
                  >
                    ✅ {point}
                  </li>
                ))}
              </ul>

              <button
                className="bg-[#4c5173] text-white w-full text-center py-4 rounded-lg text-[1.4rem] font-bold transition-colors hover:bg-[#3b3f65] mt-auto"
                onClick={() => (window.location.href = "/login")}
              >
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
