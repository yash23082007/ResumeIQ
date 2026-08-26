import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ResumeDetail from './pages/ResumeDetail';
import './index.css';

export { AuthContext, ThemeContext };

function App() {
  // Lazy state initialization from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('resumeiq_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resumeiq_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // Pure Light Theme
  const [theme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('resumeiq_theme', 'light');
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('resumeiq_token', tokenData);
    localStorage.setItem('resumeiq_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('resumeiq_token');
    localStorage.removeItem('resumeiq_user');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {}, setTheme: () => {} }}>
      <AuthContext.Provider value={{ user, token, login, logout }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/resume/:id" element={user ? <ResumeDetail /> : <Navigate to="/auth" />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
