import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosInstance } from "axios";
import {
  TableState,
  TableRecordItem,
  TableRecordData,
  QueryParams,
  RootState,
  TableSchema,
  OptimisticUpdatePayload,
  OptimisticDeletePayload,
  RollbackUpdatePayload,
  RollbackAddPayload
} from "./types";
import type { DatabaseConfig } from "../config";

const initialState: TableState = {
  tables: { byId: {}, byName: {}, allIds: [] },
  schemas: { byTableId: {} },
  records: { byTableId: {} },
  loading: { tables: "idle", records: "idle", schemas: "idle" },
  error: null,
  initialized: {}
};

const getTableId = (state: RootState, tableName: string): string => {
  const tableId = state.tables.tables.byName[tableName];
  if (!tableId) throw new Error(`Table ${tableName} not found`);
  return tableId;
};

export const fetchTableRecords = createAsyncThunk<
  { tableId: string; records: TableRecordItem[]; total: number; nextPageToken: string },
  { tableName: string; queryParams?: QueryParams },
  { state: RootState; extra: { api: AxiosInstance }; rejectValue: string }
>(
  "tables/fetchRecords",
  async ({ tableName, queryParams = {} }, thunkAPI) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const tableId = getTableId(thunkAPI.getState(), tableName);
        const { api } = thunkAPI.extra;
        
        const response = await api.post(`/table/${tableId}/record/query`, {
          filters: queryParams.filters || [],
          sort: queryParams.sort || [],
          limit: queryParams.limit || 100,
          page_token: queryParams.pageToken,
          fields: queryParams.fields,
          amount: queryParams.amount || "all"
        });

        return {
          tableId,
          records: response.data.records,
          total: response.data.total,
          nextPageToken: response.data.next_page_token
        };
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
      }
    }

    return thunkAPI.rejectWithValue(
      lastError instanceof Error ? lastError.message : 'Failed to fetch records'
    );
  }
);

export const createRecord = createAsyncThunk<
  { tableId: string; record: TableRecordItem },
  { tableName: string; record: Record<string, unknown> },
  { state: RootState; extra: { api: AxiosInstance }; rejectValue: string }
>(
  "tables/createRecord",
  async ({ tableName, record }, thunkAPI) => {
    try {
      const tableId = getTableId(thunkAPI.getState(), tableName);
      const { api } = thunkAPI.extra;
      const response = await api.post(`/table/${tableId}/record`, {
        records: [{ fields: record }]
      });
      return { tableId, record: response.data.records[0] };
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Failed to create record');
    }
  }
);

export const updateRecord = createAsyncThunk<
  { tableId: string; record: TableRecordItem },
  { tableName: string; recordId: number; updates: Record<string, unknown> },
  { state: RootState; extra: { api: AxiosInstance }; rejectValue: string }
>(
  "tables/updateRecord",
  async ({ tableName, recordId, updates }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = getTableId(state, tableName);
    const { api } = thunkAPI.extra as { api: AxiosInstance };
    const response = await api.patch(`/table/${tableId}/record/${recordId}`, {
      fields: updates
    });
    return { tableId, record: response.data.record };
  }
);

export const deleteRecord = createAsyncThunk<
  { tableId: string; recordId: number },
  { tableName: string; recordId: number },
  { state: RootState }
>(
  "tables/deleteRecord",
  async ({ tableName, recordId }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId) throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra as { api: AxiosInstance };
    await api.delete(`/table/${tableId}/record/${recordId}`);
    return { tableId, recordId };
  }
);

export const fetchTableSchema = createAsyncThunk<
  { tableId: string; schema: TableSchema },
  { tableName: string },
  { state: RootState; extra: { api: AxiosInstance } }
>(
  "tables/fetchSchema",
  async ({ tableName }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId) throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra;
    const response = await api.get(`/table/${tableId}`);
    return { tableId, schema: response.data.table as TableSchema };
  }
);

