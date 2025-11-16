/**
 * Table operations thunks
 */

import type { AppDispatch, RootState } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import { setTables, addTable, updateTable, deleteTable } from '../slices/tables.slice';
import { handleThunkError } from '../utils';
import type { PgMetaTable, BaseTable, FetchTablesOptions } from '../types';

const getService = () => getDatabaseService();

export const fetchTables =
  (baseId: string, options: FetchTablesOptions = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const {
      include_columns = true,
      include_relationships = true,
      excluded_schemas = 'pg_catalog,information_schema',
      forceReload = false,
    } = options;

    if (!forceReload) {
      const state = getState();
      const existingTables = state.bases.tables[baseId];
      if (existingTables?.items && existingTables.items.length > 0) {
        return existingTables.items;
      }
    }

    dispatch(setLoading(true));
    try {
      const service = getService();
      const tables = await service.fetchTables(baseId, {
        include_columns,
        include_relationships,
        excluded_schemas,
        include_system_schemas: true,
      });

      // Transform BaseTable[] to PgMetaTable[] for setTables
      const pgMetaTables: PgMetaTable[] = tables.map((t) => ({
        id: t.id,
        name: t.name,
        schema: t.schema,
        rls_enabled: t.rls_enabled,
        rls_forced: t.rls_forced,
        replica_identity: t.replica_identity,
        comment: t.comment,
        bytes: t.bytes,
        size: t.size,
        live_rows_estimate: t.live_rows_estimate,
        dead_rows_estimate: t.dead_rows_estimate,
        columns: t.fields?.items.map((f) => ({
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
        })),
        primary_keys: t.primary_keys,
        relationships: t.relationships,
      }));

      dispatch(setTables({ baseId, tables: pgMetaTables }));
      return pgMetaTables;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const createTable =
  (baseId: string, tableData: Partial<PgMetaTable>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      const table = await service.createTable(baseId, tableData);
      dispatch(addTable({ baseId, table }));
      return table;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateTableById =
  (baseId: string, tableId: number, changes: Partial<BaseTable>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      const table = await service.updateTable(baseId, tableId, changes);

      dispatch(
        updateTable({
          baseId,
          tableId,
          changes: {
            name: table.name,
            db_name: table.db_name,
            schema: table.schema,
            comment: table.comment,
            rls_enabled: table.rls_enabled,
            rls_forced: table.rls_forced,
          },
        }),
      );
      return table;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteTableById =
  (baseId: string, tableId: number, cascade = false) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      await service.deleteTable(baseId, tableId, cascade);
      dispatch(deleteTable({ baseId, tableId }));
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchTablePolicies =
  (baseId: string, _tableId: number, tableName: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const service = getService();
      return await service.fetchTablePolicies(baseId, tableName);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

