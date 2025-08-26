import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';

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
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      
      if (token && tokenExpiration) {
        const currentTime = new Date().getTime();
        const expirationTime = parseInt(tokenExpiration);
        
        // Check if token is expired
        if (currentTime > expirationTime) {
          console.log('Token expired, logging out');
          authService.logout();
          setLoading(false);
          return;
        }
        
        try {
          const response = await authService.verifyToken();
          if (response.valid) {
            const userData = authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            authService.logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
