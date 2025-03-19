import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard"; 
import PerformancePage from "./pages/PerformancePage";
import QuizzesPage from "./pages/QuizzesPage";
import CoursePage from "./pages/CoursePage";
import AchievementPage from "./pages/AchievementPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/achievements" element={<AchievementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
