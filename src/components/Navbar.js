import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return (
      <nav className="navbar">
        <h1>Exam Tester</h1>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <h1>Exam Tester</h1>
      <div className="navbar-content">
        <span className="user-info">Welcome, {user.name} ({user.role})</span>
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary navbar-logout"
        >
          Logout
        </button>
        <button 
          onClick={toggleMenu}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <span className="mobile-user-info">Welcome, {user.name}</span>
            <span className="mobile-role-info">Role: {user.role}</span>
            <button 
              onClick={toggleTheme}
              className="btn btn-secondary mobile-theme-toggle"
            >
              {isDarkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </button>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary mobile-logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
