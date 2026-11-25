import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeMap = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers & Staff',
  '/academics': 'Academics',
  '/attendance': 'Attendance',
  '/fees': 'Fee Management',
  '/examinations': 'Examinations',
  '/timetable': 'Timetable',
  '/homework': 'Homework',
  '/finance': 'Accounts & Finance',
  '/library': 'Library',
  '/transport': 'Transport',
  '/reports': 'Reports & Exports',
  '/settings': 'School Settings',
  '/users': 'User Management',
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Don't show on dashboard home
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  const crumbs = pathnames.map((segment, idx) => {
    const path = '/' + pathnames.slice(0, idx + 1).join('/');
    const label =
      routeMap[path] ||
      (segment.match(/^\d+$/)
        ? `#${segment}`
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '));
    return { path, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-slate-500 mb-4">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-blue-600 transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {idx === crumbs.length - 1 ? (
            <span className="font-medium text-slate-700" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

