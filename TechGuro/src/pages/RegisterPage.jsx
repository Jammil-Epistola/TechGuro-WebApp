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
  
  // Separate birthday fields
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Generate arrays for dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return day < 10 ? `0${day}` : `${day}`;
  });

  // Generate years (13 years ago to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 88 }, (_, i) => currentYear - 13 - i);

  // Calculate age from separate fields
  const calculateAge = () => {
    if (!birthMonth || !birthDay || !birthYear) return null;
    
    const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle Enter key
  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") handleRegister();
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [email, username, password, confirmPassword, birthMonth, birthDay, birthYear, termsAccepted]);

  // Fade out error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword || !birthMonth || !birthDay || !birthYear) {
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
    const age = calculateAge();
    if (age === null || age < 13) {
      setErrorMessage("You must be at least 13 years old to register.");
      return;
    }

    // Construct birthday string in YYYY-MM-DD format
    const birthday = `${birthYear}-${birthMonth}-${birthDay}`;

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

          {/* NEW: Improved Birthday Section with Separate Dropdowns */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4C5173] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Birthday
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Month Dropdown */}
              <select
                value={birthMonth}
                onChange={e => setBirthMonth(e.target.value)}
                className="px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black cursor-pointer"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              {/* Day Dropdown */}
              <select
                value={birthDay}
                onChange={e => setBirthDay(e.target.value)}
                className="px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black cursor-pointer"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>
                    {parseInt(day)}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                className="px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black cursor-pointer"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Display Age if all fields are filled */}
            {birthMonth && birthDay && birthYear && (
              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <span className="font-medium">Age:</span>
                <span className="text-[#4C5173] font-semibold">
                  {calculateAge()} years old
                </span>
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
            <p className="mb-6 text-gray-600">Ang iyong account ay nagawa na. Welcome sa TechGuro!</p>
            <button
              onClick={handleCloseSuccess}
              className="bg-[#697DFF] text-white px-6 py-2 rounded hover:bg-[#5d71e0] font-bold transition-all transform hover:scale-105"
            >
              Bumalik sa Log In
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
        
        /* Style select dropdowns */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;