import React from "react";
import "./chartConfig";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBoard from "./pages/UserBoard";

import PreAssessment from "./courses/PreAssessment";
import PostAssessment from "./courses/PostAssessment";
import LessonList from "./courses/LessonList";
import LessonPage from "./courses/LessonPage";
import QuizPage from "./courses/QuizPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Dashboard */}
        <Route path="/UserDashboard" element={<UserBoard />} />

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
    </Router>
  );
}

export default App;
