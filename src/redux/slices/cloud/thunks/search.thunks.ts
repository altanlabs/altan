/**
 * Search thunks - async operations for table search
 */

import type { AppDispatch, RootState } from '../../../store';
import { getCloudService } from '../../../../services';
import {
  setSearching,
  setSearchResults,
  clearSearchResults,
} from '../slices/navigation.slice';
import { setTableRecords } from '../slices/tables.slice';
import { fetchRecords } from './tables.thunks';
import { handleThunkError, findTableById, isTextSearchableField } from '../utils';
import { DEFAULT_PAGINATION } from '../types';
import type { CloudRecord } from '../../../../services';

const cloudService = getCloudService();

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

/**
 * Searches table records
 */
export const searchTableRecords =
  (cloudId: string, tableId: string, query: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const trimmedQuery = query?.trim();

    // Clear search if query is empty
    if (!trimmedQuery) {
      dispatch(clearSearchResults({ tableId }));
      dispatch(setSearching(false));

      // Reload current page
      const state = getState();
      const tableState = state.cloud?.tables?.tables?.[tableId];
      if (tableState) {
        await dispatch(fetchRecords(cloudId, tableId, { limit: DEFAULT_PAGINATION.PAGE_SIZE }));
      }

      return;
    }

    dispatch(setSearching(true));

    try {
      const state = getState();
      const cloud = state.cloud?.clouds?.[cloudId];
      if (!cloud) {
        throw new Error(`Cloud instance ${cloudId} not found`);
      }

      const table = findTableById(cloud, tableId);
      if (!table) {
        throw new Error(`Table ${tableId} not found in cloud ${cloudId}`);
      }

      // Get searchable text fields
      const textFields: string[] =
        table.fields?.items?.filter(isTextSearchableField).map((field) => field.name) || [];

      if (textFields.length === 0) {
        dispatch(setSearching(false));
        return;
      }

      const result = await cloudService.searchRecords(
        cloud.id,
        table.name,
        trimmedQuery,
        textFields,
      );

      const currentRecords: CloudRecord[] = state.cloud?.tables?.tables?.[tableId]?.records || [];
      const existingIds = new Set(currentRecords.map((record) => record.id));
      const newSearchRecords: CloudRecord[] = result.records.filter(
        (record) => !existingIds.has(record.id),
      );

      // Merge results
      const mergedRecords: CloudRecord[] = [...currentRecords, ...newSearchRecords];

      // Update table records (keep original total, not search total)
      const originalTotal: number = state.cloud?.tables?.tables?.[tableId]?.total || 0;
      dispatch(
        setTableRecords({
          tableId,
          records: mergedRecords,
          total: originalTotal,
          isPagination: false,
        }),
      );

      // Update search results
      dispatch(
        setSearchResults({
          tableId,
          results: newSearchRecords,
          query: trimmedQuery,
          totalSearchResults: result.total,
          newRecordsFound: newSearchRecords.length,
        }),
      );

      return { items: result.records, isSearch: true };
    } catch (error) {
      const message = handleThunkError(error);
      // Note: Error is handled at navigation level, not tables level
      throw error;
    } finally {
      dispatch(setSearching(false));
    }
  };

