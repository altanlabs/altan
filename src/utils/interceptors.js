import { refreshToken } from './auth';
import { setSessionForAllInstances } from './axios';

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const MAX_RETRY_COUNT = 1;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
};

const addRequestToQueue = (originalRequest, axiosInstance) => {
  return new Promise((resolve, reject) => {
    failedQueue.push({
      resolve: () => resolve(axiosInstance(originalRequest)),
      reject,
      originalRequest,
    });
  });
};

const onRequestFailure = async (error, axiosInstance) => {
  const originalRequest = error.config;

  if (!originalRequest._retryCount) {
    originalRequest._retryCount = 0;
  }

  // Handle 401 errors OR network errors that might be 401s (CORS issues)
  // Only treat network errors as potential 401s if we have an Authorization header
  // (meaning we're authenticated and the token might have expired)
  const is401Error = error.response?.status === HTTP_STATUS_UNAUTHORIZED;
  const hasAuthToken = axiosInstance.defaults.headers.common.Authorization;
  const isNetworkErrorPossibly401 = !error.response && error.code === 'ERR_NETWORK' && hasAuthToken;

  if (is401Error || isNetworkErrorPossibly401) {
    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      return Promise.reject(error);
    }

    originalRequest._retryCount++;

    if (isRefreshing) {
      return addRequestToQueue(originalRequest, axiosInstance);
    }

    isRefreshing = true;

    try {
      // Use user token refresh logic (works for both user and guest sessions)
      const { accessToken } = await refreshToken(axiosInstance);
      // Set session for all axios instances, not just the failing one
      setSessionForAllInstances(accessToken, originalRequest);
      processQueue(null);
      return axiosInstance(originalRequest);
    } catch (err) {
      if (err.response && err.response.status === HTTP_STATUS_UNAUTHORIZED) {
        setSessionForAllInstances(null);
      }
      processQueue(err);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }

  if (error.response && error.response.status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    return Promise.reject('Server error');
  }

  return Promise.reject(error);
};

// Handle response failures for each axios instance
export const addResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => onRequestFailure(error, axiosInstance),
  );
};

// TODO: maybe check for token expiration before. compare times
// export const addRequestInterceptor = (axiosInstance) => {
//   axiosInstance.interceptors.response.use(
//     response => response,
//     error => onRequestFailure(error, axiosInstance)
//   );
// };
