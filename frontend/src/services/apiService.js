/**
 * API Service
 * 
 * Este servicio centraliza todas las llamadas a la API de la aplicación.
 */

import { getAuthHeader, authenticatedFetch } from './authService';

/**
 * Función base para realizar peticiones a la API
 * @param {string} url - URL completa del endpoint
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object|null} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para la petición
 * @param {boolean} isAuthenticated - Indica si la petición requiere autenticación
 * @param {boolean} isFormData - Indica si los datos son FormData (para subir archivos)
 * @returns {Promise} La respuesta del servidor
 */
export const baseFetch = async (
  url,
  method = 'GET',
  data = null,
  options = {},
  isAuthenticated = true,
  isFormData = false
) => {
  try {
    // Preparar headers según el tipo de datos
    let headers = {};
    
    if (isAuthenticated) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    if (!isFormData && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
    
    // Combinar con headers personalizados si existen
    if (options.headers) {
      headers = { ...headers, ...options.headers };
    }
    
    // Configurar el cuerpo de la petición según el tipo de datos
    let body = undefined;
    if (data) {
      if (isFormData) {
        body = data; // FormData ya está listo para enviar
      } else if (method !== 'GET') {
        body = JSON.stringify(data);
      }
    }
    
    // Configurar opciones de la petición
    const fetchOptions = {
      method,
      headers,
      body,
      ...options,
    };

    // Realizar la petición
    const response = await fetch('https://localhost:8443' + url, fetchOptions);
    
    // Procesar la respuesta en formato texto
    const responseText = await response.text();
    
    // Si la respuesta está vacía, devolver un objeto vacío
    if (!responseText) {
      return { success: response.ok };
    }
    
    // Intentar parsear la respuesta como JSON
    try {
      const result = JSON.parse(responseText);
      // Si la respuesta no es exitosa, lanzar un error
      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
      }
      return result;
    } catch (parseError) {
      console.error('Error al parsear respuesta JSON:', parseError);
      // Si no se puede parsear, devolver el texto original
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return { success: response.ok, data: responseText };
    }
    
  } catch (error) {
    console.error(`Error en petición a ${url}:`, error);
    throw error;
  }
};

// ==================== Autenticación ====================

/**
 * Inicia sesión de usuario
 * @param {Object} credentials - Credenciales de inicio de sesión {email, password}
 * @returns {Promise} La respuesta del servidor
 */
export const login = async (credentials) => {
  return baseFetch('/api/login', 'POST', credentials, {}, false);
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise} La respuesta del servidor
 */
export const register = async (userData) => {
  return baseFetch('/api/register', 'POST', userData, {}, false);
};

// ==================== Usuarios ====================

/**
 * Obtiene la información del usuario autenticado
 * @returns {Promise} Los datos del usuario
 */
export const getUserProfile = async () => {
  return baseFetch('/api/user', 'GET');
};

/**
 * Obtiene la lista de usuarios (solo admin)
 * @returns {Promise} Lista de usuarios
 */
export const getUsers = async () => {
  return baseFetch('/api/admin/users', 'GET');
};

/**
 * Crea o actualiza un usuario
 * @param {Object} userData - Datos del usuario
 * @param {Number|null} userId - ID del usuario (null para crear nuevo)
 * @param {Object} originalUser - Datos originales del usuario (para comparar cambios)
 * @returns {Promise} Respuesta del servidor
 */
export const saveUser = async (userData, userId = null, originalUser = null) => {
  const url = userId ? `/api/admin/users/${userId}` : '/api/register';
  const method = userId ? 'PUT' : 'POST';
  const isAuthenticated = userId ? true : false;
  // Si es una actualización, mantener los valores originales y actualizar solo los campos modificados
  if (userId && originalUser) {
    const dataToSend = { ...originalUser }; // Comenzar con todos los datos originales

    // Actualizar solo los campos que han cambiado y no están vacíos
    Object.keys(userData).forEach(key => {
      if (userData[key] !== originalUser[key] && userData[key] !== '') {
        dataToSend[key] = userData[key];
      }
    });

    // Si no hay cambios en el email, asegurarnos de que no se valide
    if (dataToSend.email === originalUser.email) {
      dataToSend.skip_email_validation = true;
    }

    // Asegurarnos de que el ID está presente
    dataToSend.id = userId;

    return baseFetch(url, method, dataToSend, {}, isAuthenticated);
  }

  // Si es un nuevo registro, enviar todos los datos
  return baseFetch(url, method, userData, {}, isAuthenticated);
};

