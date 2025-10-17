import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const initialState = {
  // Template versions cache by ID
  byId: {},
  // Loading states by ID
  loading: {},
  // Error states by ID
  errors: {},
};

const slice = createSlice({
  name: 'templateVersions',
  initialState,
  reducers: {
    // Loading states
    startLoading(state, action) {
      const { id } = action.payload;
      state.loading[id] = true;
    },

    stopLoading(state, action) {
      const { id } = action.payload;
      state.loading[id] = false;
    },

    // Set template version data
    setTemplateVersion(state, action) {
      const { id, data } = action.payload;
      state.byId[id] = {
        data,
        lastFetch: Date.now(),
      };
      state.loading[id] = false;
      delete state.errors[id];
    },

    // Set error
    setError(state, action) {
      const { id, error } = action.payload;
      state.errors[id] = error;
      state.loading[id] = false;
    },

    // Clear error
    clearError(state, action) {
      const { id } = action.payload;
      delete state.errors[id];
    },

    // Invalidate specific version
    invalidateVersion(state, action) {
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

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  stopLoading,
  setTemplateVersion,
  setError,
  clearError,
  invalidateVersion,
  clearCache,
} = slice.actions;

// Helper function to check if data is fresh
const isDataFresh = (versionData) => {
  if (!versionData || !versionData.lastFetch) {
    return false;
  }
  return (Date.now() - versionData.lastFetch) < CACHE_TTL;
};

// Thunk actions
export const fetchTemplateVersion = (id, options = {}) => async (dispatch, getState) => {
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
    const response = await optimai.get(`/templates/versions/${id}`);
    const data = response.data.template_version;
    
    dispatch(setTemplateVersion({ id, data }));
    
    return Promise.resolve(data);
  } catch (error) {
    console.error('Error fetching template version:', error);
    dispatch(setError({ id, error: 'Failed to load template version' }));
    throw error;
  }
};

// Selectors
const selectTemplateVersionsState = (state) => state.templateVersions;

export const selectTemplateVersion = (id) => (state) => {
  const versionData = state.templateVersions.byId[id];
  return versionData?.data || null;
};

export const selectTemplateVersionLoading = (id) => (state) => {
  return state.templateVersions.loading[id] || false;
};

export const selectTemplateVersionError = (id) => (state) => {
  return state.templateVersions.errors[id] || null;
};

export const selectTemplateVersionFresh = (id) => (state) => {
  const versionData = state.templateVersions.byId[id];
  return isDataFresh(versionData);
};

// Composite selector for component convenience
export const selectTemplateVersionState = (id) => createSelector(
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
  }),
);

