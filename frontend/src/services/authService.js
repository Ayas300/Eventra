import apiClient from './api';

// Prefix for auth endpoints
const AUTH_PREFIX = '/auth';

/**
 * Register new user
 * @param {Object} userData - { name, email, password, confirmPassword, role }
 * @returns {Promise} - { token, user }
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post(`${AUTH_PREFIX}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise} - { token, user }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post(`${AUTH_PREFIX}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Get current user info
 * @param {String} token - JWT token
 * @returns {Promise} - { user }
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await apiClient.get(`${AUTH_PREFIX}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

/**
 * Logout user (client-side only)
 */
export const logoutUser = () => {
  // Remove token and user from localStorage (done by AuthContext)
  return Promise.resolve({ message: 'Logged out successfully' });
};
