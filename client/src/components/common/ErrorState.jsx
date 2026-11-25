import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading the data. Please try again.',
  onRetry = null,
  retryLabel = 'Try Again',
  isNetwork = false,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className={`p-4 rounded-full mb-4 ${isNetwork ? 'bg-amber-50' : 'bg-rose-50'}`}>
      {isNetwork ? (
        <WifiOff className="w-10 h-10 text-amber-500" />
      ) : (
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      )}
    </div>
    <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorState;

