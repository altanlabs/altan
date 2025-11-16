import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getTemplateService } from '../../services/TemplateService';
import type { TemplateVersion } from '../../services/types';
import type { RootState } from '../store';
import type { AppDispatch } from '../store';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface TemplateVersionData {
  data: TemplateVersion & Record<string, unknown>;
  lastFetch: number;
}

interface TemplateVersionsState {
  // Template versions cache by ID
  byId: Record<string, TemplateVersionData>;
  // Loading states by ID
  loading: Record<string, boolean>;
  // Error states by ID
  errors: Record<string, string>;
}

interface StartLoadingPayload {
  id: string;
}

interface StopLoadingPayload {
  id: string;
}

interface SetTemplateVersionPayload {
  id: string;
  data: TemplateVersion & Record<string, unknown>;
}

interface SetErrorPayload {
  id: string;
  error: string;
}

interface ClearErrorPayload {
  id: string;
}

interface InvalidateVersionPayload {
  id: string;
}

interface FetchTemplateVersionOptions {
  forceRefresh?: boolean;
}

// ----------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------

const initialState: TemplateVersionsState = {
  byId: {},
  loading: {},
  errors: {},
};

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------

const slice = createSlice({
  name: 'templateVersions',
  initialState,
  reducers: {
    // Loading states
    startLoading(state, action: PayloadAction<StartLoadingPayload>) {
      const { id } = action.payload;
      state.loading[id] = true;
    },

    stopLoading(state, action: PayloadAction<StopLoadingPayload>) {
      const { id } = action.payload;
      state.loading[id] = false;
    },

    // Set template version data
    setTemplateVersion(state, action: PayloadAction<SetTemplateVersionPayload>) {
      const { id, data } = action.payload;
      state.byId[id] = {
        data,
        lastFetch: Date.now(),
      };
      state.loading[id] = false;
      delete state.errors[id];
    },

    // Set error
    setError(state, action: PayloadAction<SetErrorPayload>) {
      const { id, error } = action.payload;
      state.errors[id] = error;
      state.loading[id] = false;
    },

    // Clear error
    clearError(state, action: PayloadAction<ClearErrorPayload>) {
      const { id } = action.payload;
      delete state.errors[id];
    },

    // Invalidate specific version
    invalidateVersion(state, action: PayloadAction<InvalidateVersionPayload>) {
      const { id } = action.payload;
      delete state.byId[id];
      delete state.errors[id];
      delete state.loading[id];
    },

    // Clear all cache
    clearCache(state) {
      Object.assign(state, initialState);
    },
  },
});

// ----------------------------------------------------------------------
// Reducer
// ----------------------------------------------------------------------

export default slice.reducer;

// ----------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------

export const {
  startLoading,
  stopLoading,
  setTemplateVersion,
  setError,
  clearError,
  invalidateVersion,
  clearCache,
} = slice.actions;

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Check if data is fresh
 */
const isDataFresh = (versionData?: TemplateVersionData): boolean => {
  if (!versionData || !versionData.lastFetch) {
    return false;
  }
  return Date.now() - versionData.lastFetch < CACHE_TTL;
};

// ----------------------------------------------------------------------
// Thunk Actions
// ----------------------------------------------------------------------

/**
 * Fetch template version by ID
 */
export const fetchTemplateVersion =
  (id: string, options: FetchTemplateVersionOptions = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { forceRefresh = false } = options;

    if (!id) {
      return Promise.resolve(null);
    }

    const state = getState();
    const versionData = state.templateVersions.byId[id];

    // Check if we should skip the fetch
    if (!forceRefresh && isDataFresh(versionData)) {
      return Promise.resolve(versionData.data);
    }

    // Check if already loading
    if (state.templateVersions.loading[id]) {
      return Promise.resolve(null);
    }

    dispatch(startLoading({ id }));

    try {
      const templateService = getTemplateService();
      const data = await templateService.fetchTemplateVersion(id);

      dispatch(setTemplateVersion({ id, data }));

      return Promise.resolve(data);
    } catch (error) {
      console.error('Error fetching template version:', error);
      dispatch(setError({ id, error: 'Failed to load template version' }));
      throw error;
    }
  };

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

const selectTemplateVersionsState = (state: RootState) => state.templateVersions;

export const selectTemplateVersion = (id: string) => (state: RootState) => {
  const versionData = state.templateVersions.byId[id];
  return versionData?.data || null;
};

export const selectTemplateVersionLoading = (id: string) => (state: RootState) => {
  return state.templateVersions.loading[id] || false;
};

export const selectTemplateVersionError = (id: string) => (state: RootState) => {
  return state.templateVersions.errors[id] || null;
};

export const selectTemplateVersionFresh = (id: string) => (state: RootState) => {
  const versionData = state.templateVersions.byId[id];
  return isDataFresh(versionData);
};

// Composite selector for component convenience
export const selectTemplateVersionState = (id: string) =>
  createSelector(
    [
      selectTemplateVersion(id),
      selectTemplateVersionLoading(id),
      selectTemplateVersionError(id),
      selectTemplateVersionFresh(id),
    ],
    (data, loading, error, isFresh) => ({
      data,
      loading,
      error,
      isFresh,
    })
  );

