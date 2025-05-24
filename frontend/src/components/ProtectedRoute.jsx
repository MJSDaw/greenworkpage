import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserType } from '../services/authService';

/**
 * ProtectedRoute component to handle authentication-based routing
 * @param {object} props - Component props
 * @param {string} props.userType - Required user type ('admin', 'user', or 'any')
 * @param {JSX.Element} props.children - Child components to render if authenticated
 * @returns {JSX.Element} - Rendered component
 */
const ProtectedRoute = ({ userType, children }) => {
  // Check if the user is authenticated
  const authenticated = isAuthenticated();
  
  // Get the user type from localStorage
  const currentUserType = getUserType();
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If userType is 'any', allow access for any authenticated user
  if (userType === 'any') {
    return children;
  }
  
  // For specific user types, check if the user has the required type
  if (currentUserType === userType) {
    return children;
  }
  
  // If user doesn't have required permissions, redirect to home
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
