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

  // Handle console errors (optional - can be noisy)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call original console.error first
    originalConsoleError.apply(console, args);

    // Track if it looks like an actual error
    const firstArg = args[0];
    if (firstArg instanceof Error) {
      analytics.trackError(firstArg, {
        source: 'console_error',
        event_type: 'console_error',
        console_args: args.slice(1),
      });
    } else if (typeof firstArg === 'string' && firstArg.toLowerCase().includes('error')) {
      analytics.trackError(new Error(firstArg), {
        source: 'console_error',
        event_type: 'console_error_string',
        console_args: args.slice(1),
      });
    }
  };
};

/**
 * React Error Boundary component for catching React errors
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Track the error with React-specific context
    analytics.trackError(error, {
      source: 'react_error_boundary',
      event_type: 'react_error',
      component_stack: errorInfo.componentStack,
      error_boundary_name: this.props.name || 'Unknown',
      props: this.props.trackProps ? JSON.stringify(this.props) : undefined,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>We've been notified about this error and will fix it soon.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '20px' }}>
              <summary>Error Details (Development Only)</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

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
