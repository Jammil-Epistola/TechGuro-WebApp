import React from "react";
import Navbar from "../HomeNavbar";
import "../pagesCSS/HomePage.css";
import { FaEnvelope, FaPhone, FaLaptop, FaCode, FaShieldAlt, FaGlobe, FaBuilding, FaCreditCard } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const HomePage = () => {
  return (
    <div>
      <Navbar />

      {/* Home Section */}
      <section id="home" className="home-section">
        <div className="home-content">
          <h2>LEARNING</h2>
          <h1>DIGITAL LITERACY</h1>
          <p>TechGuro is an AI-driven learning platform designed to make digital literacy 
            accessible for adults and elderly learners. Through personalized course 
            recommendations and interactive lessons, our AI technology adapts to each 
            user's learning pace, ensuring a more effective and engaging experience.
            Whether you're new to technology or looking to enhance your digital skills, 
            TechGuro provides an intuitive and supportive learning environment.</p>
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
                <img src="/path-to-image.jpg" alt="TechGuro Learning" className="about-image" />
              </div>
              <div className="about-right">
                <h2 className="about-title">About TechGuro</h2>
                <p className="about-text">
                  TechGuro is a web-based learning platform designed to enhance digital literacy among adults and elderly users.
                  The platform aims to bridge the technology gap by providing accessible, easy-to-follow courses on essential digital skills.
                  From basic computer operations to using online applications, TechGuro ensures that learners gain confidence in navigating the digital world.
                  <br /><br />
                  By empowering adults and senior learners with essential digital skills, TechGuro fosters independence and opens new opportunities for
                  communication, online transactions, and even career development in an increasingly digital society.
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
                  <img src="/path-to-researcher1.jpg" alt="Researcher 1" className="researcher-image" />
                  <h3>Jammil C. Epistola</h3>
                  <p><FaEnvelope className="icon" /> epistolajammil45@gmail.com</p>
                  <p><FaPhone className="icon" /> 0921 729 4657</p>
                </div>

                {/* Researcher 2 */}
                <div className="researcher">
                  <img src="/path-to-researcher2.jpg" alt="Researcher 2" className="researcher-image" />
                  <h3>Raquel H. Javier</h3>
                  <p><FaEnvelope className="icon" /> raquelhiraojavier@gmail.com</p>
                  <p><FaPhone className="icon" /> 0991 584 9104</p>
                </div>

                {/* Researcher 3 */}
                <div className="researcher">
                  <img src="/path-to-researcher3.jpg" alt="Researcher 3" className="researcher-image" />
                  <h3>Angel B. Ojoy</h3>
                  <p><FaEnvelope className="icon" /> ojoyangel14@gmail.com</p>
                  <p><FaPhone className="icon" /> 0992 627 6650</p>
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
          <div className="course-card"><FaLaptop className="course-icon" /> <p>About Computers</p></div>
          <div className="course-card"><FaCode className="course-icon" /> <p>About Computer Softwares</p></div>
          <div className="course-card"><FaShieldAlt className="course-icon" /> <p>Basic CyberSecurity</p></div>
          <div className="course-card"><FaGlobe className="course-icon" /> <p>The Internet</p></div>
          <div className="course-card"><FaBuilding className="course-icon" /> <p>Government Systems</p></div>
          <div className="course-card"><FaCreditCard className="course-icon" /> <p>Online Banking</p></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
