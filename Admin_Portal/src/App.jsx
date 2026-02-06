import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UserDetail from './pages/UserDetail';
import CourseManagement from './pages/CourseManagement';
import CourseEdit from './pages/CourseEdit';
import ModuleManagement from './pages/ModuleManagement';
import VideoManagement from './pages/VideoManagement';
import ResourceManagement from './pages/ResourceManagement';
import AssignmentManagement from './pages/AssignmentManagement';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import EnrolmentManagement from './pages/EnrolmentManagement';
import AIKnowledgeManagement from './pages/AIKnowledgeManagement';
import AuditLogs from './pages/AuditLogs';
import AdminProfile from './pages/AdminProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* All Admin Routes are now truly public for demo */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/courses/new" element={<CourseEdit />} />
            <Route path="/admin/courses/:id/edit" element={<CourseEdit />} />
            <Route path="/admin/courses/:id/modules" element={<ModuleManagement />} />
            <Route path="/admin/modules/:id/videos" element={<VideoManagement />} />
            <Route path="/admin/modules/:id/resources" element={<ResourceManagement />} />
            <Route path="/admin/modules/:id/assignments" element={<AssignmentManagement />} />
            <Route path="/admin/assignments/:id/submissions" element={<AssignmentSubmissions />} />
            <Route path="/admin/enrolments" element={<EnrolmentManagement />} />
            <Route path="/admin/ai-knowledge" element={<AIKnowledgeManagement />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* Root Redirects */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
