import { refreshToken, setSession, requestRefreshFromParent } from './auth';

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const MAX_RETRY_COUNT = 1;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

const addRequestToQueue = (originalRequest) => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject, originalRequest });
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

  if (!originalRequest._retryCount) {
    originalRequest._retryCount = 0;
  }

  if (error.response && error.response.status === HTTP_STATUS_UNAUTHORIZED) {
    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      console.error('❌ Max retry count reached for request:', originalRequest.url);
      return Promise.reject(error);
    }

    originalRequest._retryCount++;

    if (isRefreshing) {
      return addRequestToQueue(originalRequest);
    }

    isRefreshing = true;

    try {
      // Check if this is a guest session
      if (isGuestSession()) {
        console.log('🔄 Guest session detected, requesting auth refresh from parent');
        
        try {
          // For guest sessions, request new auth from parent widget
          const { accessToken, guest } = await requestRefreshFromParent('guest');
          
          if (accessToken) {
            console.log('✅ Received new guest token from parent');
            setSession(accessToken, axiosInstance, originalRequest);
            processQueue(null, accessToken);
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
        setSession(accessToken, axiosInstance, originalRequest);
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      }
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      
      if (err.response && err.response.status === HTTP_STATUS_UNAUTHORIZED) {
        setSession(null, axiosInstance);
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
