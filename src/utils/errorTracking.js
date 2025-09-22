import { analytics } from '../lib/analytics';

/**
 * Global error handler setup for comprehensive error tracking
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error || new Error(event.message), {
      source: 'global_error_handler',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      event_type: 'javascript_error',
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    analytics.trackError(error, {
      source: 'unhandled_promise_rejection',
      event_type: 'promise_rejection',
      promise_rejection_reason: event.reason,
    });
  });

  // Note: Console error interception removed to prevent feedback loops
  // If you need to track console errors, implement it carefully to avoid
  // tracking your own analytics logging
};

// React Error Boundary is exported from a separate file to avoid JSX in .js files
// Import it from: import { ErrorBoundary } from '../components/ErrorBoundary.jsx';

/**
 * Higher-order function to wrap async functions with error tracking
 */
export const withErrorTracking = (asyncFunction, context = {}) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      analytics.trackError(error, {
        source: 'wrapped_async_function',
        function_name: asyncFunction.name || 'anonymous',
        ...context,
      });
      throw error; // Re-throw to maintain normal error flow
    }
  };
};

/**
 * Axios interceptor for API error tracking
 */
export const setupAxiosErrorTracking = (axiosInstance, instanceName = 'default') => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const endpoint = error.config?.url || 'unknown';
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      
      analytics.trackAPIError(error, endpoint, method, {
        axios_instance: instanceName,
        request_data: error.config?.data,
        request_params: error.config?.params,
      });

      return Promise.reject(error);
    }
  );
};
