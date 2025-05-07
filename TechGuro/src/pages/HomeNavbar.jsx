import { useState } from "react";
import { Link } from "react-router-dom";
import Teki1 from "../assets/Home/Teki 1.png";

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-[100]">
      {/* Main Navigation Container */}
      <nav className="bg-[#BFC4D7] flex items-center justify-between px-4 md:px-8 py-4 relative">
        {/* Logo Container (Removed oval shape) */}
        <div className="flex items-center">
          <a href="#home" className="flex items-center no-underline">
            <img 
              src={Teki1} 
              alt="TechGuro Logo" 
              className="w-[50px] h-[50px] md:w-[50px] md:h-[50px] mr-3 transition-all duration-300"
            />
            <span className="text-lg md:text-xl font-bold text-black transition-opacity duration-300 hover:opacity-80">
              TechGuro
            </span>
          </a>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <a href="#about" className="text-black no-underline text-lg font-medium transition-opacity duration-300 hover:opacity-80">
                About
              </a>
              <a href="#courses" className="text-black no-underline text-lg font-medium transition-opacity duration-300 hover:opacity-80">
                Course
              </a>
            </div>
            
            {/* Separator Line - Increased height */}
            <div className="h-6 w-px bg-black/20 mx-6"></div>
            
            {/* Language Select */}
            <select 
              className="bg-transparent border-none text-black text-lg font-medium cursor-pointer px-2 focus:outline-none" 
              title="Language"
            >
              <option>English</option>
              <option>Filipino</option>
            </select>
            
            {/* Separator Line - Increased height */}
            <div className="h-6 w-px bg-black/20 mx-6"></div>
            
            {/* Auth Links */}
            <Link 
              to="/login" 
              className="text-black no-underline text-lg font-medium transition-opacity duration-300 hover:opacity-80 mr-6"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-[#8A8E5B] text-white no-underline px-7 py-2 rounded font-bold transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-2xl text-black bg-transparent border-none cursor-pointer p-2 transition-transform duration-300 hover:scale-110" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Using conditional classes instead of conditional rendering for smooth animation */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 w-full bg-[#BFC4D7] border-t border-black/10 shadow-md px-6 py-4 z-10 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <a 
          href="#about" 
          className="block py-3 text-lg font-medium text-black text-center transition-colors duration-200 hover:bg-black/5"
        >
          About
        </a>
        <a 
          href="#courses" 
          className="block py-3 text-lg font-medium text-black text-center transition-colors duration-200 hover:bg-black/5"
        >
          Course
        </a>
        <div className="h-px w-full bg-black/20 my-3"></div>
        <select 
          className="w-full bg-transparent border border-black/20 text-black py-3 px-4 rounded text-lg my-2 focus:outline-none focus:border-black/40" 
          title="Language"
        >
          <option>English</option>
          <option>Filipino</option>
        </select>
        <Link 
          to="/login" 
          className="block py-3 text-lg font-medium text-black text-center transition-colors duration-200 hover:bg-black/5"
        >
          Sign In
        </Link>
        <Link 
          to="/register" 
          className="block bg-[#8A8E5B] text-white text-center py-3 rounded font-bold mt-2 transition-opacity duration-300 hover:opacity-90"
        >
          Join Now
        </Link>
      </div>
    </header>
  );
};

export default HomeNavbar;