import React, { useState, useEffect } from "react";
import { Home, ShieldCheck } from "lucide-react";
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
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") handleLogin();
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [email, password, isAdminMode]);

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
      const endpoint = isAdminMode
        ? "http://localhost:8000/admin/login"
        : "http://localhost:8000/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        navigate(isAdminMode ? "/AdminDashboard" : "/UserDashboard");
      } else {
        setErrorMessage(data.detail || "Login failed");
      }
    } catch (error) {
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setEmail("");
    setPassword("");
    setErrorMessage("");
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
        <div className="w-full md:w-2/5 bg-[#f9f9f9] px-6 md:px-8 py-10 flex flex-col justify-between relative">
          {/* Top Navigation */}
          <div className="flex justify-end items-start">
            {/* Home Link */}
            <Link to="/" className="group flex items-center">
              <Home className="w-6 h-6 text-[#4C5173]" />
              <span className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-[#f9f9f9] text-black px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                Return to Home Page
              </span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="flex flex-col justify-center flex-1">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <img src={Teki1} alt="TechGuro Logo" className="w-16 h-16 mr-2" />
              <h1 className="text-[38px] font-bold text-[#4C5173]">TechGuro.</h1>
            </div>

            {/* Heading */}
            <h2 className="text-[34px] font-bold text-center mb-8 text-black">
              {isAdminMode ? "System Admin Login" : "Mag Log-In"}
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

              {!isAdminMode && (
                <div className="text-right text-[18px]">
                  <Link
                    to="/forgot-password"
                    className="text-[#697DFF] hover:underline"
                  >
                    Nalimutan ang Password?
                  </Link>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 mb-2 text-red-600 font-bold text-[20px] text-center animate-fadeInOut">
                {errorMessage}
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-4 mt-4 rounded-full text-white text-[20px] font-bold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isAdminMode
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#697DFF] hover:bg-[#5d71e0]"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                  {isAdminMode ? "Logging in Admin..." : "Logging in..."}
                </div>
              ) : (
                "SIGN IN"
              )}
            </button>

            {!isAdminMode && (
              <p className="text-center mt-6 text-[20px] text-black">
                Walang Account?{" "}
                <Link to="/register" className="text-[#697DFF] underline">
                  Mag-Create ng Account
                </Link>
              </p>
            )}
          </div>

          {/* Role Switcher moved to bottom right */}
          <button
            onClick={toggleAdminMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all absolute bottom-6 right-6 shadow-md ${
              isAdminMode
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={isAdminMode ? "Switch to User Login" : "Switch to Admin Login"}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold">
              {isAdminMode ? "Admin" : "User"}
            </span>
          </button>
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
