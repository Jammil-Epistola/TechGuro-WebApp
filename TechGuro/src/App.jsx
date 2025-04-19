import React from "react";
import "./chartConfig";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBoard from "./pages/UserBoard";
import PreAssessment from "./courses/ComputerBasics/PreAssessment";
import LessonList from "./courses/ComputerBasics/LessonList";
import LessonPage from "./courses/ComputerBasics/LessonPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/UserDashboard" element={<UserBoard />} />
        
        {/* Computer Basics Course Routes */}
        <Route path="/courses/ComputerBasics">
          <Route index element={<LessonList />} />
          <Route path="Pre-Assessment" element={<PreAssessment />} />
          <Route path="lesson" element={<LessonPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
