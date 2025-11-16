/**
 * Tables slice - manages table records and pagination state
 * Following Single Responsibility Principle: Only handles table records and pagination
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudRecord, CloudTable } from '../../../../services';
import type { TablesState, TableState } from '../types';
import { createInitialTableState } from '../types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TablesState = {
  tables: {},
  isLoading: false,
  error: null,
};

// ============================================================================
// SLICE
// ============================================================================

const tablesSlice = createSlice({
  name: 'cloud/tables',
  initialState,
  reducers: {
    // Loading states
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Table loading state (per table)
    setTableLoading(state, action: PayloadAction<{ tableId: string; loading: boolean }>) {
      const { tableId, loading } = action.payload;
      if (!state.tables[tableId]) {
        state.tables[tableId] = createInitialTableState({ loading });
      } else {
        state.tables[tableId].loading = loading;
      }
    },

    // Record operations
    setTableRecords(
      state,
      action: PayloadAction<{
        tableId: string;
        records: CloudRecord[];
        total: number;
        isPagination?: boolean;
        currentPage?: number;
        pageSize?: number;
      }>,
    ) {
      const { tableId, records, total, isPagination, currentPage, pageSize } = action.payload;

      if (!state.tables[tableId] || !isPagination) {
        state.tables[tableId] = createInitialTableState({
          records: records || [],
          total: total || 0,
          currentPage: currentPage ?? 0,
          pageSize: pageSize ?? 50,
        });
      } else {
        // Append records for pagination, avoiding duplicates
        const existingIds = new Set(state.tables[tableId].records.map((r) => r.id));
        const newRecords = records.filter((r) => !existingIds.has(r.id));
        state.tables[tableId].records.push(...newRecords);
        state.tables[tableId].total = total || state.tables[tableId].total;
        if (currentPage !== undefined) state.tables[tableId].currentPage = currentPage;
        if (pageSize !== undefined) state.tables[tableId].pageSize = pageSize;
      }
    },

    addRecord(state, action: PayloadAction<{ tableId: string; record: CloudRecord }>) {
      const { tableId, record } = action.payload;
      if (state.tables[tableId]) {
        state.tables[tableId].records.unshift(record);
        state.tables[tableId].total += 1;
      }
    },

    updateRecord(
      state,
      action: PayloadAction<{ tableId: string; recordId: string; changes: Record<string, unknown> }>,
    ) {
      const { tableId, recordId, changes } = action.payload;
      if (state.tables[tableId]) {
        const index = state.tables[tableId].records.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          state.tables[tableId].records[index] = {
            ...state.tables[tableId].records[index],
            ...changes,
          };
        }
      }
    },

    removeRecord(state, action: PayloadAction<{ tableId: string; recordId: string }>) {
      const { tableId, recordId } = action.payload;
      if (state.tables[tableId]) {
        state.tables[tableId].records = state.tables[tableId].records.filter(
          (r) => r.id !== recordId,
        );
        state.tables[tableId].total -= 1;
      }
    },

    // Clear table records
    clearTableRecords(state, action: PayloadAction<string>) {
      delete state.tables[action.payload];
    },
  },
});

export const {
  setLoading,
  setError,
  setTableLoading,
  setTableRecords,
  addRecord,
  updateRecord,
  removeRecord,
  clearTableRecords,
} = tablesSlice.actions;

export default tablesSlice.reducer;

