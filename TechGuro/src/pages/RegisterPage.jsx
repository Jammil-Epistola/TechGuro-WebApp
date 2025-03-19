import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../pagesCSS/RegisterPage.css"; // Import CSS
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye Icons for Password Toggle

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="register-container">
      {/* Centered Form */}
      <div className="register-form">
        <h1 className="register-title">TechGuro.</h1>
        <h2 className="register-subtitle">Account Creation</h2>

        {/* Input Fields */}
        <input type="text" placeholder="First Name" className="register-input" />
        <input type="text" placeholder="Last Name" className="register-input" />
        <input type="email" placeholder="Email" className="register-input" />

        {/* Password Field with Show/Hide */}
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="register-input"
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password Field */}
        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="register-input"
          />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="terms-container">
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">
            I agree and accept the <Link to="/terms" className="terms-link">Terms and Condition</Link>
          </label>
        </div>

        {/* Bottom Links & Button */}
        <div className="register-actions">
          <Link to="/login" className="register-link">Return to Sign-in</Link>
          <button className="register-button">CREATE ACCOUNT</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
