/**
 * Records slice
 * Single Responsibility: Manages table records and their state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BaseRecord } from '../../../../types/database';
import type { RecordsData, RecordsState } from '../types';
import { deduplicateRecords } from '../utils';

interface RecordsSliceState {
  records: RecordsData;
  recordsState: RecordsState;
}

const initialState: RecordsSliceState = {
  records: {},
  recordsState: {},
};

const recordsSlice = createSlice({
  name: 'bases/records',
  initialState,
  reducers: {
    setTableRecordsLoading(state, action: PayloadAction<{ tableId: string; loading: boolean }>) {
      const { tableId, loading } = action.payload;
      if (!state.recordsState[tableId]) {
        state.recordsState[tableId] = {};
      }
      state.recordsState[tableId].loading = loading;
      state.recordsState[tableId].isFullyLoaded =
        !loading && !state.recordsState[tableId].next_page_token;
    },
    setTableRecords(
      state,
      action: PayloadAction<{
        tableId: string;
        records: BaseRecord[];
        total: number;
        next_page_token?: number | null;
        isPagination?: boolean;
      }>,
    ) {
      const { tableId, records, total, next_page_token, isPagination } = action.payload;

      if (!state.records[tableId] || !isPagination) {
        state.records[tableId] = {
          items: deduplicateRecords(records.filter((record) => record !== undefined)),
          total,
        };
      } else {
        const combinedRecords = [...state.records[tableId].items, ...records];
        state.records[tableId] = {
          items: deduplicateRecords(combinedRecords),
          total,
        };
      }

      state.recordsState[tableId] = {
        ...state.recordsState[tableId],
        loading: false,
        lastFetched: Date.now(),
        next_page_token,
        isFullyLoaded: !next_page_token,
      };
    },
    addTableRecord(
      state,
      action: PayloadAction<{ tableId: string; record: BaseRecord; insertAtBeginning?: boolean }>,
    ) {
      const { tableId, record, insertAtBeginning = false } = action.payload;

      if (!state.records[tableId]) {
        state.records[tableId] = { items: [], total: 0 };
      }

      const existingIndex = state.records[tableId].items.findIndex(
        (existingRecord) => existingRecord.id === record.id,
      );

      if (existingIndex !== -1) {
        state.records[tableId].items[existingIndex] = record;
      } else {
        if (insertAtBeginning) {
          state.records[tableId].items.unshift(record);
        } else {
          state.records[tableId].items.push(record);
        }
        state.records[tableId].total += 1;
      }
    },
    updateTableRecord(
      state,
      action: PayloadAction<{ tableId: string; recordId: string; changes: Record<string, unknown> }>,
    ) {
      const { tableId, recordId, changes } = action.payload;

      if (state.records[tableId]) {
        const recordIndex = state.records[tableId].items.findIndex((r) => r.id === recordId);
        if (recordIndex !== -1) {
          state.records[tableId].items[recordIndex] = {
            ...state.records[tableId].items[recordIndex],
            ...changes,
          };
        }
      }
    },
    deleteTableRecord(state, action: PayloadAction<{ tableId: string; recordId: string }>) {
      const { tableId, recordId } = action.payload;

      if (state.records[tableId]) {
        const initialLength = state.records[tableId].items.length;
        state.records[tableId].items = state.records[tableId].items.filter((record) => record.id !== recordId);
        const finalLength = state.records[tableId].items.length;

        if (finalLength < initialLength) {
          state.records[tableId].total -= 1;
        }
      }
    },
    setTableRecordsState(state, action: PayloadAction<{ tableId: string; [key: string]: unknown }>) {
      const { tableId, ...updates } = action.payload;
      if (!state.recordsState[tableId]) {
        state.recordsState[tableId] = {};
      }
      Object.assign(state.recordsState[tableId], updates);
    },
    clearTableRecords(state, action: PayloadAction<{ tableId: string }>) {
      const { tableId } = action.payload;
      delete state.records[tableId];
    },
  },
});

export const {
  setTableRecordsLoading,
  setTableRecords,
  addTableRecord,
  updateTableRecord,
  deleteTableRecord,
  setTableRecordsState,
  clearTableRecords,
} = recordsSlice.actions;

export default recordsSlice.reducer;

