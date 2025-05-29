import axios from 'axios';

// Different base URLs for development and production
const API_URL = process.env.NODE_ENV === 'production'
    ? 'http://78.40.109.172:8000/api/v1'
    : 'http://78.40.109.172:8000/api/v1';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from storage if exists
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error
            localStorage.removeItem('auth_token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
