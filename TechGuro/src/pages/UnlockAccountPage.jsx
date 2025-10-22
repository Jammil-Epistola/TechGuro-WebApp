import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Lock, CheckCircle } from "lucide-react";
import Teki1 from "../assets/Teki 1.png";

const UnlockAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || "");
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockToken, setUnlockToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [stage, setStage] = useState("request"); // "request" | "verify" | "unlock" | "success"
  const [codeRequested, setCodeRequested] = useState(false);
  const [passwordResetNote, setPasswordResetNote] = useState("");

  // Fade out messages
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Request unlock code
  const handleRequestCode = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/request-account-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeRequested(true);
        setStage("verify");
        setSuccessMessage("Unlock code sent to your email! Check your inbox and spam folder.");
      } else {
        setErrorMessage(data.detail || "Failed to send unlock code");
      }
    } catch (error) {
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify unlock code
  const handleVerifyCode = async () => {
    if (!unlockCode) {
      setErrorMessage("Please enter the unlock code.");
      return;
    }

    if (unlockCode.length !== 6) {
      setErrorMessage("Unlock code must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/verify-unlock-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: unlockCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setUnlockToken(data.unlock_token);
        setStage("unlock");
        setSuccessMessage("Code verified! You can now unlock your account.");
      } else {
        setErrorMessage(data.detail || "Invalid unlock code");
      }
    } catch (error) {
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Unlock account
  const handleUnlockAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/unlock-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, unlock_token: unlockToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStage("success");
        setSuccessMessage("Account unlocked successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMessage(data.detail || "Failed to unlock account");
        setStage("verify");
      }
    } catch (error) {
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
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

        {/* Success Message Popup */}
        {successMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-md animate-fadeInOut z-50">
            {successMessage}
          </div>
        )}

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={Teki1} alt="TechGuro Logo" className="w-16 h-16" />
          <h1 className="text-[32px] font-bold text-[#4C5173]">TechGuro.</h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <Lock className="w-6 h-6 text-[#697DFF]" />
          Unlock Account
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          Follow the steps below to unlock your account
        </p>

        {/* Success State */}
        {stage === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="text-green-500 text-7xl">
              <CheckCircle className="w-20 h-20" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#4C5173] mb-2">Account Unlocked!</h3>
              <p className="text-gray-600">Your account has been successfully unlocked.</p>
              <p className="text-gray-600 text-sm mt-2">Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Stage 1: Request Code */}
            {stage === "request" || stage === "verify" || stage === "unlock" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#4C5173] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={codeRequested}
                    className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {stage === "request" && (
                  <button
                    onClick={handleRequestCode}
                    disabled={loading}
                    className="w-full py-3 mt-6 rounded-full bg-[#697DFF] text-white text-lg font-bold hover:bg-[#5d71e0] disabled:bg-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? "Sending..." : "Send Unlock Code"}
                  </button>
                )}
              </>
            ) : null}

            {/* Stage 2: Verify Code */}
            {stage === "verify" || stage === "unlock" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#4C5173] mb-2">
                    Unlock Code
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Enter the 6-digit code sent to your email
                  </p>
                  <input
                    type="text"
                    placeholder="000000"
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={stage === "unlock"}
                    maxLength="6"
                    className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none focus:ring-2 focus:ring-[#697DFF] text-black text-center text-2xl letter-spacing-wider disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  />
                </div>

                {stage === "verify" && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyCode}
                      disabled={loading}
                      className="flex-1 py-3 rounded-full bg-[#697DFF] text-white text-lg font-bold hover:bg-[#5d71e0] disabled:bg-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? "Verifying..." : "Verify Code"}
                    </button>
                    <button
                      onClick={() => {
                        setStage("request");
                        setCodeRequested(false);
                        setUnlockCode("");
                      }}
                      className="flex-1 py-3 rounded-full bg-gray-300 text-gray-700 text-lg font-bold hover:bg-gray-400 transition-all"
                    >
                      Back
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {/* Stage 3: Unlock Button */}
            {stage === "unlock" ? (
              <div className="flex gap-3">
                <button
                  onClick={handleUnlockAccount}
                  disabled={loading}
                  className="flex-1 py-3 rounded-full bg-green-500 text-white text-lg font-bold hover:bg-green-600 disabled:bg-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Unlocking..." : "Unlock Account"}
                </button>
                <button
                  onClick={() => {
                    setStage("verify");
                  }}
                  className="flex-1 py-3 rounded-full bg-gray-300 text-gray-700 text-lg font-bold hover:bg-gray-400 transition-all"
                >
                  Back
                </button>
              </div>
            ) : null}

            {/* Back to Login */}
            {stage === "request" && (
              <button
                onClick={handleBackToLogin}
                className="w-full py-2 mt-4 text-[#697DFF] font-semibold hover:text-[#5d71e0] transition-colors text-center"
              >
                Back to Login
              </button>
            )}
          </div>
        )}
      </div>

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
        
        .letter-spacing-wider {
          letter-spacing: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default UnlockAccountPage;