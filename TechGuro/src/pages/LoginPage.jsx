//LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Teki1 from "../assets/Teki 1.png";
import loginBG from "../assets/login_image1.jpg";
import { useUser } from "../context/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useUser();

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") handleLogin();
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [email, password]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // only once

      if (response.ok) {
        login(data); // normalized login
        navigate("/UserDashboard");
      } else {
        setErrorMessage(data.detail || "Login failed");
      }
    } catch (error) {
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="flex min-h-screen">
        {/* Left Image */}
        <div
          className="hidden md:block w-3/5 bg-cover bg-center rounded-r-[300px]"
          style={{ backgroundImage: `url(${loginBG})` }}
        ></div>

        {/* Right Login Form */}
        <div className="w-full md:w-2/5 bg-[#f9f9f9] px-6 md:px-8 py-10 flex flex-col justify-center relative">
          {/* Top-right Home Link */}
          <Link to="/" className="absolute top-6 right-6 group flex items-center">
            <Home className="w-6 h-6 text-[#4C5173]" />
            <span className="absolute top-0 -left-44 opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-[#f9f9f9] text-black px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
              Return to Home Page
            </span>
          </Link>


          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img src={Teki1} alt="TechGuro Logo" className="w-16 h-16 mr-2" />
            <h1 className="text-[38px] font-bold text-[#4C5173]">TechGuro.</h1>
          </div>

          {/* Heading */}
          <h2 className="text-[34px] font-bold text-center mb-8 text-black">
            Mag Log-In
          </h2>

          {/* Form */}
          <div className="flex flex-col space-y-4 text-[20px]">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black text-[20px]"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black text-[20px]"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#6B708D] text-[22px]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="text-right text-[18px]">
              <a href="#" className="text-[#697DFF] hover:underline">
                Nalimutan ang Password?
              </a>
            </div>
          </div>

          {/* Error Message above Button */}
          {errorMessage && (
            <div className="mt-4 mb-2 text-red-600 font-bold text-[20px] text-center animate-fadeInOut">
              {errorMessage}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-full text-white text-[20px] font-bold transition-all ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#697DFF] hover:bg-[#5d71e0]"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                Logging in...
              </div>
            ) : (
              "SIGN IN"
            )}
          </button>

          <p className="text-center mt-6 text-[20px] text-black">
            Walang Account?{" "}
            <Link to="/register" className="text-[#697DFF] underline">
              Mag-Create ng Account
            </Link>
          </p>
        </div>
      </div>

      {/* Animation for fade-out */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }
          .animate-fadeInOut {
            animation: fadeInOut 5s forwards;
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
