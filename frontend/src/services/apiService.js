/**
 * Example API Service
 * 
 * This service demonstrates how to use the authentication token in API requests.
 */

import { getAuthHeader, authenticatedFetch } from './authService';

/**
 * Example: Get user profile
 * @returns {Promise} The API response
 */
export const getUserProfile = async () => {
  try {
    const response = await authenticatedFetch('https://localhost:8443/api/user');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Example: Create a resource
 * @param {object} data - The data to send
 * @returns {Promise} The API response
 */
export const createResource = async (data) => {
  try {
    const response = await authenticatedFetch('https://localhost:8443/api/resources', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create resource');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

/**
 * Example: Update a resource
 * @param {number} id - The resource ID
 * @param {object} data - The data to send
 * @returns {Promise} The API response
 */
export const updateResource = async (id, data) => {
  try {
    const response = await fetch(`https://localhost:8443/api/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update resource');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

/**
 * Example: Delete a resource
 * @param {number} id - The resource ID
 * @returns {Promise} The API response
 */
export const deleteResource = async (id) => {
  try {
    const response = await fetch(`https://localhost:8443/api/resources/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete resource');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};
