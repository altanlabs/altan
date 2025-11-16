import { refreshToken, setSession, requestRefreshFromParent, iframeState } from '../../utils/auth';
import { setupAxiosErrorTracking } from '../../utils/errorTracking';

/**
 * Setup authentication refresh interceptor for an axios instance
 * Handles 401 errors by refreshing the token and retrying the request
 * @param {AxiosInstance} axiosInstance - The axios instance to add interceptors to
 * @param {string} serviceName - Name of the service (for error tracking)
 */
export const setupAuthInterceptor = (axiosInstance, serviceName) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if error is 401 and we haven't already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          let accessToken;

          // Check if we're in an iframe and need to request token from parent
          if (iframeState.activated) {
            const result = await requestRefreshFromParent(serviceName);
            accessToken = result.accessToken;
          } else {
            // Standard token refresh
            const result = await refreshToken(axiosInstance);
            accessToken = result.accessToken;
          }

          // Update session with new token
          setSession(accessToken, axiosInstance, originalRequest);

          // Retry the original request with new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Token refresh failed, redirect to login or handle appropriately
          console.error('Token refresh failed:', refreshError);
          
          // Clear invalid session
          setSession(null, axiosInstance);
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

/**
 * Setup all interceptors for an axios instance
 * @param {AxiosInstance} axiosInstance - The axios instance
 * @param {string} serviceName - Name of the service
 */
export const setupInterceptors = (axiosInstance, serviceName) => {
  // Setup error tracking
  setupAxiosErrorTracking(axiosInstance, serviceName);
  
  // Setup auth refresh interceptor
  setupAuthInterceptor(axiosInstance, serviceName);
};

