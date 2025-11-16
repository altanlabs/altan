/**
 * Tables/Records thunks - async operations for table records
 */

import type { AppDispatch, RootState } from '../../../store';
import { getCloudService } from '../../../../services';
import {
  setLoading,
  setError,
  setTableLoading,
  setTableRecords,
  addRecord,
  updateRecord,
  removeRecord,
} from '../slices/tables.slice';
import { handleThunkError, findTableById, normalizeTable } from '../utils';
import { DEFAULT_PAGINATION } from '../types';
import type { CloudTable } from '../../../../services';

const cloudService = getCloudService();

// ============================================================================
// HELPER TO GET CLOUD AND TABLE
// ============================================================================

const getCloudAndTable = (
  state: RootState,
  cloudId: string,
  tableId: string | number,
): { cloudId: string; tableName: string } => {
  // This is a helper that's used internally by thunks
  // Try to find table from clouds state
  const cloud = state.cloud?.clouds?.[cloudId];
  if (!cloud) {
    throw new Error(`Cloud instance ${cloudId} not found`);
  }

  const table = findTableById(cloud, tableId);
  if (!table) {
    throw new Error(`Table ${tableId} not found in cloud ${cloudId}`);
  }

  return { cloudId: cloud.id, tableName: table.name };
};

// ============================================================================
// INTERNAL ACTION FOR SETTING TABLES IN CLOUDS
// ============================================================================

/**
 * Internal action to set tables when fetching cloud
 * This maintains backwards compatibility with cloud fetch operations
 */
export const setTables =
  (cloudId: string, tables: CloudTable[]) => async (dispatch: AppDispatch) => {
    // This is just a compatibility shim - the actual table state
    // is managed in the clouds slice
    // In a full refactor, you might want to move table metadata to a separate slice
    return Promise.resolve();
  };

// ============================================================================
// RECORD OPERATIONS
// ============================================================================

interface FetchRecordsOptions {
  limit?: number;
  offset?: number;
  order?: string;
  filters?: Record<string, unknown>;
}

/**
 * Fetches records for a table
 */
export const fetchRecords =
  (cloudId: string, tableId: string, options: FetchRecordsOptions = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { limit = DEFAULT_PAGINATION.PAGE_SIZE, offset = 0, order, filters } = options;

    dispatch(setTableLoading({ tableId, loading: true }));

    try {
      const { cloudId: resolvedCloudId, tableName } = getCloudAndTable(getState(), cloudId, tableId);

      const fetchOptions: FetchRecordsOptions = {
        limit,
        offset,
        ...(order && { order }),
        ...(filters && { filters }),
      };

      const result = await cloudService.fetchRecords(resolvedCloudId, tableName, fetchOptions);

      const currentPage = Math.floor(offset / limit);

      dispatch(
        setTableRecords({
          tableId,
          records: result.records,
          total: result.total,
          isPagination: offset > 0,
          currentPage,
          pageSize: limit,
        }),
      );

      return result.records;
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setTableLoading({ tableId, loading: false }));
    }
  };

/**
 * Creates a new record in a table
 */
export const createRecord =
  (cloudId: string, tableId: string, data: Record<string, unknown>) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { cloudId: resolvedCloudId, tableName } = getCloudAndTable(getState(), cloudId, tableId);

      const record = await cloudService.createRecord(resolvedCloudId, tableName, data);

      dispatch(addRecord({ tableId, record }));

      return record;
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setError(message));
      throw error;
    }
  };

/**
 * Updates a record in a table
 */
export const updateRecordById =
  (cloudId: string, tableId: string, recordId: string, changes: Record<string, unknown>) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { cloudId: resolvedCloudId, tableName } = getCloudAndTable(getState(), cloudId, tableId);

      const record = await cloudService.updateRecord(resolvedCloudId, tableName, recordId, changes);

      dispatch(updateRecord({ tableId, recordId, changes }));

      return record;
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setError(message));
      throw error;
    }
  };

/**
 * Deletes a record from a table
 */
export const deleteRecord =
  (cloudId: string, tableId: string, recordId: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { cloudId: resolvedCloudId, tableName } = getCloudAndTable(getState(), cloudId, tableId);

      await cloudService.deleteRecord(resolvedCloudId, tableName, recordId);

      dispatch(removeRecord({ tableId, recordId }));
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setError(message));
      throw error;
    }
  };

