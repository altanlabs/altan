/**
 * Bases Reducer
 * Combines all domain slices into a FLAT structure
 * 
 * This maintains the exact state shape that existing code expects:
 * state.bases = {
 *   isLoading, error, bases: {},
 *   schemas: {}, tables: {}, records: {}, recordsState: {}, ...
 * }
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import basesReducer from './slices/bases.slice';
import schemasReducer from './slices/schemas.slice';
import tablesReducer from './slices/tables.slice';
import recordsReducer from './slices/records.slice';
import realtimeReducer from './slices/realtime.slice';
import usersReducer from './slices/users.slice';
import bucketsReducer from './slices/buckets.slice';
import type { BasesState } from './types';

/**
 * Custom combined reducer that maintains flat structure
 */
const basesReducer_combined = (state: BasesState | undefined, action: PayloadAction<any>): BasesState => {
  // Let each reducer handle its slice
  const basesState = basesReducer(
    state
      ? {
          isLoading: state.isLoading,
          error: state.error,
          initialized: state.initialized,
          bases: state.bases,
        }
      : undefined,
    action,
  );

  const schemasState = schemasReducer(state?.schemas, action);
  const tablesState = tablesReducer(state?.tables, action);

  const recordsState = recordsReducer(
    state
      ? {
          records: state.records,
          recordsState: state.recordsState,
        }
      : undefined,
    action,
  );

  // Realtime reducer works on the same records state
  const realtimeState = realtimeReducer(
    {
      records: recordsState.records,
      recordsState: recordsState.recordsState,
    },
    action,
  );

  const usersState = usersReducer(
    state
      ? {
          userCache: state.userCache,
          userCacheState: state.userCacheState,
        }
      : undefined,
    action,
  );

  const bucketsState = bucketsReducer(
    state
      ? {
          bucketCache: state.bucketCache,
          bucketCacheState: state.bucketCacheState,
        }
      : undefined,
    action,
  );

  // Return flat combined state
  return {
    // Bases slice state
    isLoading: basesState.isLoading,
    error: basesState.error,
    initialized: basesState.initialized,
    bases: basesState.bases,
    // Schemas slice state
    schemas: schemasState,
    // Tables slice state
    tables: tablesState,
    // Records slice state (potentially modified by realtime)
    records: realtimeState.records,
    recordsState: realtimeState.recordsState,
    // Users slice state
    userCache: usersState.userCache,
    userCacheState: usersState.userCacheState,
    // Buckets slice state
    bucketCache: bucketsState.bucketCache,
    bucketCacheState: bucketsState.bucketCacheState,
  };
};

export default basesReducer_combined;
