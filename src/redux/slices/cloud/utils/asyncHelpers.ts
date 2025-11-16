/**
 * Utility functions for async operations in Redux
 */

import type { AppDispatch } from '../../../store';

/**
 * Generic error handler for thunks
 */
export const handleThunkError = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

/**
 * Creates a thunk error payload
 */
export const createErrorPayload = (error: unknown): { message: string } => {
  return {
    message: handleThunkError(error),
  };
};

/**
 * Helper to wrap thunk logic with consistent error handling
 */
export const withErrorHandling = async <T>(
  dispatch: AppDispatch,
  setError: (message: string | null) => { type: string; payload: string | null },
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setError(message));
    throw error;
  }
};

