/**
 * Utility functions for async operations in Redux bases slice
 */

/**
 * Generic error handler for thunks
 */
export const handleThunkError = (error: unknown): string => {
  const err = error as { message?: string };
  return err.message || 'Unknown error';
};

/**
 * Creates a thunk error payload
 */
export const createErrorPayload = (error: unknown): { message: string } => {
  return {
    message: handleThunkError(error),
  };
};

