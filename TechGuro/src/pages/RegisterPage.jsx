import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Home, Calendar } from "lucide-react";
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

    // Validate age (must be at least 13 years old)
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      setErrorMessage("You must be at least 13 years old to register.");
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseURL}/register`, {
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

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black"
          />
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B708D] hover:text-[#4C5173] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B708D] hover:text-[#4C5173] transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Improved Birthday Field */}
          <div className="space-y-2">
            <label htmlFor="birthday" className="block text-sm font-medium text-[#4C5173]">
              Birthday
            </label>
            <div className="relative">
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black date-input"
                style={{
                  colorScheme: 'light',
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar className="w-5 h-5 text-[#6B708D]" />
              </div>
              
              {/* Custom overlay for better styling */}
              <div className="absolute inset-0 pointer-events-none flex items-center px-12">
                {birthday && (
                  <span className="text-[#4C5173] font-medium">
                    {formatDateForDisplay(birthday)}
                  </span>
                )}
                {!birthday && (
                  <span className="text-[#6B708D]">
                    Select your birthday
                  </span>
                )}
              </div>
            </div>
            
            {birthday && (
              <div className="text-xs text-gray-600 mt-1">
                Age: {Math.floor((new Date() - new Date(birthday)) / (365.25 * 24 * 60 * 60 * 1000))} years old
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 text-[#697DFF] border-[#6B708D] rounded focus:ring-[#697DFF]"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms" className="text-sm text-black leading-relaxed">
              I have read and accept the{" "}
              <button
                type="button"
                className="text-[#697DFF] underline hover:text-[#5d71e0] transition-colors"
                onClick={() => setShowTerms(true)}
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full py-3 mt-6 rounded-full bg-[#697DFF] text-white text-lg font-bold hover:bg-[#5d71e0] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            CREATE ACCOUNT
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-black">
          Meron nang account?{" "}
          <Link to="/login" className="text-[#697DFF] underline hover:text-[#5d71e0] transition-colors">
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
              <p>Welcome to TechGuro! By creating an account, you agree to the following terms:</p>
              <p><strong>1. Account Responsibility:</strong> You are responsible for maintaining the security of your account and password.</p>
              <p><strong>2. Age Requirement:</strong> You must be at least 13 years old to use this service.</p>
              <p><strong>3. Data Privacy:</strong> We respect your privacy and will protect your personal information according to our Privacy Policy.</p>
              <p><strong>4. Learning Content:</strong> All educational content is provided for learning purposes and should not be redistributed without permission.</p>
              <p><strong>5. Acceptable Use:</strong> You agree to use TechGuro respectfully and not engage in any harmful or disruptive behavior.</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-[#697DFF] text-white px-4 py-2 rounded hover:bg-[#5d71e0] transition-colors"
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
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-4">Account Created Successfully!</h2>
            <p className="mb-6 text-gray-600">Ang iyong account ay nagawa na. Welcome to TechGuru!</p>
            <button
              onClick={handleCloseSuccess}
              className="bg-[#697DFF] text-white px-6 py-2 rounded hover:bg-[#5d71e0] font-bold transition-all transform hover:scale-105"
            >
              Go to Log In
            </button>
          </div>
        </>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeInOut { 
          animation: fadeInOut 5s forwards; 
        }
        
        /* Custom date input styling */
        .date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          cursor: pointer;
        }
        
        .date-input::-webkit-inner-spin-button,
        .date-input::-webkit-clear-button {
          display: none;
        }
        
        .date-input {
          color: transparent;
        }
        
        .date-input:focus {
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;