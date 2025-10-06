// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";
import Teki1 from "../assets/Teki 1.png";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        // Handle validation errors properly
        if (data.detail && Array.isArray(data.detail)) {
          setError(data.detail[0].msg || "Invalid input");
        } else {
          setError(data.detail || "Failed to send reset code");
        }
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.reset_token);
        setStep(3);
      } else {
        setError(data.detail || "Invalid code");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setStep(4); // Success
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to reset password");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFDFEE] to-[#E8E8F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src={Teki1} alt="TechGuro Logo" className="w-16 h-16 mr-2" />
          <h1 className="text-3xl font-bold text-[#4C5173]">TechGuro.</h1>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-[#4C5173]">
              Forgot Password?
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter your email to receive a reset code
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5173] text-black"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                onClick={handleRequestCode}
                disabled={loading}
                className="w-full py-3 bg-[#4C5173] text-white rounded-lg font-semibold hover:bg-[#3a3f5c] disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-[#4C5173]">
              Enter Reset Code
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Check your email for the 6-digit code
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#4C5173] text-black"
                maxLength={6}
              />

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-[#4C5173] text-white rounded-lg font-semibold hover:bg-[#3a3f5c] disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-[#4C5173] hover:underline"
              >
                Back to Email
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-[#4C5173]">
              Set New Password
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Choose a strong password
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5173] text-black"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5173] text-black"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3 bg-[#4C5173] text-white rounded-lg font-semibold hover:bg-[#3a3f5c] disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#4C5173] mb-2">
              Password Reset!
            </h2>
            <p className="text-gray-600 mb-4">
              Redirecting to login...
            </p>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== 4 && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[#4C5173] hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;