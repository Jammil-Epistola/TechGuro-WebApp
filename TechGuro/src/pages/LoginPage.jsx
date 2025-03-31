import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye Icons for Password Toggle
import "../pagesCSS/LoginPage.css"; // Import CSS

const LoginPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(""); // "success" or "error"
  const [notificationMessage, setNotificationMessage] = useState("");

  // Hardcoded User Account (TEMPORARY)
  const hardcodedUser = {
    email: "testuser@gmail.com",
    password: "password123",
  };
  
  // Handle Login
  const handleLogin = () => {
    if (email === hardcodedUser.email && password === hardcodedUser.password) {
      setNotificationType("success");
      setNotificationMessage("Login Successful! Redirecting...");
      setShowNotification(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      setNotificationType("error");
      setNotificationMessage("Invalid Email or Password!");
      setShowNotification(true);
    }
  };

  return (
    <div className="login-container">
      {/* Left - Image Section */}
      <div className="login-left">
        {/* Image is in CSS background */}
      </div>

      {/* Right - Login Form */}
      <div className="login-right">
        <h1 className="login-title">TechGuro.</h1>

        {/* Email Input */}
        <input
          type="text"
          placeholder="Username or Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input with Show/Hide */}
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)} className="password-icon">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Bottom Links */}
        <div className="login-links">
          <a href="/register" className="login-link">Create Account</a>
          <a href="/forgot-password" className="login-link">Forgot Password?</a>
        </div>

        {/* Login Button */}
        <button className="login-button" onClick={handleLogin}>LOG IN</button>
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <>
          <div className="modal-overlay" onClick={() => setShowNotification(false)}></div>
          <div className={`notification-modal ${notificationType}`}>
            <div className="notification-content">
              <p>{notificationMessage}</p>
              {notificationType === "success" ? (
                <div className="loading-spinner"></div>
              ) : (
                <button className="close-notification-btn" onClick={() => setShowNotification(false)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage;
