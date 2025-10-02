import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('examTesterUser');
    const savedToken = localStorage.getItem('examTesterToken');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await authAPI.login({ email, password, role });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        setUser(userData);
        localStorage.setItem('examTesterUser', JSON.stringify(userData));
        localStorage.setItem('examTesterToken', token);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email, password, role, name) => {
    try {
      const response = await authAPI.signup({ email, password, role, name });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        setUser(userData);
        localStorage.setItem('examTesterUser', JSON.stringify(userData));
        localStorage.setItem('examTesterToken', token);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Signup failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('examTesterUser');
    localStorage.removeItem('examTesterToken');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
