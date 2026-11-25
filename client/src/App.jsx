import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Loader from './components/common/Loader';

// Lazy-load all pages for optimal code splitting
const Login = lazy(() => import('./pages/auth/Login'));
const DashboardRouter = lazy(() => import('./pages/dashboard/DashboardRouter'));
const StudentsList = lazy(() => import('./pages/students/StudentsList'));
const StudentProfile = lazy(() => import('./pages/students/StudentProfile'));
const TeachersList = lazy(() => import('./pages/teachers/TeachersList'));
const AcademicsPage = lazy(() => import('./pages/academics/AcademicsPage'));
const StudentAttendance = lazy(() => import('./pages/attendance/StudentAttendance'));
const FeeManagement = lazy(() => import('./pages/fees/FeeManagement'));
const ExaminationsPage = lazy(() => import('./pages/examinations/ExaminationsPage'));
const TimetablePage = lazy(() => import('./pages/timetable/TimetablePage'));
const HomeworkPage = lazy(() => import('./pages/homework/HomeworkPage'));
const FinancePage = lazy(() => import('./pages/finance/FinancePage'));
const LibraryPage = lazy(() => import('./pages/library/LibraryPage'));
const TransportPage = lazy(() => import('./pages/transport/TransportPage'));
const ReportsOverview = lazy(() => import('./pages/reports/ReportsOverview'));
const SchoolSettings = lazy(() => import('./pages/settings/SchoolSettings'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const NotFound = lazy(() => import('./pages/errors/NotFound'));
const Forbidden = lazy(() => import('./pages/errors/Forbidden'));
const ServerError = lazy(() => import('./pages/errors/ServerError'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader text="Loading..." />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              duration: 4500,
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/500" element={<ServerError />} />

            {/* Protected ERP Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/students" element={<StudentsList />} />
              <Route path="/students/:id" element={<StudentProfile />} />
              <Route path="/teachers" element={<TeachersList />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/attendance" element={<StudentAttendance />} />
              <Route path="/fees" element={<FeeManagement />} />
              <Route path="/examinations" element={<ExaminationsPage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/homework" element={<HomeworkPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/reports" element={<ReportsOverview />} />
              <Route path="/settings" element={<SchoolSettings />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
