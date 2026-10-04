import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLES } from './utils/constants';

// ==========================================
// PUBLIC COMPONENTS
// ==========================================
import Navbar from './components/Public/Navbar/Navbar';
import Login from './components/Public/Login/Login';
import CourseCatalog from './components/Public/CourseCatalog/CourseCatalog';
// Simple inline components for static pages to ensure the app runs immediately
const Home = () => <div style={{ padding: '3rem', textAlign: 'center' }}><h1>Welcome to EduManage Pro</h1><p>Your complete institutional management solution.</p></div>;
const AboutUs = () => <div style={{ padding: '3rem', textAlign: 'center' }}><h1>About Us</h1><p>Empowering education through technology.</p></div>;

// ==========================================
// SHARED PROTECTED COMPONENTS
// ==========================================
import DashboardLayout from './components/Shared/DashboardLayout/DashboardLayout';
import ProfileEdit from './components/Shared/ProfileEdit/ProfileEdit';
import Complaints from './components/Shared/Complaints/Complaints';
import GlobalNotifications from './components/Shared/Notifications/GlobalNotifications';

// ==========================================
// STUDENT COMPONENTS
// ==========================================
import StudentBatches from './components/Student/Batches/StudentBatches';
import StudentBatchDetail from './components/Student/Batches/StudentBatchDetail';

// ==========================================
// TEACHER COMPONENTS
// ==========================================
import TeacherBatches from './components/Teacher/Batches/TeacherBatches';
import TeacherBatchDetail from './components/Teacher/Batches/TeacherBatchDetail';
import TeacherSalary from './components/Teacher/Salary/TeacherSalary';

// ==========================================
// ASSISTANT COMPONENTS
// ==========================================
import UserRegistration from './components/Assistant/UserManagement/UserRegistration';
import BatchBuilder from './components/Assistant/BatchManagement/BatchBuilder';
import EnrollmentBuilder from './components/Assistant/EnrollmentManagement/EnrollmentBuilder';
import FinanceTracker from './components/Assistant/Finance/FinanceTracker';
import CourseModuleBuilder from './components/Assistant/CourseManagement/CourseModuleBuilder';
import AssistantPortal from './components/Assistant/Portal/AssistantPortal';

// ==========================================
// ADMIN COMPONENTS
// ==========================================
import AccountManagement from './components/Admin/AccountManagement/AccountManagement';

// ==========================================
// ROUTE PROTECTOR GUARD
// ==========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null; // AuthContext already handles the global loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized attempts to their proper dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

// ==========================================
// SHARED ASSISTANT/ADMIN ROUTES
// ==========================================
// Admins inherit all assistant tools, so we define them once and map them to both paths
const operationalRoutes = (
  <>
    <Route path="students" element={<UserRegistration />} />
    <Route path="teachers" element={<UserRegistration />} />
    <Route path="courses" element={<CourseModuleBuilder />} />
    <Route path="batches" element={<BatchBuilder />} />
    <Route path="enrollments" element={<EnrollmentBuilder />} />
    <Route path="finance" element={<FinanceTracker />} />
    <Route path="attendance" element={<div style={{padding:'2rem'}}>Global Attendance Module (To Be Built)</div>} />
    <Route path="certifications" element={<div style={{padding:'2rem'}}>Certification Module (To Be Built)</div>} />
    <Route path="notifications" element={<GlobalNotifications />} />
    <Route path="my-portal" element={<AssistantPortal />} />
    <Route path="complaints" element={<Complaints />} />
    <Route path="profile" element={<ProfileEdit />} />
    {/* Default redirect for /assistant or /admin root */}
    <Route index element={<Navigate to="profile" replace />} />
  </>
);

// ==========================================
// MAIN APP ROUTER
// ==========================================
const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="batches" element={<StudentBatches />} />
          <Route path="batches/:batchId" element={<StudentBatchDetail />} />
          <Route path="notifications" element={<GlobalNotifications />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="profile" element={<ProfileEdit />} />
          <Route index element={<Navigate to="batches" replace />} />
        </Route>

        {/* Teacher Routes */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="batches" element={<TeacherBatches />} />
          <Route path="batches/:batchId" element={<TeacherBatchDetail />} />
          <Route path="salary" element={<TeacherSalary />} />
          <Route path="notifications" element={<GlobalNotifications />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="profile" element={<ProfileEdit />} />
          <Route index element={<Navigate to="batches" replace />} />
        </Route>

        {/* Assistant Routes */}
        <Route 
          path="/assistant" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASSISTANT]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {operationalRoutes}
        </Route>

        {/* Admin Routes (Inherits Assistant + Account Deletion) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {operationalRoutes}
          {/* Admin Exclusive Routes */}
          <Route path="accounts" element={<AccountManagement />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;