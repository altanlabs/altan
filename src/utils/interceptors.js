import { refreshToken, setSession } from './auth';

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

const onRequestFailure = async (error, axiosInstance) => {
  const originalRequest = error.config;

  if (!originalRequest._retryCount) {
    originalRequest._retryCount = 0;
  }

  if (error.response && error.response.status === HTTP_STATUS_UNAUTHORIZED) {
    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      return Promise.reject(error);
    }

    originalRequest._retryCount++;

    if (isRefreshing) {
      return addRequestToQueue(originalRequest);
    }

    isRefreshing = true;

    try {
      const { accessToken } = await refreshToken(axiosInstance);
      setSession(accessToken, axiosInstance, originalRequest);
      processQueue(null, accessToken);
      return axiosInstance(originalRequest);
    } catch (err) {
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
