/**
 * Authentication Service
 * 
 * This service provides functions to manage the authentication token.
 */

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token
 * @param {object} userData - The user data
 */
export const setAuthToken = (token, userData = null) => {
  localStorage.setItem('authToken', token);
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
};

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
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
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
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
 * Example usage for API requests
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

  return response;
};
