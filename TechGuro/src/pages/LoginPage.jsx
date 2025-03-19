import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye Icons for Password Toggle
import "../pagesCSS/LoginPage.css"; // Import CSS

const LoginPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hardcoded User Account (TEMPORARY)
  const hardcodedUser = {
    email: "testuser@gmail.com",
    password: "password123",
  };

  // Handle Login
  const handleLogin = () => {
    if (email === hardcodedUser.email && password === hardcodedUser.password) {
      alert("Login Successful! Redirecting...");
      navigate("/dashboard"); // Redirect to UserDashboard
    } else {
      alert("Invalid Email or Password!");
    }
  };

  return (
    <div className="login-container">
      {/* Left - Image Placeholder */}
      <div className="login-left">
        <img src="/path-to-placeholder.jpg" alt="Placeholder" className="login-image" />
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
    </div>
  );
};

export default LoginPage;
