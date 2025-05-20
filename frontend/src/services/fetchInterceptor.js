/**
 * Fetch Interceptor
 * 
 * This service provides an interceptor for fetch API to handle authentication errors.
 */

import { removeAuthToken } from './authService';

/**
 * Handle 401 Unauthorized responses
 * This will automatically logout the user when a 401 response is received
 */
export const handleUnauthorized = () => {
  console.log('Token expired, logging out...');
  removeAuthToken();
  
  // Redirect to home page
  window.location.href = '/';
};

/**
 * Override the native fetch function to intercept 401 responses
 */
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input, init) {
    // Get the URL from the input
    const url = typeof input === 'string' ? input : input.url;
    
    // Skip intercepting 401 responses for authentication-related routes
    const isAuthRoute = url.includes('/api/login') || url.includes('/api/register');
    
    const response = await originalFetch(input, init);
    
    // Only handle 401 responses for non-auth routes
    if (response.status === 401 && !isAuthRoute) {
      handleUnauthorized();
    }
    
    return response;
  };
};
