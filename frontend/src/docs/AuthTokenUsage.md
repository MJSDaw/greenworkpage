# Authentication Token Usage Documentation

## Overview

After a successful user registration or login, the API will return an authentication token. This token should be used for any subsequent API requests that require authentication.

## Storage

The authentication token is stored in the browser's localStorage for persistence. This allows the token to remain available even after the user refreshes the page or closes and reopens the browser.

## Token Structure

The authentication token is a bearer token in the format:
```
36|xg6AS037XTaU0qIU5vrNwTlAFm8wPjOsuiElXSe4e6f0618c
```

## How to Use the Token in API Requests

### 1. Using the Authentication Service

We've created a set of utility functions in `src/services/authService.js` to simplify working with the authentication token.

```javascript
import { authenticatedFetch, getAuthHeader } from '../services/authService';

// Option 1: Using the authenticatedFetch helper
const getUserData = async () => {
  try {
    const response = await authenticatedFetch('https://localhost:8443/api/user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// Option 2: Using fetch with getAuthHeader
const createResource = async (data) => {
  try {
    const response = await fetch('https://localhost:8443/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader() // This adds the Authorization header
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating resource:', error);
  }
};
```

### 2. Manual Method

If you prefer to use the token directly, you can retrieve it from localStorage and include it in your API requests:

```javascript
const makeApiCall = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No authentication token found');
    return;
  }
  
  try {
    const response = await fetch('https://localhost:8443/api/protected-endpoint', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

## Laravel Sanctum Authentication

The backend uses Laravel Sanctum for token-based authentication. The token must be included in the HTTP Authorization header as a Bearer token for all protected routes.

### Protected Routes in the Backend

Protected routes in the Laravel backend are grouped under middleware as shown in the API routes file:

```php
// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // These routes require authentication
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('logout', [AuthController::class, 'logout']);
    // Other protected routes...
});
```

## Token Expiration and Refresh

By default, Laravel Sanctum tokens do not expire. If token expiration is configured on the backend, you'll need to implement a refresh mechanism.

## Security Considerations

1. Always use HTTPS for API requests to prevent token interception
2. Implement token refresh logic if needed
3. Clear the token on logout by calling `removeAuthToken()`
4. Consider implementing additional security measures for sensitive operations
