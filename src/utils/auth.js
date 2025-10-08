import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import axios from 'axios';

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
export const AUTH_API = 'https://auth.altan.ai';

const AUTH_API_ENDPOINTS = {
  optimai: `${AUTH_API}/token/platform`,
  optimai_shop: `${AUTH_API}/token/platform`,
  optimai_integration: `${AUTH_API}/token/platform`,
  optimai_galaxia: `${AUTH_API}/token/platform`,
  optimai_root: `${AUTH_API}/token/platform`,
  optimai_room: `${AUTH_API}/token/platform`,
  optimai_tables: `${AUTH_API}/token/platform`,
  optimai_tables_legacy: `${AUTH_API}/token/platform`,
  optimai_agent: `${AUTH_API}/token/platform`,
  optimai_database: `${AUTH_API}/token/platform`,
  optimai_auth: `${AUTH_API}/token/platform`,
};

const MOBILE_AUTH_API_ENDPOINTS = {
  optimai: `${AUTH_API}/token/mobile`,
  optimai_shop: `${AUTH_API}/token/mobile`,
  optimai_integration: `${AUTH_API}/token/mobile`,
  optimai_galaxia: `${AUTH_API}/token/mobile`,
  optimai_root: `${AUTH_API}/token/mobile`,
  optimai_room: `${AUTH_API}/token/mobile`,
  optimai_tables: `${AUTH_API}/token/mobile`,
  optimai_tables_legacy: `${AUTH_API}/token/mobile`,
  optimai_agent: `${AUTH_API}/token/mobile`,
  optimai_database: `${AUTH_API}/token/mobile`,
  optimai_auth: `${AUTH_API}/token/mobile`,
};

// Mobile refresh token storage
const REFRESH_TOKEN_KEY = 'altan_refresh_token';

export const iframeState = {
  activated: false,
};

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
      const res = await axios.get(refreshEndpoint, { withCredentials: true });
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

export const requestRefreshFromParent = (group) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleParentMessage);
      reject(new Error('Token refresh request timeout'));
    }, 10000); // 10 second timeout

    // Listen for the parent's response
    function handleParentMessage(event) {
      const { data } = event;
      // Validate the event origin if necessary
      // if (event.origin !== window.location.origin) return;

      if (data.type === 'new_access_token') {
        clearTimeout(timeout);
        window.removeEventListener('message', handleParentMessage);

        if (data.success && data.token) {
          // The parent might send back user, token, guest, etc. Adjust as needed
          resolve({
            user: data.user,
            guest: data.guest,
            accessToken: data.token,
          });
        } else {
          reject(new Error(data.error || 'No token in parent response'));
        }
      }
    }

    window.addEventListener('message', handleParentMessage);

    // Send the refresh request to the parent
    window.parent.postMessage(
      { type: 'refresh_token', group },
      '*', // or use a specific targetOrigin if you know the parent's origin
    );
  });
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
