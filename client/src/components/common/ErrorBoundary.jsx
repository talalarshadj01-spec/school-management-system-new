import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-16 text-center">
          <div className="p-4 bg-rose-50 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Page Error</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            This section encountered an unexpected error. You can try again or navigate to the dashboard.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-left text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 max-w-lg w-full">
              <summary className="cursor-pointer font-medium text-slate-600 mb-2">Error Details (dev only)</summary>
              <pre className="whitespace-pre-wrap break-words">{this.state.error.toString()}</pre>
            </details>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

