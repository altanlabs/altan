/**
 * Bases slice - Refactored modular structure
 * 
 * This is the main entry point for the bases slice, now organized using
 * DRY and SOLID principles.
 * 
 * Structure:
 * - /slices     - Individual domain reducers
 * - /thunks     - Async operations organized by domain
 * - /selectors  - Memoized selectors organized by domain
 * - /utils      - Shared utility functions
 * - /types      - TypeScript type definitions
 */

// ============================================================================
// IMPORTS
// ============================================================================

import * as basesActions from './slices/bases.slice';
import * as bucketsActions from './slices/buckets.slice';
import * as recordsActions from './slices/records.slice';
import * as realtimeActions from './slices/realtime.slice';
import * as schemasActions from './slices/schemas.slice';
import * as tablesActions from './slices/tables.slice';
import * as usersActions from './slices/users.slice';

// ============================================================================
// MAIN REDUCER
// ============================================================================

export { default } from './combineReducers';

// ============================================================================
// ACTIONS - Re-export all actions
// ============================================================================

// Bases actions
export const { setLoading, setError, stopLoading, addBase, updateBase, deleteBase } = basesActions;

// Schemas actions
export const { setSchemasLoading, setSchemas, setSchemasError } = schemasActions;

// Tables actions
export const { setTables, addTable, updateTable, deleteTable, setColumns, addField, updateField, deleteField } =
  tablesActions;

// Records actions
export const {
  setTableRecordsLoading,
  setTableRecords,
  addTableRecord,
  updateTableRecord,
  deleteTableRecord,
  setTableRecordsState,
  clearTableRecords,
} = recordsActions;

// Realtime actions
export const { integrateRealTimeUpdates, clearRealTimeUpdateFlags } = realtimeActions;

// Users actions
export const { setUserCacheLoading, setUserCache, setUserCacheError, clearUserCache } = usersActions;

// Buckets actions
export const {
  setBucketCacheLoading,
  setBucketCache,
  setBucketCacheError,
  clearBucketCache,
  addBucketToCache,
  removeBucketFromCache,
  updateBucketInCache,
} = bucketsActions;

// Export namespaced actions
export const actions = {
  bases: basesActions,
  schemas: schemasActions,
  tables: tablesActions,
  records: recordsActions,
  realtime: realtimeActions,
  users: usersActions,
  buckets: bucketsActions,
};

// ============================================================================
// THUNKS - Re-export all thunks
// ============================================================================

export * from './thunks';

// ============================================================================
// SELECTORS - Re-export all selectors
// ============================================================================

export * from './selectors';

// ============================================================================
// TYPES - Re-export types
// ============================================================================

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
  RecordMetadata,
  RecordsState,
  SchemaState,
  TablesState,
  RecordsData,
  CacheState,
  BasesState,
  FetchTablesOptions,
  LoadTableRecordsOptions,
  QueryParams,
  FieldData,
  RealTimeUpdates,
} from './types';

// ============================================================================
// UTILITIES - Export useful utilities
// ============================================================================

export { handleThunkError, deduplicateRecords, isTextSearchableField, hasCreatedAtField } from './utils';

