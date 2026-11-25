import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import TeacherDashboard from '../teachers/TeacherDashboard';
import StudentDashboard from '../students/StudentDashboard';
import ParentDashboard from '../parents/ParentDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'student') return <StudentDashboard />;
  if (role === 'parent') return <ParentDashboard />;

  return <AdminDashboard />;
};

export default DashboardRouter;

