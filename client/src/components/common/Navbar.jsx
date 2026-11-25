import React, { useState } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ isCollapsed, onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 transition-all duration-300 ease-in-out bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 no-print ${
        isCollapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left side */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm font-semibold text-slate-800 hidden sm:inline">
          Iqbal Memorial Public School &amp; College
        </span>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Session 2025-2026
        </span>
        <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          PKR (&#8360;)
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="School notices"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">School Notices</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="font-semibold text-slate-800">Annual Sports Gala 2026</p>
                  <p className="text-slate-500 mt-0.5">Registration now open for athletics &amp; cricket.</p>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="font-semibold text-slate-800">Monthly Fee Reminder</p>
                  <p className="text-slate-500 mt-0.5">Fees are due by 10th of every month.</p>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="font-semibold text-slate-800">Parent Teacher Meeting</p>
                  <p className="text-slate-500 mt-0.5">Report cards distribution this Saturday.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.roleDisplayName || user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
