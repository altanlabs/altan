/**
 * Central export for all bases slices
 */

export { default as basesReducer } from './bases.slice';
export { default as schemasReducer } from './schemas.slice';
export { default as tablesReducer } from './tables.slice';
export { default as recordsReducer } from './records.slice';
export { default as realtimeReducer } from './realtime.slice';
export { default as usersReducer } from './users.slice';
export { default as bucketsReducer } from './buckets.slice';

// Re-export actions
export * as basesActions from './bases.slice';
export * as schemasActions from './schemas.slice';
export * as tablesActions from './tables.slice';
export * as recordsActions from './records.slice';
export * as realtimeActions from './realtime.slice';
export * as usersActions from './users.slice';
export * as bucketsActions from './buckets.slice';

