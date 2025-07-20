import axios from 'axios';
import { Capacitor } from '@capacitor/core';

import { optimai_root } from './axios';

/**
 * Platform detection for Capacitor
 * Returns true if running on iOS or Android via Capacitor
 */
const isCapacitorPlatform = () => {
  try {
    // Check if we're running in Capacitor
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Opens a URL using the appropriate method based on platform
 * @param {string} url - The URL to open
 * @param {Object} options - Additional options for browser opening
 * @returns {Promise<void>}
 */
export const openUrl = async (url, options = {}) => {
  try {
    if (isCapacitorPlatform()) {
      // Use Browser plugin for mobile platforms
      await Browser.open({ url, ...options });
    } else {
      // Use window.location.href for web platforms
      window.location.href = url;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    // Fallback to window.open if Browser.open fails
    window.open(url, '_blank');
  }
};

export const API_BASE = 'api.altan.ai';
export const API_BASE_URL = `https://${API_BASE}`;

const AUTH_API_ENDPOINTS = {
  optimai: `${API_BASE_URL}/auth/token/platform`,
  optimai_shop: `${API_BASE_URL}/auth/token/platform`,
  optimai_integration: `${API_BASE_URL}/auth/token/platform`,
  optimai_galaxia: `${API_BASE_URL}/auth/token/platform`,
  optimai_root: `${API_BASE_URL}/auth/token/platform`,
  optimai_room: `${API_BASE_URL}/auth/token/platform`,
  optimai_tables: `${API_BASE_URL}/auth/token/platform`,
  optimai_tables_legacy: `${API_BASE_URL}/auth/token/platform`,
};

const MOBILE_AUTH_API_ENDPOINTS = {
  optimai: `${API_BASE_URL}/auth/token/mobile`,
  optimai_shop: `${API_BASE_URL}/auth/token/mobile`,
  optimai_integration: `${API_BASE_URL}/auth/token/mobile`,
  optimai_galaxia: `${API_BASE_URL}/auth/token/mobile`,
  optimai_root: `${API_BASE_URL}/auth/token/mobile`,
  optimai_room: `${API_BASE_URL}/auth/token/mobile`,
  optimai_tables: `${API_BASE_URL}/auth/token/mobile`,
  optimai_tables_legacy: `${API_BASE_URL}/auth/token/mobile`,
};

// Mobile refresh token storage
const REFRESH_TOKEN_KEY = 'altan_refresh_token';

export const storeRefreshToken = (refreshToken) => {
  if (isCapacitorPlatform()) {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }
};

export const getStoredRefreshToken = () => {
  if (isCapacitorPlatform()) {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get stored refresh token:', error);
      return null;
    }
  }
  return null;
};

export const clearStoredRefreshToken = () => {
  if (isCapacitorPlatform()) {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear stored refresh token:', error);
    }
  }
};

/**
 * Refresh authentication token
 * Uses mobile endpoint with stored refresh token on Capacitor platforms,
 * otherwise uses web platform endpoint with cookies
 */
export const refreshToken = async (axiosInstance) => {
  try {
    const instanceName = axiosInstance.defaults.name;
    const isMobile = isCapacitorPlatform();

    if (isMobile) {
      // Mobile refresh logic
      const mobileEndpoint = MOBILE_AUTH_API_ENDPOINTS[instanceName];
      const storedRefreshToken = getStoredRefreshToken();

      if (!mobileEndpoint) {
        throw new Error('Invalid Axios instance for mobile');
      }

      if (!storedRefreshToken) {
        throw new Error('No refresh token available for mobile');
      }

      console.debug('Using mobile token refresh endpoint:', mobileEndpoint);
      const res = await axios.post(mobileEndpoint, {
        refresh_token: storedRefreshToken,
        jid: false,
      });

      const { user, token, refresh_token } = res.data;

      // Store the new refresh token if provided
      if (refresh_token) {
        storeRefreshToken(refresh_token);
      }

      return Promise.resolve({ user, accessToken: token.access_token });
    } else {
      // Web/platform refresh logic (existing)
      const refreshEndpoint = AUTH_API_ENDPOINTS[instanceName];
      if (!refreshEndpoint) {
        throw new Error('Invalid Axios instance');
      }
      console.debug('Using web token refresh endpoint:', refreshEndpoint);
      
      // Extract path from full URL to work with optimai_root baseURL
      const refreshPath = refreshEndpoint.replace(API_BASE_URL, '');
      const res = await optimai_root.get(refreshPath);
      const { user, token } = res.data;

      return Promise.resolve({ user, accessToken: token.access_token });
    }
  } catch (e) {
    // Clear stored refresh token on mobile if refresh fails with auth error
    if (isCapacitorPlatform() && e.response?.status === 401) {
      console.warn('Mobile refresh token expired, clearing stored token');
      clearStoredRefreshToken();
    }
    return Promise.reject(e);
  }
};

export const setSession = (accessToken, axiosInstance, request = null) => {
  if (accessToken) {
    if (request) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('oaiauth');
    // Clear mobile refresh token when session is cleared
    if (isCapacitorPlatform()) {
      clearStoredRefreshToken();
    }
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

/**
 * Utility function to get current authentication platform and status
 * Useful for debugging mobile authentication issues
 */
export const getAuthStatus = () => {
  const isMobile = isCapacitorPlatform();
  const hasStoredRefreshToken = !!getStoredRefreshToken();

  return {
    platform: isMobile ? 'mobile' : 'web',
    isMobile,
    hasStoredRefreshToken,
    refreshTokenKey: REFRESH_TOKEN_KEY,
  };
};

/**
 * Debug function to log comprehensive authentication status
 * Call this in the browser console to troubleshoot auth issues
 */
export const debugAuthStatus = () => {
  const status = getAuthStatus();
  const storedRefreshToken = getStoredRefreshToken();

  console.group('🔍 Authentication Debug Status');
  console.log('Platform:', status.platform);
  console.log('Is Mobile:', status.isMobile);
  console.log('Has Stored Refresh Token:', status.hasStoredRefreshToken);
  console.log('Refresh Token Key:', status.refreshTokenKey);

  if (status.isMobile) {
    console.log('Stored Refresh Token:', storedRefreshToken ? '***[PRESENT]***' : 'NOT FOUND');
    console.log('Mobile Endpoints:', MOBILE_AUTH_API_ENDPOINTS);
  } else {
    console.log('Web Endpoints:', AUTH_API_ENDPOINTS);
  }

  // Check localStorage
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('All auth-related localStorage:',
    Object.keys(localStorage)
      .filter(key => key.includes('auth') || key.includes('token') || key.includes('altan'))
      .reduce((authObj, key) => {
        return { ...authObj, [key]: localStorage.getItem(key) };
      }, {}),
  );

  console.groupEnd();

  return status;
};
