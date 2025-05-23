# Authentication Token Usage Guide

## Overview

This document explains how to use the authentication token that is returned after a successful user registration. The token should be included in the headers of subsequent API requests to authenticate the user.

## Authentication Flow

1. When a user successfully registers via the `/api/register` endpoint, the server returns a response containing a JWT token.
2. The authentication token is stored in the browser's localStorage, along with user data.
3. For subsequent authenticated API requests, this token should be included in the request headers.

## How to Use the Token in API Requests

There are two ways to use the authentication token:

### 1. Using the `authenticatedFetch` Utility Function

```javascript
import { authenticatedFetch } from '../services/authService';

// Example of a GET request
const getProfile = async () => {
  try {
    const response = await authenticatedFetch('${API_BASE_URL}/api/profile');
    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

// Example of a POST request
const updateProfile = async (profileData) => {
  try {
    const response = await authenticatedFetch('${API_BASE_URL}/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

### 2. Using the `getAuthHeader` Utility Function

```javascript
import { getAuthHeader } from '../services/authService';

// Example of a fetch request with authorization headers
const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader() // This adds the Authorization: Bearer token header
      }
    });
    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## Additional Authentication Utilities

The `authService.js` file provides several utility functions:

- `setAuthToken(token, userData)`: Stores the authentication token and optional user data in localStorage
- `getAuthToken()`: Retrieves the stored authentication token
- `getUserData()`: Retrieves the stored user data
- `removeAuthToken()`: Clears the authentication token and user data (for logout)
- `isAuthenticated()`: Checks if a user is authenticated (has a token)
- `getAuthHeader()`: Returns the authorization header object
- `authenticatedFetch(url, options)`: Wrapper for fetch that includes the authorization header

## Security Considerations

1. The token stored in localStorage is accessible to any script running on the same domain.
2. For production applications, consider implementing token refresh mechanisms and CSRF protection.
3. Use HTTPS to prevent token interception during transmission.
