/**
 * Records selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

export const selectRecords = (state: RootState) => state.bases.records;
export const selectRecordsState = (state: RootState) => state.bases.recordsState;

export const selectTableRecords = createSelector(
  [(state: RootState) => state.bases.records, (_: RootState, tableId: string) => tableId],
  (records, tableId) => records[tableId]?.items || [],
);

export const selectTableRecordsTotal = createSelector(
  [(state: RootState) => state.bases.records, (_: RootState, tableId: string) => tableId],
  (records, tableId) => records[tableId]?.total || 0,
);

export const selectTableRecordsState = createSelector(
  [(state: RootState) => state.bases, (_: RootState, tableId: string) => tableId],
  (state, tableId) => state.recordsState[tableId],
);

export const selectIsTableRecordsLoading = createSelector(
  [selectTableRecordsState],
  (recordsState) => recordsState?.loading ?? false,
);

export const selectTableRecordById = createSelector(
  [selectTableRecords, (_: RootState, __: string, recordId: string) => recordId],
  (records, recordId) => records.find((record) => record.id === recordId),
);

export const selectTablePaginationInfo = createSelector(
  [selectTableRecordsState],
  (recordsState) => {
    if (!recordsState) return null;

    return {
      currentPage: recordsState.currentPage || 0,
      totalPages: recordsState.totalPages || 1,
      pageSize: recordsState.pageSize || 50,
      totalRecords: recordsState.totalRecords || 0,
      isLastPageFound: true,
      hasNewRecordsOnPreviousPages: recordsState.hasNewRecordsOnPreviousPages || false,
    };
  },
);

export const selectTableTotalRecords = createSelector(
  [selectTableRecordsState],
  (recordsState) => recordsState?.totalRecords || 0,
);

