/**
 * UI Selectors
 * Selectors for UI state (drawers, loading, upload, realtime)
 */
import { createSelector } from '@reduxjs/toolkit';

import type { RootState, LoadingState, InitializedState } from '../types/state';


type UIState = RootState['room']['_ui'];

export const selectUIState = (state: RootState): UIState => state.room._ui;

export const selectDrawerOpen = (state: RootState): boolean => state.room._ui.drawerOpen;

export const selectRealtime = (state: RootState): boolean | undefined =>
  state.room._ui?.isRealtimeCall;

export const selectContextMenu = (state: RootState): unknown => state.room._ui.contextMenu;

// UI Loading selectors
export const selectUILoading = (attribute: keyof LoadingState): ReturnType<typeof createSelector> =>
  createSelector([selectUIState], (uiState): boolean => uiState.loading?.[attribute] ?? false);

// UI Initialized selectors
export const selectUIInitialized = (attribute: keyof InitializedState): ReturnType<typeof createSelector> =>
  createSelector(
    [selectUIState],
    (uiState): boolean => uiState.initialized?.[attribute] ?? false,
  );

