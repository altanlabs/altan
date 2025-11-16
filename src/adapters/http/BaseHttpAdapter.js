import axios from 'axios';
import { setupInterceptors } from './interceptors';

/**
 * Base HTTP Adapter
 * Provides common HTTP functionality for all service adapters
 */
export class BaseHttpAdapter {
  /**
   * @param {Object} config - Adapter configuration
   * @param {string} config.baseURL - Base URL for the service
   * @param {string} config.version - API version (optional, can be empty)
   * @param {boolean} config.withCredentials - Whether to send cookies
   * @param {string} config.serviceName - Name of the service (for logging/tracking)
   */
  constructor(config) {
    this.baseURL = config.baseURL;
    this.version = config.version || '';
    this.withCredentials = config.withCredentials !== undefined ? config.withCredentials : false;
    this.serviceName = config.serviceName || 'unknown';
    this.axios = this.createAxiosInstance();
  }

  /**
   * Create and configure axios instance
   * @returns {AxiosInstance}
   */
  createAxiosInstance() {
    const instance = axios.create({
      baseURL: this.baseURL,
      withCredentials: this.withCredentials,
      name: this.serviceName,
    });

    // Setup interceptors for auth and error tracking
    setupInterceptors(instance, this.serviceName);

    return instance;
  }

  /**
   * Build full URL path with version prefix if applicable
   * @param {string} path - Endpoint path
   * @param {boolean} skipVersion - Skip version prefix for this path
   * @returns {string} Full path
   */
  buildPath(path, skipVersion = false) {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If skipVersion is true or version is empty, return path as-is
    if (skipVersion || !this.version) {
      return cleanPath;
    }
    
    // If path already includes version, return as-is
    const pathWithoutSlash = cleanPath.substring(1);
    if (pathWithoutSlash.startsWith(this.version)) {
      return cleanPath;
    }
    
    // Combine version and path
    return `/${this.version}${cleanPath}`;
  }

  /**
   * Build path without version prefix
   * @param {string} path - Endpoint path
   * @returns {string} Full path
   */
  buildRawPath(path) {
    return this.buildPath(path, true);
  }

  /**
   * Perform HTTP GET request
   * @param {string} path - Endpoint path
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async get(path, config = {}) {
    const response = await this.axios.get(this.buildPath(path), config);
    return response.data;
  }

  /**
   * Perform HTTP POST request
   * @param {string} path - Endpoint path
   * @param {any} data - Request body
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async post(path, data, config = {}) {
    const response = await this.axios.post(this.buildPath(path), data, config);
    return response.data;
  }

  /**
   * Perform HTTP PUT request
   * @param {string} path - Endpoint path
   * @param {any} data - Request body
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async put(path, data, config = {}) {
    const response = await this.axios.put(this.buildPath(path), data, config);
    return response.data;
  }

  /**
   * Perform HTTP PATCH request
   * @param {string} path - Endpoint path
   * @param {any} data - Request body
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async patch(path, data, config = {}) {
    const response = await this.axios.patch(this.buildPath(path), data, config);
    return response.data;
  }

  /**
   * Perform HTTP DELETE request
   * @param {string} path - Endpoint path
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async delete(path, config = {}) {
    const response = await this.axios.delete(this.buildPath(path), config);
    return response.data;
  }

  // ==================== Raw (Non-versioned) HTTP Methods ====================
  // For endpoints that don't use the API version prefix

  /**
   * Perform HTTP GET request without version prefix
   * @param {string} path - Endpoint path
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async getRaw(path, config = {}) {
    const response = await this.axios.get(this.buildRawPath(path), config);
    return response.data;
  }

  /**
   * Perform HTTP POST request without version prefix
   * @param {string} path - Endpoint path
   * @param {any} data - Request body
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async postRaw(path, data, config = {}) {
    const response = await this.axios.post(this.buildRawPath(path), data, config);
    return response.data;
  }

  /**
   * Perform HTTP PATCH request without version prefix
   * @param {string} path - Endpoint path
   * @param {any} data - Request body
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async patchRaw(path, data, config = {}) {
    const response = await this.axios.patch(this.buildRawPath(path), data, config);
    return response.data;
  }

  /**
   * Perform HTTP DELETE request without version prefix
   * @param {string} path - Endpoint path
   * @param {Object} config - Axios request config
   * @returns {Promise<any>} Response data
   */
  async deleteRaw(path, config = {}) {
    const response = await this.axios.delete(this.buildRawPath(path), config);
    return response.data;
  }

  // ==================== Utility Methods ====================

  /**
   * Get the underlying axios instance
   * Useful for advanced use cases or backward compatibility
   * @returns {AxiosInstance}
   */
  getAxiosInstance() {
    return this.axios;
  }

  /**
   * Update authorization header
   * @param {string} token - Access token
   */
  setAuthToken(token) {
    if (token) {
      this.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.axios.defaults.headers.common.Authorization;
    }
  }
}

