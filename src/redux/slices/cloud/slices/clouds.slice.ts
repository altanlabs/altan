/**
 * Cloud instances slice - manages cloud instance state
 * Following Single Responsibility Principle: Only handles cloud instance CRUD
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudInstance } from '../../../../services';
import type { CloudsState } from '../types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: CloudsState = {
  clouds: {},
  isLoading: false,
  error: null,
  failedCloudIds: {},
};

// ============================================================================
// SLICE
// ============================================================================

const cloudsSlice = createSlice({
  name: 'cloud/clouds',
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

    // CRUD operations
    setCloud(state, action: PayloadAction<CloudInstance>) {
      const cloud = action.payload;
      const cloudId = cloud.cloud_id || cloud.id;
      state.clouds[cloudId] = { ...cloud, id: cloudId };
    },
    updateCloud(state, action: PayloadAction<{ id: string; [key: string]: unknown }>) {
      const { id, ...changes } = action.payload;
      if (state.clouds[id]) {
        state.clouds[id] = { ...state.clouds[id], ...changes };
      }
    },
    removeCloud(state, action: PayloadAction<string>) {
      delete state.clouds[action.payload];
    },

    // Batch operations
    setClouds(state, action: PayloadAction<CloudInstance[]>) {
      state.clouds = {};
      action.payload.forEach((cloud) => {
        const cloudId = cloud.cloud_id || cloud.id;
        state.clouds[cloudId] = { ...cloud, id: cloudId };
      });
    },

    // Failed cloud tracking
    setCloudFetchFailed(state, action: PayloadAction<{ cloudId: string; error: string }>) {
      state.failedCloudIds[action.payload.cloudId] = action.payload.error;
    },
    clearCloudFetchFailed(state, action: PayloadAction<string>) {
      delete state.failedCloudIds[action.payload];
    },
  },
});

export const {
  setLoading,
  setError,
  setCloud,
  updateCloud,
  removeCloud,
  setClouds,
  setCloudFetchFailed,
  clearCloudFetchFailed,
} = cloudsSlice.actions;

export default cloudsSlice.reducer;

