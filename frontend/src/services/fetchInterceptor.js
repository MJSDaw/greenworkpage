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
    const response = await originalFetch(input, init);
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    return response;
  };
};
