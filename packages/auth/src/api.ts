import axios, { AxiosInstance } from 'axios';
import { AUTH_BASE_URL } from './constants';
import { RequestCancellationManager } from './cancellationManager';

// HTTP status codes and maximum retry count.
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const MAX_RETRY_COUNT = 1;


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
export const authAxios = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

let requestController: AbortController | null = null;
const cancellationManager = new RequestCancellationManager();

const createAuthenticatedApi = (tableId: string): AxiosInstance => {
  // Create the main instance for API calls.
  const apiAxios = axios.create({
    baseURL: AUTH_BASE_URL,
  });

  // Request interceptor for apiAxios.
  apiAxios.interceptors.request.use(
    async (config) => {
      cancellationManager.add(config);
      // Attach an AbortController for cancellation if one isn't provided.
      if (!config.signal && typeof AbortController !== 'undefined') {
        requestController = new AbortController();
        config.signal = requestController.signal;
      }

      // If there's an Authorization header, check if the token is valid.
      const authHeader = apiAxios.defaults.headers.common.Authorization;
      if (authHeader && typeof authHeader === "string" && authHeader.startsWith('Bearer ')) {
        let token = authHeader.substring(7);
        if (!isValidToken(token)) {
          // Refresh the token using authAxios.
          const { data } = await authAxios.post(`/auth/refresh?table_id=${tableId}`);
          token = data.access_token;
          setSession(apiAxios, token);
        }
        // Ensure the outgoing request has the valid token.
        config.headers.Authorization = `Bearer ${token}`;
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

      // Set or increment the retry counter.
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (
        error.response?.status === HTTP_STATUS_UNAUTHORIZED &&
        originalRequest._retryCount < MAX_RETRY_COUNT
      ) {
        originalRequest._retryCount++;

        // Refresh the token using authAxios.
        const { data } = await authAxios.post(`/auth/refresh`);
        const newToken = data.access_token;
        setSession(apiAxios, newToken);

        // Update the Authorization header and retry the request.
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiAxios(originalRequest);
      }

      // Handle server errors.
      if (error.response?.status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
        return Promise.reject(
          new Error('A server error occurred. Please try again later.'),
        );
      }
      return Promise.reject(error);
    },
  );
  return apiAxios;
}

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