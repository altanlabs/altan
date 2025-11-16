/**
 * Navigation slice - manages database navigation UI state
 * Following Single Responsibility Principle: Only handles UI navigation state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudRecord } from '../../../../services';
import type { NavigationState, SearchResult } from '../types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: NavigationState = {
  quickFilter: '',
  isSearching: false,
  searchResults: {},
};

// ============================================================================
// SLICE
// ============================================================================

const navigationSlice = createSlice({
  name: 'cloud/navigation',
  initialState,
  reducers: {
    // Quick filter
    setQuickFilter(state, action: PayloadAction<string>) {
      state.quickFilter = action.payload;
    },

    // Search state
    setSearching(state, action: PayloadAction<boolean>) {
      state.isSearching = action.payload;
    },

    // Search results
    setSearchResults(
      state,
      action: PayloadAction<{
        tableId: string;
        results: CloudRecord[];
        query: string;
        totalSearchResults: number;
        newRecordsFound: number;
      }>,
    ) {
      const { tableId, results, query, totalSearchResults, newRecordsFound } = action.payload;
      state.searchResults[tableId] = {
        results,
        query,
        totalSearchResults,
        newRecordsFound,
        timestamp: Date.now(),
      };
    },

    clearSearchResults(state, action: PayloadAction<{ tableId?: string } | undefined>) {
      const tableId = action.payload?.tableId;
      if (tableId) {
        delete state.searchResults[tableId];
      } else {
        state.searchResults = {};
      }
    },

    // Clear all navigation state
    resetNavigation(state) {
      state.quickFilter = '';
      state.isSearching = false;
      state.searchResults = {};
    },
  },
});

export const {
  setQuickFilter,
  setSearching,
  setSearchResults,
  clearSearchResults,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;