export const createRecords = createAsyncThunk<
  { tableId: string; records: TableRecordItem[] },
  { tableName: string; records: unknown[] },
  { state: RootState; extra: { api: AxiosInstance }; rejectValue: string }
>(
  "tables/createRecords",
  async ({ tableName, records }, thunkAPI) => {
    try {
      const tableId = getTableId(thunkAPI.getState(), tableName);
      const { api } = thunkAPI.extra;
      const response = await api.post(`/table/${tableId}/record`, {
        records: records.map(record => ({ fields: record }))
      });
      return { tableId, records: response.data.records };
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Failed to create records');
    }
  }
);

export const deleteRecords = createAsyncThunk<
  { tableId: string; recordIds: number[] },
  { tableName: string; recordIds: number[] },
  { state: RootState }
>(
  "tables/deleteRecords",
  async ({ tableName, recordIds }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId) throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra as { api: AxiosInstance };
    await api.delete(`/table/${tableId}/record`, {
      data: { records: recordIds }
    });
    return { tableId, recordIds };
  }
);

const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    initializeTables: (state, action: PayloadAction<DatabaseConfig>) => {
      const { SAMPLE_TABLES } = action.payload;
      Object.entries(SAMPLE_TABLES).forEach(([name, id]) => {
        state.tables.byId[id] = { id: parseInt(id), name };
        state.tables.byName[name] = id;
        if (!state.tables.allIds.includes(id)) state.tables.allIds.push(id);
        state.initialized[id] = false;
      });
    },
    clearTableData: (state, action: PayloadAction<string>) => {
      const tableId = state.tables.byName[action.payload];
      if (tableId) {
        delete state.records.byTableId[tableId];
        state.initialized[tableId] = false;
      }
    },
    optimisticAddRecord: (state, action: PayloadAction<{ tableId: string; record: TableRecordItem }>) => {
      const { tableId, record } = action.payload;
      if (state.records.byTableId[tableId]?.items) {
        state.records.byTableId[tableId].items.push(record);
      }
    },
    optimisticUpdateRecord: (state, action: PayloadAction<OptimisticUpdatePayload>) => {
      const { tableId, recordId, updates } = action.payload;
      const items = state.records.byTableId[tableId]?.items;
      if (items) {
        const index = items.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          items[index] = {
            ...items[index],
            ...updates
          };
        }
      }
    },
    optimisticDeleteRecord: (state, action: PayloadAction<OptimisticDeletePayload>) => {
      const { tableId, recordId } = action.payload;
      const items = state.records.byTableId[tableId]?.items;
      if (items) {
        state.records.byTableId[tableId].items = items.filter((r) => r.id !== recordId);
      }
    },
    optimisticAddRecords: (state, action: PayloadAction<{ tableId: string; records: TableRecordItem[] }>) => {
      const { tableId, records } = action.payload;
      if (state.records.byTableId[tableId]?.items) {
        state.records.byTableId[tableId].items.push(...records);
      }
    },
    optimisticDeleteRecords: (state, action: PayloadAction<{ tableId: string; recordIds: number[] }>) => {
      const { tableId, recordIds } = action.payload;
      const items = state.records.byTableId[tableId]?.items;
      if (items) {
        state.records.byTableId[tableId].items = items.filter(
          (r) => !recordIds.includes(r.id)
        );
      }
    },
    rollbackAddRecord: (state, action: PayloadAction<RollbackAddPayload>) => {
      const { tableId, tempId } = action.payload;
      const items = state.records.byTableId[tableId]?.items;
      if (items) {
        state.records.byTableId[tableId].items = items.filter((r) => r.id !== tempId);
      }
    },
    rollbackUpdateRecord: (state, action: PayloadAction<RollbackUpdatePayload>) => {
      const { tableId, recordId, originalRecord } = action.payload;
      const items = state.records.byTableId[tableId]?.items;
      if (items) {
        const index = items.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          items[index] = originalRecord;
        }
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<TableState>) => {
    builder
      .addCase(fetchTableRecords.pending, (state) => {
        state.loading.records = "loading";
        state.error = null;
      })
      .addCase(fetchTableRecords.fulfilled, (state, action) => {
        const { tableId, records, total, nextPageToken } = action.payload;
        state.records.byTableId[tableId] = {
          items: records,
          total,
          lastUpdated: new Date().toISOString(),
          nextPageToken
        };
        state.loading.records = "idle";
        state.initialized[tableId] = true;
        state.error = null;
      })
      .addCase(fetchTableRecords.rejected, (state, action) => {
        state.loading.records = "error";
        state.error = action.payload || 'An unknown error occurred';
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        const { tableId, record } = action.payload;
        if (state.records.byTableId[tableId]?.items) {
          state.records.byTableId[tableId].items.push(record);
        }
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        const { tableId, record } = action.payload;
        const items = state.records.byTableId[tableId]?.items;
        if (items) {
          const index = items.findIndex((r) => r.id === record.id);
          if (index !== -1) {
            items[index] = record;
          }
        }
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        const { tableId, recordId } = action.payload;
        const items = state.records.byTableId[tableId]?.items;
        if (items) {
          state.records.byTableId[tableId].items = items.filter((r) => r.id !== recordId);
        }
      })
      .addCase(fetchTableSchema.pending, (state) => {
        state.loading.schemas = "loading";
      })
      .addCase(fetchTableSchema.fulfilled, (state, action) => {
        const { tableId, schema } = action.payload;
        state.schemas.byTableId[tableId] = schema;
        state.loading.schemas = "idle";
      })
      .addCase(fetchTableSchema.rejected, (state, action) => {
        state.loading.schemas = "idle";
        state.error = action.error.message || null;
      })
      .addCase(createRecords.fulfilled, (state, action) => {
        const { tableId, records } = action.payload;
        if (state.records.byTableId[tableId]?.items) {
          state.records.byTableId[tableId].items.push(...records);
        }
      })
      .addCase(deleteRecords.fulfilled, (state, action) => {
        const { tableId, recordIds } = action.payload;
        const items = state.records.byTableId[tableId]?.items;
        if (items) {
          state.records.byTableId[tableId].items = items.filter(
            (r) => !recordIds.includes(r.id)
          );
        }
      });
  }
});

