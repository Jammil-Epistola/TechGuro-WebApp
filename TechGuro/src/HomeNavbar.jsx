import { useState } from "react";
import { Link } from "react-router-dom";
import Teki1 from "../src/assets/Home/Teki 1.png";

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-[100]">
      {/* Main Navigation Container */}
      <nav className="bg-[#B3AE8C] relative">
        {/* Oval Logo Container */}
        <div className="logo-oval">
          <a href="#home" className="logo-content">
            <img src={Teki1} alt="TechGuro Logo" className="logo-image" />
            <span className="logo-text">TechGuro</span>
          </a>
        </div>

        {/* Right Side Navigation */}
        <div className="nav-container">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {/* Combined Navigation Links */}
            <div className="flex items-center gap-8">
              <a href="#about">About</a>
              <a href="#courses">Course</a>
              <select className="language-select" title="Language">
                <option>English</option>
                <option>Filipino</option>
              </select>
              {/* Separator Line */}
              <div className="h-6 w-px bg-black"></div>
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="join-button">
                Join Now
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-xl text-black" onClick={() => setIsOpen(!isOpen)}>
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col bg-[#B3AE8C] text-black px-6 py-4 space-y-2">
            <a href="#about" className="hover:underline">About</a>
            <a href="#courses" className="hover:underline">Course</a>
            <select className="mobile-language-select" title="Language">
              <option>English</option>
              <option>Filipino</option>
            </select>
            <div className="h-px w-full bg-black my-2"></div>
            <Link to="/login" className="hover:underline">Sign In</Link>
            <Link to="/register" className="mobile-join-button">Join Now</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HomeNavbar;
