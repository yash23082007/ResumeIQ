'use client';

import { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { authAPI } from '@/services/api';

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMounted, setIsMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    authAPI.me().then(({ data }) => {
      setUser(data.user);
    }).catch(() => {
      // Not authenticated or server unavailable — normal on public pages
    }).finally(() => setAuthLoading(false));

    // Load theme
    try {
      const savedTheme = localStorage.getItem('resumeiq_theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch { /* SSR safety */ }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    authAPI.logout().catch(() => {});
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('resumeiq_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    } catch { /* SSR safety */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isMounted, authLoading }}>
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
