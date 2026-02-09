import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminGuard from './components/AdminGuard';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UserDetail from './pages/UserDetail';
import CourseListPage from './pages/courses/CourseListPage';
import CourseCreatePage from './pages/courses/CourseCreatePage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CourseEditPage from './pages/courses/CourseEditPage';
import CourseReviewPage from './pages/courses/CourseReviewPage';
import ModuleListPage from './pages/modules/ModuleListPage';
import ModuleEditPage from './pages/modules/ModuleEditPage';
import LessonListPage from './pages/lessons/LessonListPage';
import LessonCreatePage from './pages/lessons/LessonCreatePage';
import ApplicationsReviewPage from './pages/ApplicationsReviewPage';

// Legacy (To be refactored)
import VideoManagement from './pages/VideoManagement';
import ResourceManagement from './pages/ResourceManagement';
import AssignmentManagement from './pages/AssignmentManagement';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import AssignmentReviewBoard from './pages/AssignmentReviewBoard';
import AssignmentGradePage from './pages/AssignmentGradePage';
import EnrolmentManagement from './pages/EnrolmentManagement';
import AIKnowledgeManagement from './pages/AIKnowledgeManagement';
import AuditLogs from './pages/AuditLogs';
import AdminProfile from './pages/AdminProfile';

import { ModalProvider } from './context/ModalContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            {/* Public Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />


            {/* Protected Routes */}
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/users/:id" element={<UserDetail />} />

                {/* Course Management */}
                <Route path="/admin/courses" element={<CourseListPage />} />
                <Route path="/admin/courses/new" element={<CourseCreatePage />} />
                <Route path="/admin/courses/:courseId" element={<CourseDetailPage />} />
                <Route path="/admin/courses/:courseId/edit" element={<CourseEditPage />} />
                <Route path="/admin/courses/:courseId/review" element={<CourseReviewPage />} />

                {/* Other Modules */}
                <Route path="/admin/courses/:courseId/modules" element={<ModuleListPage />} />
                <Route path="/admin/modules/:moduleId/edit" element={<ModuleEditPage />} />
                <Route path="/admin/modules/:moduleId/lessons" element={<LessonListPage />} />
                <Route path="/admin/modules/:moduleId/lessons/new" element={<LessonCreatePage />} />
                <Route path="/admin/lessons/:lessonId/edit" element={<LessonCreatePage />} />

                <Route path="/admin/modules/:id/videos" element={<VideoManagement />} />
                <Route path="/admin/modules/:id/resources" element={<ResourceManagement />} />
                <Route path="/admin/modules/:id/assignments" element={<AssignmentManagement />} />
                <Route path="/admin/assignments" element={<AssignmentReviewBoard />} />
                <Route path="/admin/assignments/:id/submissions" element={<AssignmentSubmissions />} />
                <Route path="/admin/submissions/:id/grade" element={<AssignmentGradePage />} />
                <Route path="/admin/enrolments" element={<EnrolmentManagement />} />
                <Route path="/admin/applications" element={<ApplicationsReviewPage />} />
                <Route path="/admin/ai-knowledge" element={<AIKnowledgeManagement />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
              </Route>
            </Route>

            {/* Root Redirects */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
