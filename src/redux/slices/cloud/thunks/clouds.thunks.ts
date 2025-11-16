/**
 * Cloud instance thunks - async operations for cloud instances
 */

import type { AppDispatch } from '../../../store';
import { getCloudService } from '../../../../services';
import { setLoading, setError, setCloud } from '../slices/clouds.slice';
import { setTables as setTablesInClouds } from './tables.thunks';
import { handleThunkError } from '../utils';
import type { CloudTable } from '../../../../services';

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

    // Also set tables if present
    if (cloud.tables?.items) {
      await dispatch(setTablesInClouds(cloudId, cloud.tables.items));
    }

    return cloud;
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setError(message));
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

