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
    
    // Base URL for the API
    const baseURL = 'https://localhost:8443';  // Make sure this matches your Laravel backend URL
    const apiUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
    
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
    };    // Realizar la petición
    const response = await fetch('https://localhost:8443' + url, fetchOptions);
    
    // Check for 422 status (Unprocessable Entity) - typically expired session or validation error
    if (response.status === 401) {
      console.log('Session expired(401). Logging out...');
      // Import directly to avoid circular dependency
      const { removeAuthToken } = await import('./authService');
      removeAuthToken();
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
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
      // Si no se puede parsear, devolver el texto original
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return { success: response.ok, data: responseText };
    }
    
  } catch (error) {
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
 * Obtiene la lista de usuarios con paginación (solo admin)
 * @param {number} page - Número de página actual
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Lista de usuarios paginada
 */
export const getUsers = async (page = 1, perPage = 3) => {
  try {
    const response = await baseFetch(`/api/admin/users?page=${page}&per_page=${perPage}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  }
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

/**
 * Elimina un usuario
 * @param {Number|null} userId - ID del usuario a eliminar
 * @returns {Promise} Respuesta del servidor
 */
export const deleteUser = async (userId = null,) => {
  const url = `/api/users/${userId}`;
  const method = 'DELETE';

  return baseFetch(url, method, null, {}, true);
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
 * Obtiene la lista de espacios con paginación
 * @param {number} page - Número de página actual
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Lista de espacios paginada
 */
export const getSpaces = async (page = 1, perPage = 3) => {
  try {
    return await baseFetch(`/api/spaces?page=${page}&per_page=${perPage}`, 'GET', null, {}, false);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return { success: false, data: { data: [], last_page: 1, current_page: 1 } };
  }
};

/**
 * Guarda o actualiza un espacio
 * @param {Object|FormData} spaceData - Datos del espacio
 * @param {Number|null} spaceId - ID del espacio (null para crear nuevo)
 * @param {Boolean} isFormData - Indica si los datos son FormData (para subir archivos)
 * @returns {Promise} Respuesta del servidor
 */
export const saveSpace = async (spaceData, spaceId = null, isFormData = false) => {
  const url = spaceId ? `/api/admin/spaces/${spaceId}` : '/api/admin/spaces';
  const method = spaceId ? 'PUT' : 'POST';
  
  // Si es PUT pero tenemos FormData, necesitamos agregar el método _method
  if (isFormData && method === 'PUT') {
    spaceData.append('_method', 'PUT');
    return baseFetch(url, 'POST', spaceData, {}, true, true);
  }
  
  return baseFetch(url, method, spaceData, {}, true, isFormData);
};

/**
 * Obtiene un espacio específico por su ID
 * @param {Number} spaceId - ID del espacio a consultar
 * @returns {Promise} Los datos del espacio
 */
export const getSpaceById = async (spaceId) => {
  try {
    const response = await baseFetch(`/api/spaces/${spaceId}`, 'GET');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un espacio específico por su ID
 * @param {Number} spaceId - ID del espacio a consultar
 * @returns {Promise} Los datos del espacio
 */
export const deleteSpace = async (spaceId) => {
  try {
    const response = await baseFetch(`/api/admin/spaces/${spaceId}`, 'DELETE');
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== Reservas ====================

/**
 * Obtiene las reservas futuras
 * @param {number} page - Página actual
 * @param {number} perPage - Elementos por página
 * @returns {Promise} Lista de reservas futuras paginada
 */
export const getUpcomingBookings = (page = 1, perPage = 3) => {
  return baseFetch(`/api/getupcominbookings?page=${page}&per_page=${perPage}`);
};

/**
 * Obtiene las reservas pasadas
 * @param {number} page - Página actual
 * @param {number} perPage - Elementos por página
 * @returns {Promise} Lista de reservas pasadas paginada
 */
export const getPastBookings = (page = 1, perPage = 3) => {
  return baseFetch(`/api/getpastbookings?page=${page}&per_page=${perPage}`);
};

/**
 * Crea una nueva reserva
 * @param {Object} bookingData - Datos para la reserva (space_id, start_time, end_time, status)
 * @returns {Promise} La respuesta del servidor
 */
export const createBooking = (bookingData) => {
  return baseFetch(`/api/bookings/create`, 'POST', bookingData);
};

/**
 * Obtiene una reserva específica por su ID
 * @param {number} id - ID de la reserva
 * @param {number} page - Número de página actual (para datos relacionados)
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Los datos de la reserva
 */
export const getBookingById = (id, page = 1, perPage = 10) => {
  return baseFetch(`/api/my-bookings/${id}?page=${page}&per_page=${perPage}`);
};

/**
 * Actualiza una reserva existente
 * @param {number} id - ID de la reserva a actualizar
 * @param {Object} updatedData - Datos actualizados (space_id, start_time, end_time, status)
 * @returns {Promise} La respuesta del servidor
 */
export const updateBooking = (id, updatedData) => {
  return baseFetch(`/api/bookings/${id}`, 'PUT', updatedData);
};

/**
 * Elimina una reserva
 * @param {number} id - ID de la reserva a eliminar
 * @returns {Promise} La respuesta del servidor
 */
export const deleteBooking = (id) => {
  return baseFetch(`/api/bookings/${id}`, 'DELETE');
};

/**
 * Obtiene todas las reservas del usuario autenticado
 * @param {number} page - Página actual
 * @param {number} perPage - Elementos por página
 * @returns {Promise} Lista de reservas del usuario paginada
 */
export const getUserBookings = (page = 1, perPage = 3) => {
  return baseFetch(`/api/my-bookings?page=${page}&per_page=${perPage}`);
};

/**
 * Obtiene todas las reservas (para administradores)
 * @param {number} page - Página actual
 * @param {number} perPage - Elementos por página
 * @returns {Promise} Lista de reservas paginada
 */
export const getBookings = (page = 1, perPage = 3) => {
  return baseFetch(`/api/bookings?page=${page}&per_page=${perPage}`);
};

// ==================== Pagos ====================

/**
 * Guarda o actualiza un pago
 * @param {Object} paymentData - Datos del pago
 * @param {Number|null} paymentId - ID del pago (null para crear nuevo)
 * @returns {Promise} Respuesta del servidor
 */
export const savePayment = async (paymentData, paymentId = null) => {
  const url = paymentId ? `/api/admin/payments/${paymentId}` : `/api/admin/payments`;
  const method = paymentId ? 'PUT' : 'POST';
  
  return baseFetch(url, method, paymentData);
};

/**
 * Obtiene la lista de pagos pendientes con paginación
 * @param {number} page - Número de página actual
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Lista de pagos pendientes paginada
 */
export const getPendingPayments = async (page = 1, perPage = 3) => {
  try {
    const response = await baseFetch(`/api/admin/payments/pending?page=${page}&per_page=${perPage}`, 'GET');
    // Handle the nested pagination structure
    if (response && typeof response === 'object') {
      if (response.success && response.data && response.data.data) {
        // This is the paginated response structure
        return response;
      } else if (Array.isArray(response)) {
        return { success: true, data: { data: response, last_page: 1, current_page: 1 } };
      } else if (Array.isArray(response.data)) {
        return { success: true, data: { data: response.data, last_page: 1, current_page: 1 } };
      }
    }
    return { success: true, data: { data: [], last_page: 1, current_page: 1 } };
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return { success: false, data: { data: [], last_page: 1, current_page: 1 } };
  }
};

/**
 * Obtiene la lista de pagos completados con paginación
 * @param {number} page - Número de página actual
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Lista de pagos completados paginada
 */
export const getCompletedPayments = async (page = 1, perPage = 3) => {
  try {
    const response = await baseFetch(`/api/admin/payments/completed?page=${page}&per_page=${perPage}`, 'GET');
    // Handle the nested pagination structure
    if (response && typeof response === 'object') {
      if (response.success && response.data && response.data.data) {
        // This is the paginated response structure
        return response;
      } else if (Array.isArray(response)) {
        return { success: true, data: { data: response, last_page: 1, current_page: 1 } };
      } else if (Array.isArray(response.data)) {
        return { success: true, data: { data: response.data, last_page: 1, current_page: 1 } };
      }
    }
    return { success: true, data: { data: [], last_page: 1, current_page: 1 } };
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    return { success: false, data: { data: [], last_page: 1, current_page: 1 } };
  }
};

/**
 * Actualiza el estado de un pago
 * @param {Number} paymentId - ID del pago a actualizar
 * @param {Object} paymentData - Datos del pago a actualizar
 * @returns {Promise} Respuesta del servidor
 */
export const updatePayment = async (paymentId, paymentData) => {
  return baseFetch(`/api/admin/payments/${paymentId}`, 'PUT', paymentData);
};

// ==================== Auditorías ====================

/**
 * Obtiene la lista de auditorías con paginación
 * @param {number} page - Número de página actual
 * @param {number} perPage - Cantidad de registros por página
 * @returns {Promise} Lista de auditorías paginada
 */
export const getAudits = async (page = 1, perPage = 3) => {
  return baseFetch(`/api/admin/audits?page=${page}&per_page=${perPage}`, 'GET');
};

// ==================== Contacts ====================

/**
 * Create a new contact (public endpoint - no auth required)
 * @param {object} contactData - Contact information (name, email, termsAndConditions)
 * @returns {Promise} The API response
 */
export const createContact = async (contactData) => {
  return baseFetch('/api/contacts', 'POST', contactData, {}, false);
};

// ==================== Backups ====================

/**
 * Create a manual database backup
 * @returns {Promise} The API response
 */
export const createBackup = async () => {
  return baseFetch('/api/admin/backup', 'POST');
};

// ==================== Services ====================

/**
 * Obtiene la lista de servicios disponibles
 * @returns {Promise} Lista de servicios
 */
export const getServices = async (page = 1, perPage = 3) => {
  try {
    const response = await baseFetch(`/api/services?page=${page}&per_page=${perPage}`, 'GET');
    if (!response) {
      throw new Error('No se recibió respuesta del servidor');
    }
    return response;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Crea un nuevo servicio
 * @param {FormData} serviceData - Datos del servicio (incluido el archivo de imagen)
 * @param {Boolean} isFormData - Indica si los datos son FormData (para subir archivos)
 * @returns {Promise} Respuesta del servidor
 */
export const createService = async (serviceData, isFormData = false) => {
  return baseFetch('/api/admin/services', 'POST', serviceData, {}, true, isFormData);
};

/**
 * Actualiza un servicio existente
 * @param {Number} serviceId - ID del servicio a actualizar
 * @param {FormData|Object} serviceData - Datos del servicio (incluido el archivo de imagen)
 * @param {Boolean} isFormData - Indica si los datos son FormData (para subir archivos)
 * @returns {Promise} Respuesta del servidor
 */
export const updateService = async (serviceId, serviceData, isFormData = false) => {
  // Si es FormData, necesitamos agregar el método _method para simular PUT
  if (isFormData) {
    serviceData.append('_method', 'PUT');
    return baseFetch(`/api/admin/services/${serviceId}`, 'POST', serviceData, {}, true, true);
  }
  return baseFetch(`/api/admin/services/${serviceId}`, 'PUT', serviceData, {}, true, isFormData);
};

/**
 * Elimina un servicio
 * @param {Number} serviceId - ID del servicio a eliminar
 * @returns {Promise} Respuesta del servidor
 */
export const deleteService = async (serviceId) => {
  return baseFetch(`/api/admin/services/${serviceId}`, 'DELETE');
};

/**
 * Guardar o actualizar un servicio
 * @param {Object} serviceData - Datos del servicio
 * @param {number|null} id - ID del servicio a editar (null si es nuevo)
 * @returns {Promise} Resultado de la operación
 */
export const saveService = async (serviceData, id = null) => {
  try {
    const url = id 
      ? `/api/services/${id}` 
      : '/api/services';
    
    const method = id ? 'PUT' : 'POST';
    
    const response = await baseFetch(
      url,
      method,
      serviceData,
      {},
      true,
      false
    );
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error saving service:', error);
    return {
      success: false,
      errors: error.errors || { general: 'Error al guardar el servicio' }
    };
  }
};
