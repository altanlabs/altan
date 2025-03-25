import axios, { AxiosInstance } from 'axios';
import { AUTH_BASE_URL } from './constants';
import { RequestCancellationManager } from './cancellationManager';

// HTTP status codes and maximum retry count.
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const MAX_RETRY_COUNT = 1;


function getSubdomain(hostname: string) {
  const parts = hostname.split('.');

  // Remove www if it's the first part
  if (parts[0] === 'www') {
    parts.shift();
  }

  // Example: sub.example.com → ['sub', 'example', 'com']
  // Only return subdomain if there are at least 3 parts (sub + domain + TLD)
  if (parts.length > 2) {
    return parts.slice(0, parts.length - 2).join('.');
  }

  return null; // No subdomain
}


function getBaseUrl() {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.preview.altan.ai')) {
    return AUTH_BASE_URL;
  }
  if (hostname.endsWith('.altanlabs.com')) {
    const subdomain = getSubdomain(hostname);
    return `https://${subdomain ? `${subdomain}.` : ''}auth.altanlabs.com`;
  }
  return `auth.${hostname}`;
}


const jwtDecode = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }
  try {
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now();
    return decoded.exp * 1000 > currentTime + 1;
  } catch {
    return false;
  }
};

export const setSession = (axiosInstance: AxiosInstance, accessToken: string | null) => {
  if (accessToken) {
    // Update axios defaults.
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
    cancelAllRequests("logged out");
  }
}

// Create a dedicated instance for refresh calls with credentials.
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const authAxios = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

const cancellationManager = new RequestCancellationManager();

const refreshToken = async (): Promise<string> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = authAxios.post(`/refresh`)
      .then((response) => {
        const token = response.data.access_token;
        isRefreshing = false;
        refreshPromise = null;
        return token;
      })
      .catch((error) => {
        isRefreshing = false;
        refreshPromise = null;
        return Promise.reject(error);
      });
  }
  return refreshPromise!;
};

const createAuthenticatedApi = (baseURL: string = getBaseUrl()): AxiosInstance => {
  // Create the main instance for API calls.
  const apiAxios = axios.create({ baseURL });
  console.debug("[@altanlabs/auth] created new API with base url", apiAxios.defaults.baseURL);

  // Request interceptor for apiAxios.
  apiAxios.interceptors.request.use(
    async (config) => {
      cancellationManager.add(config);

      // Get token from the api instance default headers or a central storage.
      const authHeader = apiAxios.defaults.headers.common.Authorization;
      const token = authHeader && typeof authHeader === "string" && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (token && isValidToken(token)) {
        console.debug(`[@altanlabs/auth] [axios api ${baseURL}] request interceptor. valid token`);
      } else {
        // Wait for a refresh if already in progress, otherwise start one.
        const newToken = await refreshToken();
        setSession(apiAxios, newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor for apiAxios.
  apiAxios.interceptors.response.use(
    (response) => {
      cancellationManager.remove(response.config);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      cancellationManager.remove(originalRequest);

      // Increment retry counter.
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (
        error.response?.status === HTTP_STATUS_UNAUTHORIZED &&
        originalRequest._retryCount < MAX_RETRY_COUNT
      ) {
        originalRequest._retryCount++;

        // Use our refreshToken function to get a new token.
        const newToken = await refreshToken();
        setSession(apiAxios, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiAxios(originalRequest);
      }

      // Handle server errors.
      if (error.response?.status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
        return Promise.reject(
          new Error('[@altanlabs/auth] A server error occurred. Please try again later.'),
        );
      }
      return Promise.reject(error);
    },
  );
  return apiAxios;
};

// Export a cancelAll method to cancel all active requests if needed.
const cancelAllRequests = (message?: string) => {
  cancellationManager.cancelAll(message);
};

export { createAuthenticatedApi, cancelAllRequests };


// export const createAuthenticatedApi = (tableId: string, storageKey: string = 'auth_user'): AxiosInstance => {
//   const api = axios.create({
//     baseURL: AUTH_BASE_URL,
//     withCredentials: true,
//   });

//   // Add request interceptor to inject the auth token
//   api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//     // Always try localStorage first
//     const token = localStorage.getItem(`${storageKey}_token`);
    
//     if (token) {
//       config.headers.set('Authorization', `Bearer ${token}`);
//     }
    
//     return config;
//   });

//   // Add response interceptor to handle errors
//   api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response?.status === 401) {
//         localStorage.removeItem(storageKey);
//         localStorage.removeItem(`${storageKey}_token`);
//       }
//       return Promise.reject(error);
//     }
//   );

//   return api;
// }; 