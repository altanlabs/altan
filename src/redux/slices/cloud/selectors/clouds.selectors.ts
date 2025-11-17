/**
 * Cloud instances selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { CloudInstance, CloudTable } from '../../../../services';
import { normalizeTableId } from '../utils';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Selects the entire cloud slice state
 */
export const selectCloudsState = (state: RootState) => state.cloud;

/**
 * Selects all clouds as a record
 */
export const selectClouds = createSelector(
  [selectCloudsState],
  (cloudState) => cloudState?.clouds || {},
);

/**
 * Selects loading state
 */
export const selectCloudsLoading = createSelector(
  [selectCloudsState],
  (cloudState) => cloudState?.isLoading || false,
);

/**
 * Selects error state
 */
export const selectCloudsError = createSelector(
  [selectCloudsState],
  (cloudState) => cloudState?.error || null,
);

// ============================================================================
// PARAMETERIZED SELECTORS
// ============================================================================

/**
 * Selects a specific cloud by ID
 */
export const selectCloudById = createSelector(
  [selectClouds, (_: RootState, cloudId: string) => cloudId],
  (clouds, cloudId): CloudInstance | undefined => clouds[cloudId],
);

/**
 * Selects tables for a specific cloud
 */
export const selectTablesByCloudId = createSelector(
  [selectCloudById],
  (cloud): CloudTable[] => {
    const tables: CloudTable[] = cloud?.tables?.items || [];
    // Only return tables in public schema
    return tables.filter((table) => table.schema === 'public');
  },
);

/**
 * Selects all tables (including system schemas) for a specific cloud
 */
export const selectAllTablesByCloudId = createSelector(
  [selectCloudById],
  (cloud): CloudTable[] => cloud?.tables?.items || [],
);

/**
 * Selects a specific table by cloud ID and table ID
 */
export const selectTableById = createSelector(
  [selectTablesByCloudId, (_: RootState, __: string, tableId: string | number) => tableId],
  (tables, tableId): CloudTable | undefined => {
    const numericTableId = normalizeTableId(tableId);
    return tables.find((t) => t.id === numericTableId);
  },
);

/**
 * Selects fields for a specific table
 */
export const selectTableFields = createSelector(
  [selectTableById],
  (table) => table?.fields?.items || [],
);

/**
 * Checks if a cloud exists but is stopped (failed to fetch)
 */
export const selectIsCloudStopped = createSelector(
  [
    selectCloudById,
    selectCloudsState,
    (_: RootState, cloudId: string) => cloudId,
  ],
  (cloud, cloudState, cloudId): boolean => {
    const failedCloudIds = cloudState?.failedCloudIds || {};
    return !cloud && cloudId in failedCloudIds;
  },
);

