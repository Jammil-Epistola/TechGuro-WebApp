import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../pagesCSS/RegisterPage.css"; // Import CSS
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye Icons for Password Toggle

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
            I agree and accept the <span className="terms-link" onClick={() => setShowTerms(true)}>Terms and Conditions</span>
          </label>
        </div>

        {/* Bottom Links & Button */}
        <div className="register-actions">
          <Link to="/login" className="register-link">Return to Sign-in</Link>
          <button className="register-button">CREATE ACCOUNT</button>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <>
          <div className="modal-overlay" onClick={() => setShowTerms(false)}></div>
          <div className="terms-modal">
            <div className="terms-modal-content">
              <h2>Terms and Conditions</h2>
              <div className="terms-scroll">
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using TechGuro, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.</p>

                <h3>2. User Accounts</h3>
                <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities under your account.</p>

                <h3>3. Course Access</h3>
                <p>Access to courses is granted based on your registration and payment status. Course materials are for personal use only and may not be shared or distributed.</p>

                <h3>4. Privacy Policy</h3>
                <p>We collect and process your personal information in accordance with our Privacy Policy. By using our platform, you consent to such processing.</p>

                <h3>5. Intellectual Property</h3>
                <p>All content on TechGuro, including courses, materials, and resources, is protected by intellectual property rights. You may not copy, modify, or distribute this content without permission.</p>

                <h3>6. Limitation of Liability</h3>
                <p>TechGuro is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.</p>

                <h3>7. Changes to Terms</h3>
                <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
              </div>
              <button className="close-terms-btn" onClick={() => setShowTerms(false)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
