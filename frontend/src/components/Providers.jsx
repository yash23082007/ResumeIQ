'use client';

import { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { authAPI } from '@/services/api';

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMounted, setIsMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setIsMounted(true), 0);
    authAPI.me().then(({ data }) => {
      setUser(data.user);
    }).catch(() => {}).finally(() => setAuthLoading(false));

    // Load theme
    const savedTheme = localStorage.getItem('resumeiq_theme') || 'light';
    window.setTimeout(() => setTheme(savedTheme), 0);
    document.documentElement.setAttribute('data-theme', savedTheme);

    return () => window.clearTimeout(mountTimer);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setToken(null);
    if (typeof window !== 'undefined') localStorage.removeItem('resumeiq_token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authAPI.logout().catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resumeiq_token');
      localStorage.removeItem('resumeiq_user');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeiq_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <AuthContext.Provider value={{ user, token, login, logout, isMounted, authLoading }}>
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
