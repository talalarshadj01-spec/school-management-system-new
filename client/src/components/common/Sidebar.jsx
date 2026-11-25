import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  DollarSign,
  BookMarked,
  Bus,
  FileBarChart,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  School
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  // Define navigation items with allowed roles
  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['super_admin', 'admin', 'principal', 'teacher', 'accountant', 'receptionist', 'librarian', 'student', 'parent']
    },
    {
      title: 'Students',
      icon: Users,
      path: '/students',
      roles: ['super_admin', 'admin', 'principal', 'receptionist', 'teacher', 'accountant']
    },
    {
      title: 'Teachers & Staff',
      icon: GraduationCap,
      path: '/teachers',
      roles: ['super_admin', 'admin', 'principal', 'receptionist']
    },
    {
      title: 'Academics',
      icon: BookOpen,
      path: '/academics',
      roles: ['super_admin', 'admin', 'principal']
    },
    {
      title: 'Attendance',
      icon: CalendarCheck,
      path: '/attendance',
      roles: ['super_admin', 'admin', 'principal', 'teacher', 'receptionist']
    },
    {
      title: 'Fee Management',
      icon: CreditCard,
      path: '/fees',
      roles: ['super_admin', 'admin', 'principal', 'accountant']
    },
    {
      title: 'Examinations',
      icon: FileSpreadsheet,
      path: '/examinations',
      roles: ['super_admin', 'admin', 'principal', 'teacher']
    },
    {
      title: 'Timetable',
      icon: Calendar,
      path: '/timetable',
      roles: ['super_admin', 'admin', 'principal', 'teacher', 'student', 'parent']
    },
    {
      title: 'Homework',
      icon: BookMarked,
      path: '/homework',
      roles: ['super_admin', 'admin', 'principal', 'teacher', 'student', 'parent']
    },
    {
      title: 'Accounts & Finance',
      icon: DollarSign,
      path: '/finance',
      roles: ['super_admin', 'admin', 'accountant']
    },
    {
      title: 'Library',
      icon: BookMarked,
      path: '/library',
      roles: ['super_admin', 'admin', 'librarian', 'teacher']
    },
    {
      title: 'Transport',
      icon: Bus,
      path: '/transport',
      roles: ['super_admin', 'admin', 'principal', 'receptionist']
    },
    {
      title: 'Reports & Exports',
      icon: FileBarChart,
      path: '/reports',
      roles: ['super_admin', 'admin', 'principal', 'accountant']
    },
    {
      title: 'User Management',
      icon: ShieldCheck,
      path: '/users',
      roles: ['super_admin', 'admin']
    },
    {
      title: 'School Settings',
      icon: Settings,
      path: '/settings',
      roles: ['super_admin', 'admin']
    }
  ];

  const allowedNav = navItems.filter((item) => {
    if (role === 'super_admin') return true;
    return item.roles.includes(role);
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-navy-900 border-r border-navy-800 flex flex-col no-print ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-navy-950 border-b border-navy-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs shrink-0">
            <School className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">IQBAL MEMORIAL</h1>
              <p className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">School ERP System</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onMobileClose && onMobileClose()}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-3 bg-navy-950 border-t border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.firstName?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
          {!isCollapsed && (
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 bg-blue-900/60 text-blue-300 rounded font-medium capitalize">
                {user?.roleDisplayName || user?.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

