/**
 * Import/Export operations thunks
 */

import type { AppDispatch } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import { handleThunkError } from '../utils';

const getService = () => getDatabaseService();

export const importCSVToTable =
  (baseId: string, tableName: string, file: File) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      return await service.importCSV(baseId, tableName, file);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const exportDatabaseToCSV =
  (baseId: string, tableName: string | null = null) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      return await service.exportCSV(baseId, tableName);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const exportDatabaseToSQL =
  (baseId: string, includeData = false) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      return await service.exportSQL(baseId, includeData);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

