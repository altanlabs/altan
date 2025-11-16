/**
 * Field/Column operations thunks
 */

import type { AppDispatch } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import { setColumns, addField, updateField, deleteField } from '../slices/tables.slice';
import { handleThunkError } from '../utils';
import type { PgMetaColumn, FieldData } from '../types';

const getService = () => getDatabaseService();

export const fetchColumns = (baseId: string, tableId: number) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const service = getService();
    const fields = await service.fetchColumns(baseId, tableId);

    // Transform BaseField[] to PgMetaColumn[]
    const columns: PgMetaColumn[] = fields.map((f) => ({
      id: f.id,
      name: f.name,
      data_type: f.data_type,
      format: f.format,
      is_nullable: f.is_nullable,
      is_unique: f.is_unique,
      is_identity: f.is_identity,
      identity_generation: f.identity_generation,
      is_generated: f.is_generated,
      is_updatable: f.is_updatable,
      default_value: f.default_value,
      comment: f.comment,
      ordinal_position: f.ordinal_position,
      enums: f.enums,
      check: f.check,
      table_id: f.table_id,
      schema: f.schema,
      table: f.table,
    }));

    dispatch(setColumns({ baseId, tableId, columns }));
    return columns;
  } catch (error: unknown) {
    dispatch(setError(handleThunkError(error)));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createField =
  (baseId: string, tableId: number, fieldData: FieldData) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      const field = await service.createColumn(baseId, tableId, fieldData);
      dispatch(addField({ baseId, tableId, field }));
      return field;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateFieldById =
  (baseId: string, tableId: number, fieldId: number, changes: Partial<FieldData>) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      const field = await service.updateColumn(baseId, fieldId, changes);
      dispatch(updateField({ baseId, tableId, fieldId, changes: field }));
      return field;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteFieldById =
  (baseId: string, tableId: number, fieldId: number, cascade = false) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      await service.deleteColumn(baseId, fieldId, cascade);
      dispatch(deleteField({ baseId, tableId, fieldId }));
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

