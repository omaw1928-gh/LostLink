import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lostlink_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lostlink_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('lostlink_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: newToken, data: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('lostlink_token', newToken);
      localStorage.setItem('lostlink_user', JSON.stringify(userData));
    }
    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    if (response.data.success) {
      const { token: newToken, data: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('lostlink_token', newToken);
      localStorage.setItem('lostlink_user', JSON.stringify(userData));
    }
    return response.data;
  };

  const updateProfile = async (formData) => {
    const response = await api.put('/auth/profile', formData);
    if (response.data.success && response.data.data) {
      setUser(response.data.data);
      localStorage.setItem('lostlink_user', JSON.stringify(response.data.data));
    }
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lostlink_token');
    localStorage.removeItem('lostlink_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
