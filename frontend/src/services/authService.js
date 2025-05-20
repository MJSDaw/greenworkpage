/**
 * Authentication Service
 * 
 * This service provides functions to manage the authentication token.
 */

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token
 * @param {object} userData - The user data
 * @param {string} userType - The user type (user or admin)
 */
export const setAuthToken = (token, userData = null, userType = null) => {
  localStorage.setItem('authToken', token);
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  if (userType) {
    localStorage.setItem('userType', userType);
  }
};

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  // Check for both 'authToken' and 'token' for compatibility
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

/**
 * Get the user data from localStorage
 * @returns {object|null} The user data or null if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Get the user type from localStorage
 * @returns {string|null} The user type or null if not found
 */
export const getUserType = () => {
  return localStorage.getItem('userType');
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userType');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get the authorization header for API requests
 * @returns {object} The authorization header
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Authenticated API requests with automatic 401 handling
 * @param {string} url - The API endpoint
 * @param {object} options - The fetch options
 * @returns {Promise} The fetch promise
 */
export const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // If the response status is 401 (Unauthorized), logout automatically
  if (response.status === 401) {
    console.log('Received 401 Unauthorized response, logging out...');
    removeAuthToken();
    // Redirect to home page
    window.location.href = '/';
  }

  return response;
};

// Add this function or re-export it from apiService
import { getUserProfile as apiGetUserProfile } from './apiService';

// Re-export the function
export const getUserProfile = apiGetUserProfile;
