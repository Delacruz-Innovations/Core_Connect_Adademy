import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';
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
import FAQPage from './pages/FAQPage';
import ShowInterestPage from './pages/ShowInterestPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import SetPasswordPage from './pages/SetPasswordPage';

// Student Portal Layout & Pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import CoursePlayerPage from './pages/learning/CoursePlayerPage';
import ModuleViewPage from './pages/learning/ModuleViewPage';
import LessonPlayerPage from './pages/learning/LessonPlayerPage';
import AssignmentUpload from './pages/student/AssignmentUpload';
import AssignmentHistory from './pages/student/AssignmentHistory';
import CourseCompletion from './pages/student/CourseCompletion';
import AIFAQInterface from './pages/student/AIFAQInterface';
import StudentProfile from './pages/student/StudentProfile';
import ResourceLibrary from './pages/student/ResourceLibrary';
import ApplicationForm from './pages/student/ApplicationForm';

// Guards
import AuthGuard from './components/guards/AuthGuard';
import EnrolmentGuard from './components/guards/EnrolmentGuard';
import ModuleUnlockGuard from './components/guards/ModuleUnlockGuard';
import LessonAccessGuard from './components/guards/LessonAccessGuard';
import GuestGuard from './components/guards/GuestGuard';

function AppContent() {
  const { isLoading } = useLoading();
  const location = useLocation();

  // Disable full-screen spinner for private student routes
  const isPrivateRoute = location.pathname.startsWith('/student/');
  const showGlobalSpinner = isLoading && !isPrivateRoute;

  return (
    <>
      {showGlobalSpinner && <LoadingSpinner />}
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
        <Route path="/faqs" element={<FAQPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Guest Routes (Redirect to dashboard if logged in) */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/show-interest" element={<ShowInterestPage />} />
        </Route>

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* Protected Student Routes */}
        <Route element={<AuthGuard />}>

          {/* Standard Dashboard Layout */}
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentDashboard />} /> {/* Should likely be StudentCourses component if exists, but import says StudentDashboard or similar */}
            <Route path="/student/course/:courseId/completed" element={<CourseCompletion />} />
            <Route path="/student/assignments" element={<AssignmentHistory />} />
            <Route path="/student/assignments/:assignmentId" element={<AssignmentUpload />} />
            <Route path="/student/ai-assistant" element={<AIFAQInterface />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/resources" element={<ResourceLibrary />} />
            <Route path="/student/apply" element={<ApplicationForm />} />
          </Route>

          {/* Immersive Learning Routes (No Layout) - Sequentially Guarded */}
          <Route element={<EnrolmentGuard />}>
            <Route path="/student/course/:courseId" element={<CoursePlayerPage />} />

            <Route element={<ModuleUnlockGuard />}>
              <Route path="/student/course/:courseId/module/:moduleId" element={<ModuleViewPage />} />

              <Route element={<LessonAccessGuard />}>
                <Route path="/student/course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonPlayerPage />} />
              </Route>
            </Route>
          </Route>

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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
