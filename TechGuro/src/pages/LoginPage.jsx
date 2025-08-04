import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Teki1 from "../assets/Teki 1.png";
import loginBG from "../assets/login_image1.jpg";
import { useUser } from "../context/UserContext"; 

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        // Save user data to Context and localStorage
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        setNotificationType("success");
        setNotificationMessage(`Welcome back, ${data.username}!`);
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);
          navigate("/UserDashboard");
        }, 2000);
      } else {
        setNotificationType("error");
        setNotificationMessage(data.detail || "Login failed");
        setShowNotification(true);
      }
    } catch (error) {
      setNotificationType("error");
      setNotificationMessage("Server error. Try again.");
      setShowNotification(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="flex min-h-screen">
        <div
          className="hidden md:block w-3/5 bg-cover bg-center rounded-r-[300px]"
          style={{ backgroundImage: `url(${loginBG})` }}
        ></div>

        <div className="w-full md:w-2/5 bg-[#f9f9f9] px-8 py-10 flex flex-col justify-center relative">
          <div className="absolute top-6 right-6 flex gap-4 text-sm text-black">
            <a href="/" className="hover:underline">Home</a>
            <span>|</span>
            <select className="bg-transparent focus:outline-none">
              <option>English</option>
              <option>Filipino</option>
            </select>
          </div>

          <div className="flex items-center justify-center mb-6">
            <img src={Teki1} alt="TechGuro Logo" className="w-12 h-12 mr-2" />
            <h1 className="text-[28px] font-bold text-[#4C5173]">TechGuro.</h1>
          </div>

          <h2 className="text-[24px] font-bold text-center mb-8 text-black">
            Sign In <br className="md:hidden" /> To Your Account
          </h2>

          <div className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F8FE] border border-[#6B708D] rounded focus:outline-none text-black"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#6B708D]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="text-right text-sm">
              <a href="#" className="text-[#697DFF] hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 mt-6 rounded-full bg-[#697DFF] text-white text-lg font-bold hover:bg-[#5d71e0] transition-all"
          >
            SIGN IN
          </button>

          <p className="text-center mt-4 text-sm text-black">
            No Account Yet?{" "}
            <Link to="/register" className="text-[#697DFF] underline">
              Create Account
            </Link>
          </p>

          {/* Notification Modal */}
          {showNotification && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowNotification(false)}
              ></div>
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 text-center max-w-sm w-full">
                <p className="mb-4 text-black">{notificationMessage}</p>
                {notificationType === "success" ? (
                  <div className="animate-spin h-6 w-6 mx-auto border-4 border-blue-500 border-t-transparent rounded-full"></div>
                ) : (
                  <button
                    className="text-red-600 underline"
                    onClick={() => setShowNotification(false)}
                  >
                    Close
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
