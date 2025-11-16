/**
 * Real-time updates slice
 * Single Responsibility: Manages real-time record updates
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BaseRecord } from '../../../../types/database';
import type { RecordsData, RecordsState } from '../types';

interface RealtimeSliceState {
  records: RecordsData;
  recordsState: RecordsState;
}

const initialState: RealtimeSliceState = {
  records: {},
  recordsState: {},
};

const realtimeSlice = createSlice({
  name: 'bases/realtime',
  initialState,
  reducers: {
    integrateRealTimeUpdates(
      state,
      action: PayloadAction<{
        tableId: string;
        updates?: BaseRecord[];
        additions?: BaseRecord[];
        deletions?: string[];
      }>,
    ) {
      const { tableId, updates, additions, deletions } = action.payload;

      if (!state.records[tableId]) {
        state.records[tableId] = { items: [], total: 0 };
      }

      const tableRecords = state.records[tableId];
      const recordsState = state.recordsState[tableId];
      const pageSize = recordsState?.pageSize || 50;
      const currentPage = recordsState?.currentPage || 0;
      let totalChanged = 0;

      if (deletions && deletions.length > 0) {
        const initialLength = tableRecords.items.length;
        tableRecords.items = tableRecords.items.filter((record) => !deletions.includes(String(record.id)));
        const deletedCount = initialLength - tableRecords.items.length;
        totalChanged -= deletedCount;
      }

      if (updates && updates.length > 0) {
        updates.forEach((update) => {
          const index = tableRecords.items.findIndex((r) => r.id === update.id);
          if (index !== -1) {
            tableRecords.items[index] = { ...tableRecords.items[index], ...update };
          }
        });
      }

      if (additions && additions.length > 0) {
        additions.forEach((addition) => {
          const existingIndex = tableRecords.items.findIndex((r) => r.id === addition.id);
          if (existingIndex === -1) {
            if (currentPage === 0) {
              tableRecords.items.unshift(addition);

              if (tableRecords.items.length > pageSize) {
                tableRecords.items = tableRecords.items.slice(0, pageSize);
              }
            }
            totalChanged += 1;
          }
        });
      }

      tableRecords.total = Math.max(tableRecords.total + totalChanged, 0);

      if (recordsState) {
        recordsState.hasRealTimeUpdates = true;
        recordsState.lastRealTimeUpdate = Date.now();

        if (recordsState.totalRecords !== undefined) {
          recordsState.totalRecords = Math.max(recordsState.totalRecords + totalChanged, 0);
          recordsState.totalPages = Math.ceil(Math.max(recordsState.totalRecords, 1) / pageSize);

          if (currentPage > 0 && additions && additions.length > 0) {
            recordsState.hasNewRecordsOnPreviousPages = true;
          }
        }
      }
    },
    clearRealTimeUpdateFlags(state, action: PayloadAction<{ tableId: string }>) {
      const { tableId } = action.payload;
      if (state.recordsState[tableId]) {
        state.recordsState[tableId].hasRealTimeUpdates = false;
        state.recordsState[tableId].hasNewRecordsOnPreviousPages = false;
      }
    },
  },
});

export const { integrateRealTimeUpdates, clearRealTimeUpdateFlags } = realtimeSlice.actions;

export default realtimeSlice.reducer;

