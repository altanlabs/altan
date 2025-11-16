/**
 * Type definitions for cloud slice state
 */

import type {
  CloudInstance,
  CloudTable,
  CloudRecord,
  CloudUser,
  CloudBucket,
} from '../../../services';

// Re-export service types for convenience
export type {
  CloudInstance,
  CloudTable,
  CloudRecord,
  CloudUser,
  CloudBucket,
  CloudField,
} from '../../../services';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 50,
  INITIAL_PAGE: 0,
} as const;

// ============================================================================
// STATE INTERFACES
// ============================================================================

/**
 * State for a single table's records
 */
export interface TableState {
  records: CloudRecord[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
}

/**
 * Search results for a table
 */
export interface SearchResult {
  results: CloudRecord[];
  query: string;
  totalSearchResults: number;
  newRecordsFound: number;
  timestamp: number;
}

/**
 * Cache state metadata
 */
export interface CacheState {
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

/**
 * Database navigation UI state
 */
export interface DatabaseNavigation {
  quickFilter: string;
  isSearching: boolean;
  searchResults: Record<string, SearchResult>;
}

// ============================================================================
// SLICE STATES
// ============================================================================

/**
 * Clouds slice state
 */
export interface CloudsState {
  clouds: Record<string, CloudInstance>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Tables slice state
 */
export interface TablesState {
  tables: Record<string, TableState>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Users slice state
 */
export interface UsersState {
  userCache: Record<string, Record<string, CloudUser>>;
  cacheState: CacheState;
}

/**
 * Buckets slice state
 */
export interface BucketsState {
  bucketCache: Record<string, Record<string, CloudBucket>>;
  cacheState: CacheState;
}

/**
 * Navigation slice state
 */
export interface NavigationState extends DatabaseNavigation {}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates initial table state
 */
export const createInitialTableState = (overrides: Partial<TableState> = {}): TableState => ({
  records: [],
  total: 0,
  loading: false,
  currentPage: DEFAULT_PAGINATION.INITIAL_PAGE,
  pageSize: DEFAULT_PAGINATION.PAGE_SIZE,
  ...overrides,
});

