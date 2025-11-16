/**
 * Bases (cloud instances) slice
 * Single Responsibility: Manages cloud instance state only
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudInstance } from '../../../../types/database';

interface BasesSliceState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  bases: Record<string, CloudInstance>;
}

const initialState: BasesSliceState = {
  isLoading: false,
  error: null,
  initialized: false,
  bases: {},
};

const basesSlice = createSlice({
  name: 'bases/bases',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.initialized = true;
    },
    addBase(state, action: PayloadAction<CloudInstance>) {
      const base = action.payload;
      state.bases[base.id] = base;
    },
    updateBase(state, action: PayloadAction<{ id: string; [key: string]: unknown }>) {
      const { id, ...changes } = action.payload;
      state.bases[id] = { ...(state.bases[id] ?? {}), ...changes } as CloudInstance;
    },
    deleteBase(state, action: PayloadAction<string>) {
      delete state.bases[action.payload];
    },
  },
});

export const { setLoading, setError, stopLoading, addBase, updateBase, deleteBase } =
  basesSlice.actions;

export default basesSlice.reducer;

