/**
 * Cloud slice - Refactored modular structure
 * 
 * This is the main entry point for the cloud slice, now organized using
 * DRY and SOLID principles:
 * 
 * - Single Responsibility: Each sub-slice handles only one domain
 * - Open/Closed: Easy to extend with new domains without modifying existing code
 * - Dependency Inversion: Depends on abstractions (types) not implementations
 * - DRY: Shared utilities eliminate code duplication
 * 
 * Structure:
 * - /slices     - Individual domain reducers (clouds, tables, users, buckets, navigation)
 * - /thunks     - Async operations organized by domain
 * - /selectors  - Memoized selectors organized by domain
 * - /utils      - Shared utility functions
 * - /types      - TypeScript type definitions
 */

// ============================================================================
// IMPORTS
// ============================================================================

import * as bucketsActions from './slices/buckets.slice';
import * as cloudsActions from './slices/clouds.slice';
import * as navigationActions from './slices/navigation.slice';
import * as tablesActions from './slices/tables.slice';
import * as usersActions from './slices/users.slice';

// ============================================================================
// MAIN REDUCER
// ============================================================================

export { default } from './combineReducers';

// ============================================================================
// ACTIONS - Re-export all actions with namespace prefix
// ============================================================================

// Export individual action creators (backwards compatibility)
// Clouds
export const { setLoading, setError, setCloud, updateCloud, removeCloud } = cloudsActions;

// Tables
export const {
  setTableLoading,
  setTableRecords,
  addRecord,
  updateRecord,
  removeRecord,
} = tablesActions;

// Users
export const { setUsers } = usersActions;
export const setBucketCacheLoading = usersActions.setCacheLoading;
export const setBucketCacheError = usersActions.setCacheError;

// Buckets
export const { setBuckets, addBucket, updateBucket, removeBucket } = bucketsActions;

// Navigation
export const {
  setQuickFilter,
  setSearching,
  setSearchResults,
  clearSearchResults,
} = navigationActions;

// Also export namespaced action groups
export const actions = {
  clouds: cloudsActions,
  tables: tablesActions,
  users: usersActions,
  buckets: bucketsActions,
  navigation: navigationActions,
};

// ============================================================================
// THUNKS - Re-export all thunks
// ============================================================================

export * from './thunks';

// ============================================================================
// SELECTORS - Re-export all selectors
// ============================================================================

export * from './selectors';

// Backwards compatibility: Export the most commonly used selectors at top level
export { selectCloudById, selectTablesByCloudId, selectTableById, selectTableFields } from './selectors/clouds.selectors';
export { selectTableRecords, selectTableLoading, selectTableState } from './selectors/tables.selectors';
export { selectUsersForCloud, selectUserById } from './selectors/users.selectors';
export { selectBucketsForCloud, selectBucketById } from './selectors/buckets.selectors';
export { selectQuickFilter, selectIsSearching as selectSearching, selectSearchResults } from './selectors/navigation.selectors';

// ============================================================================
// TYPES - Re-export types
// ============================================================================

export type {
  CloudInstance,
  CloudTable,
  CloudRecord,
  CloudUser,
  CloudBucket,
  CloudField,
  TableState,
  SearchResult,
  CacheState,
  DatabaseNavigation,
} from './types';

// ============================================================================
// UTILITIES - Export useful utilities
// ============================================================================

export { normalizeTableId, findTableById, isTextSearchableField } from './utils';

