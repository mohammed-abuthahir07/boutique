import { API_BASE_URL } from '../config/apiConfig';

/**
 * Centralized API client.
 * Handles baseURL, JWT auth headers (for both Customer and Admin),
 * JSON/FormData request serialization, and consistent error extraction.
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
  }

  getCustomerToken() {
    return localStorage.getItem('customer_token');
  }

  setCustomerToken(token) {
    if (token) {
      localStorage.setItem('customer_token', token);
    } else {
      localStorage.removeItem('customer_token');
    }
  }

  getAdminToken() {
    return localStorage.getItem('admin_token');
  }

  setAdminToken(token) {
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  /**
   * Performs an HTTP request.
   * @param {string} endpoint - Path relative to base URL (e.g. '/api/public/products')
   * @param {object} options - Fetch options { method, body, headers, authType: 'customer' | 'admin' | 'none' }
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      authType = 'none', // 'customer' | 'admin' | 'none'
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const requestHeaders = { ...headers };

    // Inject appropriate JWT Bearer token
    if (authType === 'customer') {
      const token = this.getCustomerToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    } else if (authType === 'admin') {
      const token = this.getAdminToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers: requestHeaders,
    };

    if (body !== null && body !== undefined) {
      if (body instanceof FormData) {
        // Let browser set the multipart Content-Type header with proper boundary
        delete requestHeaders['Content-Type'];
        config.body = body;
      } else {
        requestHeaders['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, config);
      let data = null;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage =
          (data && (data.message || data.error)) ||
          `Request failed with status ${response.status}`;

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw structured error
      if (!err.status) {
        err.message = err.message || 'Network connection failed. Please check your internet or server status.';
      }
      throw err;
    }
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
