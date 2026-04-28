import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  };

  // Register function
  const register = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Check if user has specific role
  const hasRole = (role) => user && user.role === role;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
