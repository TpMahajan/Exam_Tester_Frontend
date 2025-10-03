import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SubmissionPage from './pages/SubmissionPage';
import ViewSubmissions from './pages/ViewSubmissions';
import AdminDashboard from './pages/AdminDashboard';
import { testAPIConfiguration } from './utils/apiTest';
import './App.css';

// Test API configuration in development
if (process.env.NODE_ENV === 'development') {
  testAPIConfiguration();
}

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/teacher" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/submission" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SubmissionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/view-submissions" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ViewSubmissions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
