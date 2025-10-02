import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
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