// ==================== Administrador ====================

/**
 * Actualiza la imagen de perfil del administrador
 * @param {Number} adminId - ID del administrador
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise} Respuesta del servidor
 */
export const updateAdminImage = async (adminId, imageFile) => {
  // Crear FormData para enviar la imagen
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return baseFetch(`/api/admin/${adminId}/updateImage`, 'POST', formData, {}, true, true);
};

// ==================== Espacios ====================

/**
 * Obtiene la lista de espacios
 * @returns {Promise} Lista de espacios
 */
export const getSpaces = async () => {
  return baseFetch('/api/spaces', 'GET');
};

/**
 * Guarda o actualiza un espacio
 * @param {Object} spaceData - Datos del espacio
 * @param {Number|null} spaceId - ID del espacio (null para crear nuevo)
 * @returns {Promise} Respuesta del servidor
 */
export const saveSpace = async (spaceData, spaceId = null) => {
  const url = spaceId ? `/api/spaces/${spaceId}` : '/api/spaces';
  const method = spaceId ? 'PUT' : 'POST';
  
  return baseFetch(url, method, spaceData);
};

// ==================== Reservas ====================

/**
 * Obtiene la lista de reservas
 * @returns {Promise} Lista de reservas
 */
export const getBookings = async () => {
  return baseFetch('/api/getactivebookings', 'GET');
};

/**
 * Obtiene la lista de reservas completadas
 * @returns {Promise} Lista de reservas completadas
 */
export const getCompletedBookings = async () => {
  return baseFetch('/api/getinactivebookings', 'GET');
};

/**
 * Guarda o actualiza una reserva
 * @param {Object} bookingData - Datos de la reserva
 * @param {Number|null} bookingId - ID de la reserva (null para crear nueva)
 * @returns {Promise} Respuesta del servidor
 */
export const saveBooking = async (bookingData, bookingId = null) => {
  const url = bookingId ? `/api/bookings/${bookingId}` : '/api/bookings';
  const method = bookingId ? 'PUT' : 'POST';
  
  return baseFetch(url, method, bookingData);
};

/**
 * Crea una nueva reserva
 * @param {Object} bookingData - Datos de la reserva
 * @returns {Promise} Respuesta del servidor
 */
export const createBooking = async (bookingData) => {
  return baseFetch('/api/bookings', 'POST', bookingData);
};

/**
 * Actualiza una reserva existente
 * @param {string} id - ID de la reserva
 * @param {Object} bookingData - Datos actualizados de la reserva
 * @returns {Promise} Respuesta del servidor
 */
export const updateBooking = async (id, bookingData) => {
  return baseFetch(`/api/bookings/${id}`, 'PUT', bookingData);
};

// ==================== Pagos ====================

/**
 * Obtiene la lista de pagos pendientes
 * @returns {Promise} Lista de pagos pendientes
 */
export const getPendingPayments = async () => {
  return baseFetch('/api/admin/pending-payments', 'GET');
};

/**
 * Obtiene la lista de pagos completados
 * @returns {Promise} Lista de pagos completados
 */
export const getCompletedPayments = async () => {
  return baseFetch('/api/admin/completed-payments', 'GET');
};

/**
 * Guarda o actualiza un pago
 * @param {Object} paymentData - Datos del pago
 * @param {Number|null} paymentId - ID del pago (null para crear nuevo)
 * @returns {Promise} Respuesta del servidor
 */
export const savePayment = async (paymentData, paymentId = null) => {
  const url = paymentId ? `/api/payments/${paymentId}` : '/api/payments';
  const method = paymentId ? 'PUT' : 'POST';
  
  return baseFetch(url, method, paymentData);
};

// ==================== Auditorías ====================

/**
 * Obtiene la lista de auditorías
 * @returns {Promise} Lista de auditorías
 */
export const getAudits = async () => {
  return baseFetch('/api/admin/audits', 'GET');
};

/**
 * Create a new contact (public endpoint - no auth required)
 * @param {object} contactData - Contact information (name, email, termsAndConditions)
 * @returns {Promise} The API response
 */
export const createContact = async (contactData) => {
  return baseFetch('/api/contacts', 'POST', contactData, {}, false);
};
