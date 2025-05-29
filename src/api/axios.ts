import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
    baseURL: 'http://78.40.109.172:8000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle the error case
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
