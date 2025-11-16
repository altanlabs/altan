/**
 * Navigation selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { SearchResult } from '../types';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Selects the entire cloud state
 */
export const selectNavigationState = (state: RootState) => state.cloud;

/**
 * Selects the quick filter value
 */
export const selectQuickFilter = createSelector(
  [selectNavigationState],
  (cloudState) => cloudState?.quickFilter || '',
);

/**
 * Selects the searching state
 */
export const selectIsSearching = createSelector(
  [selectNavigationState],
  (cloudState) => cloudState?.isSearching || false,
);

/**
 * Selects all search results
 */
export const selectAllSearchResults = createSelector(
  [selectNavigationState],
  (cloudState) => cloudState?.searchResults || {},
);

// ============================================================================
// PARAMETERIZED SELECTORS
// ============================================================================

/**
 * Selects search results for a specific table
 */
export const selectSearchResults = createSelector(
  [selectAllSearchResults, (_: RootState, tableId: string) => tableId],
  (searchResults, tableId): SearchResult | null => searchResults[tableId] || null,
);

/**
 * Selects whether a table has active search results
 */
export const selectHasSearchResults = createSelector(
  [selectSearchResults],
  (searchResult) => searchResult !== null && searchResult.results.length > 0,
);

/**
 * Selects the search query for a specific table
 */
export const selectSearchQuery = createSelector(
  [selectSearchResults],
  (searchResult) => searchResult?.query || '',
);

