import { refreshToken, requestRefreshFromParent } from './auth';
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

// Check if this is a guest session (iframe context)
const isGuestSession = () => {
  const isInIframe = window !== window.parent;
  const hasGuestInContext = window.authContext?.authenticated?.guest === true;
  return isInIframe || hasGuestInContext;
};

const onRequestFailure = async (error, axiosInstance) => {
  const originalRequest = error.config;

  console.log('🔍 Interceptor triggered for:', {
    instanceName: axiosInstance?.defaults?.name,
    url: originalRequest?.url,
    status: error.response?.status,
    hasResponse: !!error.response,
    errorMessage: error.message,
    errorCode: error.code,
    responseData: error.response?.data,
  });

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
    console.log('🔴 401 DETECTED! Starting refresh flow...', {
      is401Error,
      isNetworkErrorPossibly401,
      hasAuthToken,
      retryCount: originalRequest._retryCount,
      maxRetries: MAX_RETRY_COUNT,
      isRefreshing,
      instanceName: axiosInstance?.defaults?.name,
    });

    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      console.error('❌ Max retry count reached for request:', originalRequest.url);
      return Promise.reject(error);
    }

    originalRequest._retryCount++;

    if (isRefreshing) {
      console.log('⏳ Already refreshing, adding to queue');
      return addRequestToQueue(originalRequest, axiosInstance);
    }

    console.log('🚀 Starting token refresh...');
    isRefreshing = true;

    try {
      // Check if this is a guest session
      if (isGuestSession()) {
        console.log('🔄 Guest session detected, requesting auth refresh from parent');

        try {
          // For guest sessions, request new auth from parent widget
          const { accessToken } = await requestRefreshFromParent('guest');

          if (accessToken) {
            console.log('✅ Received new guest token from parent');
            // Set session for all axios instances, not just the failing one
            setSessionForAllInstances(accessToken, originalRequest);
            processQueue(null);
            return axiosInstance(originalRequest);
          } else {
            console.warn('⚠️ No access token received from parent');
            throw new Error('No guest token received from parent');
          }
        } catch (guestAuthError) {
          console.error('❌ Guest auth refresh failed:', guestAuthError);
          // For guest auth failures, don't redirect to login - let the component handle it
          processQueue(guestAuthError);
          return Promise.reject(guestAuthError);
        }
      } else {
        // Regular user session - use existing user token refresh logic
        console.log('🔄 User session detected, refreshing user token');
        const { accessToken } = await refreshToken(axiosInstance);
        console.log('✅ Token refreshed successfully, setting sessions and retrying request');
        // Set session for all axios instances, not just the failing one
        setSessionForAllInstances(accessToken, originalRequest);
        processQueue(null);
        console.log('🔄 Retrying original request:', originalRequest.url);
        return axiosInstance(originalRequest);
      }
    } catch (err) {
      console.error('❌ Token refresh failed:', err);

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
