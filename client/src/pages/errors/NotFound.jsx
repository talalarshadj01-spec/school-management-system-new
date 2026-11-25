import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="text-center max-w-md">
      <div className="text-9xl font-black text-slate-200 select-none leading-none">404</div>
      <div className="p-4 bg-blue-50 rounded-full inline-flex mb-4 -mt-2">
        <FileQuestion className="w-12 h-12 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8 text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;

