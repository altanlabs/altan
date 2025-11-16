/**
 * UI Slice
 * Manages UI-related state (drawers, loading states, upload progress, etc.)
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { InitializedState, LoadingState, SetLoadingPayload, SetInitializedPayload } from '../types/state';

interface UIState {
  drawerOpen: boolean;
  isRealtimeCall: boolean;
  contextMenu: unknown;
  uploadProgress: unknown;
  isUploading: boolean;
  initialized: InitializedState;
  loading: LoadingState;
}

const initialState: UIState = {
  drawerOpen: false,
  isRealtimeCall: false,
  contextMenu: null,
  uploadProgress: null,
  isUploading: false,
  initialized: {
    room: false,
    mainThread: false,
    allThreads: false,
    userRooms: false,
  },
  loading: {
    room: false,
    mainThread: false,
    allThreads: false,
    userRooms: false,
  },
};

const uiSlice = createSlice({
  name: 'room/ui',
  initialState,
  reducers: {
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },

    setContextMenu: (state, action: PayloadAction<unknown>) => {
      state.contextMenu = action.payload;
    },

    startRealtime: (state) => {
      state.isRealtimeCall = true;
    },

    stopRealtime: (state) => {
      state.isRealtimeCall = false;
    },

    updateMediaProgress: (state, action: PayloadAction<unknown>) => {
      state.uploadProgress = action.payload;
    },

    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },

    setInitialized: (state, action: PayloadAction<SetInitializedPayload>) => {
      const { key, value } = action.payload;
      state.initialized[key] = value;
    },

    setLoading: (state, action: PayloadAction<SetLoadingPayload>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    clearUIState: (state) => {
      // Reset UI state but preserve userRooms initialization to match room slice behavior
      state.drawerOpen = initialState.drawerOpen;
      state.isRealtimeCall = initialState.isRealtimeCall;
      state.contextMenu = initialState.contextMenu;
      state.uploadProgress = initialState.uploadProgress;
      state.isUploading = initialState.isUploading;
      // Reset initialized and loading except for userRooms
      const preservedUserRoomsInitialized = state.initialized.userRooms;
      const preservedUserRoomsLoading = state.loading.userRooms;
      state.initialized = { ...initialState.initialized };
      state.loading = { ...initialState.loading };
      state.initialized.userRooms = preservedUserRoomsInitialized;
      state.loading.userRooms = preservedUserRoomsLoading;
    },
  },
  extraReducers: (builder) => {
    // Listen to clearRoomState action from room slice to clear UI state
    builder.addCase('room/core/clearRoomState', (state) => {
      // Reset UI state but preserve userRooms initialization
      const preservedUserRoomsInitialized = state.initialized.userRooms;
      const preservedUserRoomsLoading = state.loading.userRooms;
      state.drawerOpen = initialState.drawerOpen;
      state.isRealtimeCall = initialState.isRealtimeCall;
      state.contextMenu = initialState.contextMenu;
      state.uploadProgress = initialState.uploadProgress;
      state.isUploading = initialState.isUploading;
      state.initialized = { ...initialState.initialized };
      state.loading = { ...initialState.loading };
      state.initialized.userRooms = preservedUserRoomsInitialized;
      state.loading.userRooms = preservedUserRoomsLoading;
    });
  },
});

export const {
  setDrawerOpen,
  setContextMenu,
  startRealtime,
  stopRealtime,
  updateMediaProgress,
  setIsUploading,
  setInitialized,
  setLoading,
  clearUIState,
} = uiSlice.actions;

export default uiSlice.reducer;

