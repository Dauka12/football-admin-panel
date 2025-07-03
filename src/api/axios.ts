import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
    baseURL: 'https://sport-empire.kz/api/v1',
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
    (response) => {
        // Ensure response.data is properly formatted
        if (response.data === null || response.data === undefined) {
            response.data = [];
        }
        return response;
    },
    (error) => {
        // Handle the error case
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
                // Handle unauthorized access
                localStorage.clear(); // Clear all localStorage data
                window.location.href = '/auth'; // Redirect to login page
            }
            
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                endpoint: error.config.url
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Request Error:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('API Setup Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
