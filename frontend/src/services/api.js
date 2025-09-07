// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// Attendance API
export const attendanceAPI = {
    generateQR: (classSessionId) => api.post('/attendance/generate-qr', { classSessionId }),
    markAttendanceQR: (qrData) => api.post('/attendance/mark-qr', { qrData }),
    getStudentAttendance: (params) => api.get('/attendance/student', { params }),
};

// Activities API
export const activitiesAPI = {
    getRecommendations: (params) => api.get('/activities/recommendations', { params }),
    getAllActivities: (params) => api.get('/activities', { params }),
    createActivity: (activityData) => api.post('/activities', activityData),
};

export default api;
