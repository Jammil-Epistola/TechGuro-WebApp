import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#4c5173] text-white px-6 py-4 fixed w-full top-0 shadow-md z-[100]">
      <div className="flex justify-between items-center w-full">
        {/* Left - Logo */}
        <a href="#" className="text-white font-bold text-4xl">TechGuro</a>

        {/* Right - Links + Buttons */}
        <div className="hidden md:flex items-center space-x-8 text-2xl">
          {/* Navbar Links */}
          <a href="#home" className="hover:text-gray-300">Home</a>
          <a href="#about" className="hover:text-gray-300">About</a>
          <a href="#courses" className="hover:text-gray-300">Courses</a>

          {/* Language Dropdown */}
          <p>Language</p>
          <select className="bg-[#6b6f92] text-white px-2 py-1 rounded">
            <option>English</option>
            <option>Filipino</option>
          </select>

          {/* Auth Buttons */}
          <Link to="/login" className="hover:text-gray-300">Sign In</Link>
          <Link to="/register" className="bg-white text-[#4c5173] px-5 py-2.5 rounded font-bold hover:bg-gray-200">
            Join Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-xl text-white" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-[#6b6f92] text-white px-6 py-4 space-y-2">
          <a href="#home" className="hover:underline">Home</a>
          <a href="#about" className="hover:underline">About</a>
          <a href="#courses" className="hover:underline">Courses</a>
          <select className="bg-[#4c5173] text-white px-2 py-1 rounded">
            <option>English</option>
            <option>Filipino</option>
          </select>
          <Link to="/login" className="hover:underline">Sign In</Link>
          <Link to="/register" className="bg-white text-[#4c5173] px-4 py-2 rounded font-bold">Join Now</Link>
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;
