/**
 * Tables/Records selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { CloudRecord } from '../../../../services';
import type { TableState } from '../types';
import { createInitialTableState } from '../types';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Selects the entire cloud state
 */
export const selectTablesState = (state: RootState) => state.cloud;

/**
 * Selects all table states
 */
export const selectAllTableStates = createSelector(
  [selectTablesState],
  (cloudState) => cloudState?.tables || {},
);

/**
 * Selects loading state
 */
export const selectTablesLoading = createSelector(
  [selectTablesState],
  (cloudState) => cloudState?.isLoading || false,
);

/**
 * Selects error state
 */
export const selectTablesError = createSelector(
  [selectTablesState],
  (cloudState) => cloudState?.error || null,
);

// ============================================================================
// PARAMETERIZED SELECTORS
// ============================================================================

/**
 * Selects records for a specific table
 */
export const selectTableRecords = createSelector(
  [selectAllTableStates, (_: RootState, tableId: string) => tableId],
  (tables, tableId): CloudRecord[] => tables[tableId]?.records || [],
);

/**
 * Selects loading state for a specific table
 */
export const selectTableLoading = createSelector(
  [selectAllTableStates, (_: RootState, tableId: string) => tableId],
  (tables, tableId): boolean => tables[tableId]?.loading || false,
);

/**
 * Selects the full state for a specific table
 */
export const selectTableState = createSelector(
  [selectAllTableStates, (_: RootState, tableId: string) => tableId],
  (tables, tableId): TableState => tables[tableId] || createInitialTableState(),
);

/**
 * Selects total records count for a specific table
 */
export const selectTableTotal = createSelector(
  [selectTableState],
  (tableState) => tableState.total,
);

/**
 * Selects pagination info for a specific table
 */
export const selectTablePagination = createSelector([selectTableState], (tableState) => ({
  currentPage: tableState.currentPage,
  pageSize: tableState.pageSize,
  total: tableState.total,
  totalPages: Math.ceil(tableState.total / tableState.pageSize) || 1,
}));

/**
 * Selects a specific record by ID from a table
 */
export const selectRecordById = createSelector(
  [selectTableRecords, (_: RootState, __: string, recordId: string) => recordId],
  (records, recordId) => records.find((record) => record.id === recordId),
);

