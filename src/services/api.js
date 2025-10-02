import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('examTesterToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('examTesterToken');
      localStorage.removeItem('examTesterUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Exam API
export const examAPI = {
  createExam: (examData) => {
    const formData = new FormData();
    formData.append('title', examData.title);
    formData.append('duration', examData.duration);
    formData.append('examPdf', examData.examPdf);
    
    return api.post('/exams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getExams: () => api.get('/exams'),
  getExam: (id) => api.get(`/exams/${id}`),
  cancelExam: (id) => api.put(`/exams/${id}/cancel`),
  activateExam: (id) => api.put(`/exams/${id}/activate`),
};

// Submission API
export const submissionAPI = {
  submitAnswer: (submissionData) => {
    const formData = new FormData();
    formData.append('examId', submissionData.examId);
    formData.append('answerFile', submissionData.answerFile);
    
    return api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getSubmissions: (examId) => api.get(`/submissions/${examId}`),
  getAllSubmissions: () => api.get('/submissions'),
};

// Exam Attempt API
export const examAttemptAPI = {
  startAttempt: (examId) => api.post('/exam-attempts/start', { examId }),
  getAttempt: (examId) => api.get(`/exam-attempts/${examId}`),
  updateTime: (attemptId, timeRemaining) => api.put(`/exam-attempts/${attemptId}/time`, { timeRemaining }),
  completeAttempt: (attemptId) => api.put(`/exam-attempts/${attemptId}/complete`),
};

// User API (for admin dashboard)
export const userAPI = {
  getStudents: () => api.get('/users/students'),
  getTeachers: () => api.get('/users/teachers'),
};

export default api;
