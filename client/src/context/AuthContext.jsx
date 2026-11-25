import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('school_erp_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          localStorage.removeItem('school_erp_token');
          localStorage.removeItem('school_erp_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { accessToken, user: userData } = res.data;
        localStorage.setItem('school_erp_token', accessToken);
        localStorage.setItem('school_erp_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Network error or server unavailable';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('school_erp_token');
      localStorage.removeItem('school_erp_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return roles.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

