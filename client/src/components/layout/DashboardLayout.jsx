import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import { WifiOff } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Initializing School ERP Portal..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-xs font-medium flex items-center justify-center gap-2 py-1.5 px-4">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>You are offline. Some features may not work until connection is restored.</span>
        </div>
      )}

      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed top-0 left-0 z-40 h-full transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onMobileClose={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Dynamic Page Content */}
        <main className={`flex-1 p-4 md:p-6 ${!isOnline ? 'mt-24' : 'mt-16'}`}>
          <Breadcrumb />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
