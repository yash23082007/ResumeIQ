'use client';

import { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load auth credentials
    const savedToken = localStorage.getItem('resumeiq_token');
    const savedUser = localStorage.getItem('resumeiq_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('resumeiq_token');
        localStorage.removeItem('resumeiq_user');
      }
    }

    // Load theme
    const savedTheme = localStorage.getItem('resumeiq_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeiq_token', tokenData);
      localStorage.setItem('resumeiq_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
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
      <AuthContext.Provider value={{ user, token, login, logout, isMounted }}>
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
