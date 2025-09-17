import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../assets/TechGuroLogo_2.png";

const HomeNavbar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  const handleNavClick = (section, callback) => {
    setActiveNav(section);
    callback?.();
  };

  const handleContactClick = () => {
    setActiveTab("Researchers");
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAboutClick = () => {
    if (activeTab === "Researchers") {
      setActiveTab("About");
    }
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHomeClick = () => {
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
  };

  const navItemClass = (name) =>
    `cursor-pointer h-full flex items-center px-6 transition-colors font-bold text-[20px]  ${
      activeNav === name
        ? "bg-[#6B708D] text-white"
        : "text-[#F9F8FE] hover:opacity-70"
    }`;

  return (
    <header className="fixed w-full top-0 z-[40] bg-[#4C5173] shadow-md h-[70px]">
      <div className="w-full px-4 md:px-10 flex items-center justify-between h-full">
        {/* Left: Logo + Web Name */}
        <a href="#home" className="flex items-center cursor-pointer h-full">
          <img
            src={Logo}
            alt="TechGuro Logo"
            className="w-[55px] h-[55px] mr-3"
          />
          <span className="text-[#F9F8FE] font-bold text-[32px] md:text-[40px]">
            TechGuro.
          </span>
        </a>

        {/* Right: Desktop Nav Links */}
        <div className="hidden md:flex items-center h-full ml-auto">
          <span
            onClick={() => handleNavClick("Home", handleHomeClick)}
            className={navItemClass("Home")}
          >
            Home
          </span>
          <span
            onClick={() => handleNavClick("About", handleAboutClick)}
            className={navItemClass("About")}
          >
            About
          </span>
          <span
            onClick={() =>
              handleNavClick("Courses", () =>
                document
                  .getElementById("courses")
                  ?.scrollIntoView({ behavior: "smooth" })
              )
            }
            className={navItemClass("Courses")}
          >
            Courses
          </span>
          <span
            onClick={() => handleNavClick("Contact", handleContactClick)}
            className={navItemClass("Contact")}
          >
            Contact Us
          </span>

          {/* Auth Links */}
          <Link
            to="/register"
            className="h-full flex items-center px-6 font-bold text-[20px]  text-white bg-[#f59a22] hover:opacity-90"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="h-full flex items-center px-6 font-bold text-[20px]  text-white bg-[#0a7df7] hover:opacity-90"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#F9F8FE]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 w-full bg-[#F9F8FE] border-t border-black/10 shadow-md px-6 py-4 z-10 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-4 text-[20px] font-bold">
          <span
            onClick={() => handleNavClick("Home", handleHomeClick)}
            className={`cursor-pointer px-3 py-2 rounded ${
              activeNav === "Home" ? "bg-[#6B708D] text-white" : "text-black"
            }`}
          >
            Home
          </span>
          <span
            onClick={() => handleNavClick("About", handleAboutClick)}
            className={`cursor-pointer px-3 py-2 rounded ${
              activeNav === "About" ? "bg-[#6B708D] text-white" : "text-black"
            }`}
          >
            About
          </span>
          <span
            onClick={() =>
              handleNavClick("Courses", () =>
                document
                  .getElementById("courses")
                  ?.scrollIntoView({ behavior: "smooth" })
              )
            }
            className={`cursor-pointer px-3 py-2 rounded ${
              activeNav === "Courses" ? "bg-[#6B708D] text-white" : "text-black"
            }`}
          >
            Courses
          </span>
          <span
            onClick={() => handleNavClick("Contact", handleContactClick)}
            className={`cursor-pointer px-3 py-2 rounded ${
              activeNav === "Contact" ? "bg-[#6B708D] text-white" : "text-black"
            }`}
          >
            Contact Us
          </span>

          {/* Full width auth buttons */}
          <Link
            to="/register"
            className="w-full flex justify-center items-center py-3 font-bold text-white bg-[#f59a22] hover:opacity-90"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="w-full flex justify-center items-center py-3 font-bold text-white bg-[#0a7df7] hover:opacity-90"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default HomeNavbar;
