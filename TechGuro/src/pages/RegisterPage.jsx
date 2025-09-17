import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaRegCalendarAlt } from "react-icons/fa";
import { Home } from "lucide-react";
import Teki1 from "../assets/Teki 1.png";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Handle Enter key
  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") handleRegister();
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [email, username, password, confirmPassword, birthday, termsAccepted]);

  // Fade out error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword || !birthday) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms and Conditions.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          birthday: birthday + "T00:00:00"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.detail || "Registration failed");
      }
    } catch {
      setErrorMessage("Error connecting to server.");
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4C5173] px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[750px] p-8 md:p-10 text-black relative z-10">

        <Link to="/" className="absolute top-6 right-6 group flex items-center">
          <Home className="w-6 h-6 text-[#4C5173]" />
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-white px-2 py-1 rounded shadow-md absolute top-0 -right-36 whitespace-nowrap">
            Return to Home Page
          </span>
        </Link>

        {/* Error Message Popup */}
        {errorMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-md animate-fadeInOut z-50">
            {errorMessage}
          </div>
        )}

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={Teki1} alt="TechGuro Logo" className="w-16 h-16" />
          <h1 className="text-[32px] font-bold text-[#4C5173]">TechGuro.</h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Mag-Sign Up sa TechGuro
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#6B708D]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#6B708D]"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="relative w-full">
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black pr-12"
            />
            <FaRegCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B708D]" />
          </div>

          <div className="flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              className="mt-1"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms" className="text-sm text-black">
              I have read and accept the{" "}
              <span
                className="text-[#697DFF] underline cursor-pointer"
                onClick={() => setShowTerms(true)}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            onClick={handleRegister}
            className="w-full py-3 mt-6 rounded-full bg-[#697DFF] text-white text-lg font-bold hover:bg-[#5d71e0] transition-all"
          >
            CREATE ACCOUNT
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-black">
          Meron nang account?{" "}
          <Link to="/login" className="text-[#697DFF] underline">
            Mag-Log In dito
          </Link>
        </p>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowTerms(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-lg text-black">
            <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
            <div className="max-h-64 overflow-y-auto space-y-3 text-sm">
              <p>This is a placeholder for the Terms and Conditions text.</p>
              <p>
                By using TechGuro, you agree to our data privacy and usage policies.
              </p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-[#697DFF] text-white px-4 py-2 rounded hover:bg-[#5d71e0]"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40"></div>
          <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-black text-center">
            <h2 className="text-xl font-bold mb-4">Account Created!</h2>
            <p className="mb-6">Ang iyong Account ay nagawa na.</p>
            <button
              onClick={handleCloseSuccess}
              className="bg-[#697DFF] text-white px-6 py-2 rounded hover:bg-[#5d71e0] font-bold"
            >
              Go to Log In
            </button>
          </div>
        </>
      )}

      {/* Fade Animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeInOut { animation: fadeInOut 5s forwards; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
