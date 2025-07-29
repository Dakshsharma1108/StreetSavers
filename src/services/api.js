import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.message === 'Network Error') {
      console.error('Network Error: Cannot connect to the backend server. Please make sure the server is running.');
    } else {
      console.error('API Error:', error.response?.data || error.message, error);
    }
    
    // Handle different error status codes
    if (error.response?.status === 401) {
      // Handle unauthorized access (not logged in)
      console.warn('Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    } 
    else if (error.response?.status === 403) {
      // Handle forbidden access (wrong role)
      // We'll let components handle this with the error message
      console.error('Permission denied:', error.response?.data?.message || 'You do not have permission to perform this action');
    }
    
    return Promise.reject(error);
  }
);

export default api;
