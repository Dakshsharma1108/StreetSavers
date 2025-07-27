import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const initAuth = () => {
    const isAuth = authService.isAuthenticated(); // ← Checks token
    const currentUser = authService.getCurrentUser(); // ← Gets user
    setIsAuthenticated(isAuth); // ← Sets `true` if token exists
    setUser(currentUser);
    setLoading(false); // ← This ensures ProtectedRoute waits
  };
  initAuth();
}, []);


  const login = async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
