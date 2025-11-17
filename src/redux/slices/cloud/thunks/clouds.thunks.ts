/**
 * Cloud instance thunks - async operations for cloud instances
 */

import { getCloudService } from '../../../../services';
import {
  setLoading,
  setError,
  setCloud,
  setCloudFetchFailed,
  clearCloudFetchFailed,
} from '../slices/clouds.slice';
import { handleThunkError } from '../utils';
import { setTables as setTablesInClouds } from './tables.thunks';
import type { CloudTable } from '../../../../services';
import type { AppDispatch } from '../../../store';

const cloudService = getCloudService();

// ============================================================================
// CLOUD OPERATIONS
// ============================================================================

/**
 * Fetches a cloud instance by ID
 */
export const fetchCloud = (cloudId: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const cloud = await cloudService.fetchCloud(cloudId);
    dispatch(setCloud(cloud));
    // Clear any previous failure for this cloudId
    dispatch(clearCloudFetchFailed(cloudId));

    // Also set tables if present
    if (cloud.tables?.items) {
      await dispatch(setTablesInClouds(cloudId, cloud.tables.items));
    }

    return cloud;
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setError(message));
    // Mark this cloud as failed to fetch (likely stopped)
    dispatch(setCloudFetchFailed({ cloudId, error: message }));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Creates a new table in the cloud instance
 */
export const createTable =
  (cloudId: string, tableData: Partial<CloudTable>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const result = await cloudService.createTable(cloudId, tableData);

      // Refresh tables
      await dispatch(fetchCloud(cloudId));

      return result;
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

/**
 * Deletes a table from the cloud instance
 */
export const deleteTable = (cloudId: string, tableId: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    await cloudService.deleteTable(cloudId, tableId);

    // Refresh tables
    await dispatch(fetchCloud(cloudId));
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

