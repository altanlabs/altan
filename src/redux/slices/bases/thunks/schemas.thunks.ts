/**
 * Schema operations thunks
 */

import type { AppDispatch } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import { handleThunkError } from '../utils';
import type { BaseSchema } from '../../../../types/database';

const getService = () => getDatabaseService();

export const createSchema =
  (baseId: string, schemaData: Partial<BaseSchema>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      return await service.createSchema(baseId, schemaData);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteSchema =
  (baseId: string, schemaId: number, cascade = false) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      await service.deleteSchema(baseId, schemaId, cascade);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

