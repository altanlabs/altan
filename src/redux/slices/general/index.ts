/**
 * General Slice Barrel Export
 * Re-exports all general-related actions, selectors, thunks, and reducer
 */

// Export the reducer as default
export { default } from './slices/generalSlice';

// Export all types
export * from './types/state';

// Export all selectors
export * from './selectors';

// Export all actions from slice
export * from './slices/generalSlice';

// Export all thunks
export * from './thunks';

