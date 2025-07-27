import api from './api.js';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        // Store both token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Verify the token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Stored token:', storedToken ? 'Present' : 'Missing');
        
        return response.data;
      } else {
        throw new Error('No token received in login response');
      }
    } catch (error) {
      console.error('Login error details:', error);
      localStorage.removeItem('token'); // Clean up if there's an error
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    }
  },

  // Register user
  register: async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
}
,

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
