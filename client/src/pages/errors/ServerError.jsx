import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

const ServerError = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="text-center max-w-md">
      <div className="text-9xl font-black text-slate-200 select-none leading-none">500</div>
      <div className="p-4 bg-orange-50 rounded-full inline-flex mb-4 -mt-2">
        <ServerCrash className="w-12 h-12 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Server Error</h1>
      <p className="text-slate-500 mb-8 text-sm">
        The server encountered an unexpected error. Please try again or contact support if the
        problem persists.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
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

export default ServerError;

