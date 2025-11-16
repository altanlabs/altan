/**
 * Cloud Reducer
 * Combines all domain slices into a FLAT structure
 * 
 * This maintains the exact state shape that existing code expects:
 * state.cloud = {
 *   isLoading, error, clouds: {},
 *   tables: {}, ...
 * }
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import cloudsReducer from './slices/clouds.slice';
import tablesReducer from './slices/tables.slice';
import usersReducer from './slices/users.slice';
import bucketsReducer from './slices/buckets.slice';
import navigationReducer from './slices/navigation.slice';

export interface CloudState {
  // From clouds slice
  isLoading: boolean;
  error: string | null;
  clouds: Record<string, any>;
  // From tables slice
  tables: Record<string, any>;
  // From users slice
  userCache: Record<string, Record<string, any>>;
  cacheState: { loading: boolean; lastFetched: number | null; error: string | null };
  // From buckets slice
  bucketCache: Record<string, Record<string, any>>;
  bucketCacheState: { loading: boolean; lastFetched: number | null; error: string | null };
  // From navigation slice
  quickFilter: string;
  isSearching: boolean;
  searchResults: Record<string, any>;
}

/**
 * Custom combined reducer that maintains flat structure
 */
const cloudReducer = (state: CloudState | undefined, action: PayloadAction<any>): CloudState => {
  // Let each reducer handle its slice
  const cloudsState = cloudsReducer(
    state
      ? {
          isLoading: state.isLoading,
          error: state.error,
          clouds: state.clouds,
        }
      : undefined,
    action,
  );

  const tablesState = tablesReducer(
    state
      ? {
          tables: state.tables,
          isLoading: false,
          error: null,
        }
      : undefined,
    action,
  );

  const usersState = usersReducer(
    state
      ? {
          userCache: state.userCache,
          cacheState: state.cacheState,
        }
      : undefined,
    action,
  );

  const bucketsState = bucketsReducer(
    state
      ? {
          bucketCache: state.bucketCache,
          cacheState: state.bucketCacheState,
        }
      : undefined,
    action,
  );

  const navigationState = navigationReducer(
    state
      ? {
          quickFilter: state.quickFilter,
          isSearching: state.isSearching,
          searchResults: state.searchResults,
        }
      : undefined,
    action,
  );

  // Return flat combined state
  return {
    // Clouds slice state
    isLoading: cloudsState.isLoading,
    error: cloudsState.error,
    clouds: cloudsState.clouds,
    // Tables slice state
    tables: tablesState.tables,
    // Users slice state
    userCache: usersState.userCache,
    cacheState: usersState.cacheState,
    // Buckets slice state
    bucketCache: bucketsState.bucketCache,
    bucketCacheState: bucketsState.cacheState,
    // Navigation slice state
    quickFilter: navigationState.quickFilter,
    isSearching: navigationState.isSearching,
    searchResults: navigationState.searchResults,
  };
};

export default cloudReducer;
