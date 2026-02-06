import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import CoursesPage from './pages/CoursesPage';
import EventsPage from './pages/EventsPage';
import CareersPage from './pages/CareersPage';
import BlogsPage from './pages/BlogsPage';
import ResourcesPage from './pages/ResourcesPage';
import ContactPage from './pages/ContactPage';
import CourseDetailPage from './pages/CourseDetailPage';
import NotFound from './pages/NotFound';

// Student Portal Layout & Pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseOverview from './pages/student/CourseOverview';
import CoursePlayer from './pages/student/CoursePlayer';
import AssignmentUpload from './pages/student/AssignmentUpload';
import AssignmentHistory from './pages/student/AssignmentHistory';
import CourseCompletion from './pages/student/CourseCompletion';
import AIFAQInterface from './pages/student/AIFAQInterface';
import StudentProfile from './pages/student/StudentProfile';
import ResourceLibrary from './pages/student/ResourceLibrary';

function AppContent() {
  const { isLoading } = useLoading();

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/news" element={<BlogsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* Student Portal Routes */}
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentDashboard />} /> {/* Alias or specific list */}
          <Route path="/student/course/:courseId" element={<CourseOverview />} />
          <Route path="/student/course/:courseId/module/:moduleId" element={<CoursePlayer />} />
          <Route path="/student/course/:courseId/completed" element={<CourseCompletion />} />
          <Route path="/student/assignments" element={<AssignmentHistory />} />
          <Route path="/student/assignments/:assignmentId" element={<AssignmentUpload />} />
          <Route path="/student/ai-assistant" element={<AIFAQInterface />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/resources" element={<ResourceLibrary />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Router>
  );
}

export default App;
