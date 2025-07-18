import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/TechGuroLogo_3.png";

const HomeNavbar = ({ onContactClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-[40] bg-[#BFC4D7] shadow-md transition-all duration-500 ease-in-out ${scrolled ? "py-2" : "py-3.5"}`}>
      <div className={`w-full px-4 md:px-10 flex flex-col transition-all duration-500 ease-in-out ${scrolled ? "gap-0" : "gap-3"}`}>
        
        {/* Top Right Auth - Hides when scrolled */}
        {!scrolled && (
          <div className="absolute top-4 right-4 flex gap-6 text-[25px]">
            <Link to="/register" className="text-black hover:opacity-70">Sign Up</Link>
            <p className="text-black"> | </p>
            <Link to="/login" className="text-black hover:opacity-70">Log In</Link>
          </div>
        )}

        {/* Center Logo - Shrinks when scrolled */}
        <a
          href="#home"
          className={`flex justify-center items-center transition-all duration-500 ease-in-out ${scrolled ? "mb-0" : "mb-2"} cursor-pointer`}
        >
          <img 
            src={Logo} 
            alt="TechGuro Logo" 
            className={`transition-all duration-500 ease-in-out ${scrolled ? "w-[60px] h-[60px]" : "w-[80px] h-[80px]"} mr-3`}
          />
          <span className={`text-black font-bold transition-all duration-500 ease-in-out ${scrolled ? "text-[40px]" : "text-[50px]"}`}>TechGuro.</span>
        </a>


        {/* Bottom Row: Nav Links */}
        <div className="flex justify-between items-end">
          {/* Bottom Left Nav */}
          <div className="flex items-center gap-10 text-[25px]">
            <a href="#about" className="text-black hover:opacity-70">About</a>
            <a href="#courses" className="text-black hover:opacity-70">Course</a>
            <select 
              className="bg-transparent border-none text-black cursor-pointer focus:outline-none"
              title="Language"
            >
              <option>English</option>
              <option>Filipino</option>
            </select>
          </div>

          {/* Bottom Right Nav */}
          <div className="flex items-center gap-10 text-[25px]">
            <span onClick={onContactClick} className="cursor-pointer text-black hover:opacity-70">Contact Us</span>
            <Link to="/register" className="text-black hover:opacity-70">Sign Up</Link>
            {scrolled && (
              <Link to="/login" className="text-black hover:opacity-70">Sign In</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Placeholder (will implement later) */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 w-full bg-[#BFC4D7] border-t border-black/10 shadow-md px-6 py-4 z-10 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        {/* Mobile content will be handled later */}
      </div>
    </header>
  );
};

export default HomeNavbar;
