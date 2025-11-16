/**
 * Record operations thunks
 */

import type { AppDispatch, RootState } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import {
  setTableRecordsLoading,
  setTableRecords,
  addTableRecord,
  updateTableRecord,
  deleteTableRecord,
  setTableRecordsState,
} from '../slices/records.slice';
import { handleThunkError, hasCreatedAtField, isTextSearchableField } from '../utils';
import type { LoadTableRecordsOptions, QueryParams } from '../types';

const getService = () => getDatabaseService();

export const getTableRecord =
  (tableId: number | string, recordId: string, customTableName: string | null = null) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      let baseId: string | undefined;
      let tableName: string | undefined;

      // Try to resolve table from bases slice
      for (const [bId, base] of Object.entries(state.bases.tables)) {
        if (base?.items) {
          const table = base.items.find((t) => t.id === numericTableId);
          if (table) {
            baseId = bId;
            tableName = customTableName || table.name || table.db_name;
            break;
          }
        }
      }

      // Fall back to cloud slice
      if (!baseId || !tableName) {
        const cloudState = state.cloud;
        if (cloudState?.clouds) {
          for (const [cloudId, cloud] of Object.entries(cloudState.clouds)) {
            const tables = cloud?.tables?.items;
            if (!tables || !Array.isArray(tables)) continue;

            const table = tables.find((t) => t.id === numericTableId);
            if (table) {
              baseId = cloudId;
              tableName = customTableName || (table as { db_name?: string; name?: string }).db_name || table.name;
              break;
            }
          }
        }
      }

      if (!baseId || !tableName) {
        throw new Error(`Could not find base or table name for table ${tableId}`);
      }

      const service = getService();
      const record = await service.getRecord(baseId, tableName, recordId);
      return Promise.resolve(record);
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getTableRecordCount = (tableId: number | string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const state = getState();
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

    const baseId = Object.keys(state.bases.tables).find((baseId) =>
      state.bases.tables[baseId]?.items?.some((t) => t.id === numericTableId),
    );
    if (!baseId) {
      throw new Error(`Could not find base containing table ${tableId}`);
    }

    const table = state.bases.tables[baseId]?.items?.find((t) => t.id === numericTableId);
    const tableName = table?.db_name || table?.name;
    const schemaName = table?.schema;

    if (!tableName) {
      throw new Error(`Could not find table name for table ${tableId}`);
    }

    const service = getService();
    return await service.getRecordCount(baseId, tableName, schemaName);
  } catch {
    return 0;
  }
};

export const loadTableRecords =
  (tableId: number | string, options: LoadTableRecordsOptions = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const {
      limit = 50,
      page = 0,
      forceReload = false,
      searchQuery = null,
      filters = null,
      append = false,
    } = options;

    const offset = page * limit;
    const state = getState();
    const tableIdStr = String(tableId);
    const recordsState = state.bases.recordsState[tableIdStr];
    const records = state.bases.records[tableIdStr];

    if (!forceReload && !searchQuery && !filters && records?.items?.length > 0 && !append) {
      return Promise.resolve(records);
    }

    if (recordsState?.loading) {
      return;
    }

    dispatch(setTableRecordsLoading({ tableId: tableIdStr, loading: true }));

    try {
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      const baseId = Object.keys(state.bases.tables).find((baseId) =>
        state.bases.tables[baseId]?.items?.some((t) => t.id === numericTableId),
      );
      if (!baseId) {
        throw new Error(`Could not find base containing table ${tableId}`);
      }

      const table = state.bases.tables[baseId]?.items?.find((t) => t.id === numericTableId);
      const tableName = table?.db_name || table?.name;

      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      // Auto-sort by created_at if available
      let order = options.order;
      if (table?.fields?.items && hasCreatedAtField(table.fields.items) && !order) {
        order = 'created_at.desc';
      }

      // Get text fields for search
      let textFields: string[] | undefined;
      if (searchQuery && searchQuery.trim()) {
        const fields = table.fields?.items?.filter((field) =>
          isTextSearchableField(field.data_type),
        );
        textFields = fields?.map((f) => f.db_field_name || f.name) || [];
      }

      const service = getService();
      const { records: responseRecords, total: totalCount } = await service.fetchRecords(baseId, tableName, {
        limit,
        offset,
        order,
        filters: filters || undefined,
        searchQuery: searchQuery || undefined,
        textFields,
      });

      dispatch(
        setTableRecords({
          tableId: tableIdStr,
          records: responseRecords,
          total: totalCount,
          next_page_token: responseRecords.length === limit ? offset + limit : undefined,
          isPagination: append,
        }),
      );

      dispatch(
        setTableRecordsState({
          tableId: tableIdStr,
          loading: false,
          lastFetched: Date.now(),
          cached: false,
          searchQuery,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(Math.max(totalCount, 1) / limit),
          totalRecords: totalCount,
        }),
      );

      return getState().bases.records[tableIdStr];
    } catch (error) {
      dispatch(setError((error as Error).message));
      dispatch(setTableRecordsLoading({ tableId: tableIdStr, loading: false }));
      return { items: [], total: 0 };
    } finally {
      dispatch(setTableRecordsLoading({ tableId: tableIdStr, loading: false }));
    }
  };

export const loadAllTableRecords = (tableId: number | string, forceReload = false): ReturnType<typeof loadTableRecords> =>
  loadTableRecords(tableId, { limit: 50, forceReload });

export const queryTableRecords =
  (baseId: string, tableId: number, queryParams: QueryParams = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const table = state.bases.tables[baseId]?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;

      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      let order = queryParams.order;
      if (table?.fields?.items && hasCreatedAtField(table.fields.items) && !order) {
        order = 'created_at.desc';
      }

      const service = getService();
      const { records, total } = await service.fetchRecords(baseId, tableName, {
        limit: queryParams.limit,
        offset: queryParams.offset,
        order,
        filters: queryParams,
      });

      const next_page_token =
        records.length === queryParams.limit
          ? (Number(queryParams.offset) || 0) + Number(queryParams.limit)
          : null;

      dispatch(
        setTableRecords({
          tableId: String(tableId),
          records,
          total,
          next_page_token,
          isPagination: !!queryParams.offset,
        }),
      );

      return { records, total, next_page_token };
    } catch (error) {
      throw error;
    }
  };

export const createTableRecord =
  (baseId: string, tableId: number, data: Record<string, unknown>) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const table = state.bases.tables[baseId]?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;

      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      const service = getService();
      const record = await service.createRecord(baseId, tableName, data);

      dispatch(
        addTableRecord({
          tableId: String(tableId),
          record,
          insertAtBeginning: true,
        }),
      );

      return { records: [record] };
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateTableRecordById =
  (baseId: string, tableId: number, recordId: string, changes: Record<string, unknown>) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const table = state.bases.tables[baseId]?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;

      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      const service = getService();
      const record = await service.updateRecord(baseId, tableName, recordId, changes);

      dispatch(
        updateTableRecord({
          tableId: String(tableId),
          recordId,
          changes,
        }),
      );

      return record;
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteTableRecordById =
  (baseId: string, tableId: number, recordIds: string | string[]) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const table = state.bases.tables[baseId]?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;

      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      const service = getService();
      await service.deleteRecords(baseId, tableName, recordIds);

      const ids = Array.isArray(recordIds) ? recordIds : [recordIds];
      ids.forEach((recordId) => {
        dispatch(deleteTableRecord({ tableId: String(tableId), recordId }));
      });
    } catch (error: unknown) {
      dispatch(setError(handleThunkError(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

