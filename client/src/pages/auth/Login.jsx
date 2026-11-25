import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@school.edu.pk');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const setDemoAccount = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <School className="w-9 h-9" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Iqbal Memorial Public School
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Production ERP & Academic Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@school.edu.pk"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 mt-2"
              icon={ArrowRight}
            >
              Sign In to ERP Portal
            </Button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@school.edu.pk', 'Admin@12345')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('principal@school.edu.pk', 'Admin@12345')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Principal
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('asif.math@school.edu.pk', 'Teacher@123')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Teacher (Math)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('accountant@school.edu.pk', 'Staff@123')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('student.hamza@school.edu.pk', 'Student@123')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('parent.hamza@school.edu.pk', 'Parent@123')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium text-slate-700 text-left transition-colors"
              >
                Parent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

