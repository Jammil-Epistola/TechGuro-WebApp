import React from "react";
import "./chartConfig";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { MilestoneProvider } from "./context/MilestoneContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnlockAccountPage from "./pages/UnlockAccountPage";
import RegisterPage from "./pages/RegisterPage";
import UserBoard from "./pages/UserBoard";
import AdminBoard from "./pages/AdminBoard";

import PreAssessment from "./courses/PreAssessment";
import PostAssessment from "./courses/PostAssessment";
import LessonList from "./courses/LessonList";
import LessonPage from "./courses/LessonPage";
import QuizPage from "./courses/QuizPage";

function App() {
  return (
    <Router>
      <UserProvider>
        <MilestoneProvider>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unlock-account" element={<UnlockAccountPage />}/>

            {/* User Dashboard */}
            <Route path="/UserDashboard" element={<UserBoard />} />

            {/* Admin Dashboard */}
            <Route path="/AdminDashboard" element={<AdminBoard />} />

            {/* Course Routes - Generalized */}
            <Route path="/courses/:courseName/Pre-Assessment" element={<PreAssessment />} />
            <Route path="/courses/:courseName" element={<LessonList />} />
            <Route path="/courses/:courseName/lesson" element={<LessonPage />} />
            <Route path="/courses/:courseName/Post-Assessment" element={<PostAssessment />} />
            <Route
              path="/courses/:courseName/quizzes/:courseId/:lessonId/:quizType"
              element={<QuizPage />}
            />
          </Routes>
        </MilestoneProvider>
      </UserProvider>
    </Router>
  );
}

export default App;