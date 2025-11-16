/**
 * Type definitions for bases slice
 * 
 * Note: "Bases" historically refers to cloud database instances.
 * This slice handles database-specific operations (SQL, schemas, RLS, etc.)
 */

// Re-export types from database types
export type {
  PgMetaColumn,
  PgMetaTable,
  BaseField,
  BaseTable,
  BaseSchema,
  BaseRecord,
  RLSPolicy,
  BaseUser,
  BaseBucket,
  CloudInstance,
} from '../../../types/database';

// ============================================================================
// RECORD STATE
// ============================================================================

/**
 * Per-table record metadata state
 */
export interface RecordMetadata {
  loading?: boolean;
  lastFetched?: number;
  next_page_token?: number | null;
  isFullyLoaded?: boolean;
  hasRealTimeUpdates?: boolean;
  lastRealTimeUpdate?: number | null;
  totalRecords?: number;
  pageSize?: number;
  totalPages?: number;
  currentPage?: number;
  searchQuery?: string | null;
  isSearchMode?: boolean;
  originalPage?: number;
  originalPageSize?: number;
  hasNewRecordsOnPreviousPages?: boolean;
}

/**
 * Record metadata indexed by table ID
 */
export interface RecordsState {
  [tableId: string]: RecordMetadata;
}

// ============================================================================
// DOMAIN STATE INTERFACES
// ============================================================================

/**
 * Schema state by base ID
 */
export interface SchemaState {
  [baseId: string]: {
    items: import('../../../types/database').BaseSchema[];
    loading: boolean;
    error: string | null;
  };
}

/**
 * Tables state by base ID
 */
export interface TablesState {
  [baseId: string]: {
    items: import('../../../types/database').BaseTable[];
  };
}

/**
 * Records data by table ID
 */
export interface RecordsData {
  [tableId: string]: {
    items: import('../../../types/database').BaseRecord[];
    total: number;
  };
}

/**
 * Cache state metadata
 */
export interface CacheState {
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

// ============================================================================
// MAIN STATE INTERFACE
// ============================================================================

/**
 * Complete bases slice state
 */
export interface BasesState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  bases: Record<string, import('../../../types/database').CloudInstance>;
  schemas: SchemaState;
  tables: TablesState;
  records: RecordsData;
  recordsState: RecordsState;
  userCache: Record<string, Record<string, import('../../../types/database').BaseUser>>;
  userCacheState: CacheState;
  bucketCache: Record<string, Record<string, import('../../../types/database').BaseBucket>>;
  bucketCacheState: CacheState;
}

// ============================================================================
// OPERATION OPTIONS
// ============================================================================

/**
 * Options for fetching tables
 */
export interface FetchTablesOptions {
  include_columns?: boolean;
  include_relationships?: boolean;
  excluded_schemas?: string;
  forceReload?: boolean;
}

/**
 * Options for loading table records
 */
export interface LoadTableRecordsOptions {
  limit?: number;
  page?: number;
  forceReload?: boolean;
  searchQuery?: string | null;
  filters?: Record<string, unknown> | null;
  append?: boolean;
  order?: string;
}

/**
 * Query parameters for table records
 */
export interface QueryParams {
  limit?: number;
  offset?: number;
  order?: string;
  [key: string]: unknown;
}

/**
 * Field data for creating/updating fields
 */
export interface FieldData {
  name: string;
  db_field_name?: string;
  type: string;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
  description?: string;
  comment?: string;
}

/**
 * Real-time update payload
 */
export interface RealTimeUpdates {
  additions?: import('../../../types/database').BaseRecord[];
  updates?: import('../../../types/database').BaseRecord[];
  deletions?: string[];
}