export const selectTableData = (state: RootState, tableName: string) => {
  const tableId = state.tables.tables.byName[tableName];
  if (!tableId) return null;
  
  const recordData = state.tables.records.byTableId[tableId];
  
  return {
    records: recordData?.items || [],
    total: recordData?.total || 0,
    schema: state.tables.schemas.byTableId[tableId],
    initialized: state.tables.initialized[tableId],
    nextPageToken: recordData?.nextPageToken,
    lastUpdated: recordData?.lastUpdated
  };
};

export const { 
  initializeTables, 
  clearTableData,
  optimisticAddRecord,
  optimisticUpdateRecord,
  optimisticDeleteRecord,
  optimisticAddRecords,
  optimisticDeleteRecords,
  rollbackAddRecord,
  rollbackUpdateRecord 
} = tablesSlice.actions;

export const selectTablesState = (state: RootState) => state.tables;
export const selectTableId = (state: RootState, tableName: string) => state.tables.tables.byName[tableName];
export const selectTableRecords = (state: RootState, tableName: string) => {
  const tableId = state.tables.tables.byName[tableName];
  return tableId ? state.tables.records.byTableId[tableId]?.items || [] : [];
};
export const selectTableTotal = (state: RootState, tableName: string) => {
  const tableId = state.tables.tables.byName[tableName];
  return tableId ? state.tables.records.byTableId[tableId]?.total || 0 : 0;
};
export const selectIsLoading = (state: RootState) => state.tables.loading.records === "loading";
export const selectTableSchema = (state: RootState, tableName: string) => {
  const tableId = state.tables.tables.byName[tableName];
  return tableId ? state.tables.schemas.byTableId[tableId] : null;
};
export const selectSchemaLoading = (state: RootState) => state.tables.loading.schemas === "loading";
export default tablesSlice.reducer;
