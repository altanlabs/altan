import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai_pods } from '../../utils/axios';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Commit details per hash
  commits: {
    // [hash]: {
    //   data: null,
    //   loading: false,
    //   error: null,
    //   lastFetched: null
    // }
  },
  // Restore operations
  restoring: {
    // [hash]: boolean
  },
};

// ============================================================================
// SLICE
// ============================================================================

const slice = createSlice({
  name: 'commits',
  initialState,
  reducers: {
    // Commit details reducers
    setCommitLoading(state, action) {
      const { hash, loading } = action.payload;
      if (!state.commits[hash]) {
        state.commits[hash] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.commits[hash].loading = loading;
    },
    setCommitDetails(state, action) {
      const { hash, data } = action.payload;
      state.commits[hash] = {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    },
    setCommitError(state, action) {
      const { hash, error } = action.payload;
      if (!state.commits[hash]) {
        state.commits[hash] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.commits[hash].error = error;
      state.commits[hash].loading = false;
    },
    clearCommitDetails(state, action) {
      const { hash } = action.payload;
      if (hash) {
        delete state.commits[hash];
      } else {
        state.commits = {};
      }
    },

    // Restore reducers
    setRestoring(state, action) {
      const { hash, restoring } = action.payload;
      state.restoring[hash] = restoring;
    },
  },
});

export default slice.reducer;

// Export actions
export const {
  setCommitLoading,
  setCommitDetails,
  setCommitError,
  clearCommitDetails,
  setRestoring,
} = slice.actions;

// ============================================================================
// THUNKS
// ============================================================================

/**
 * Fetch commit details by hash
 * Uses cache if available and not expired (5 minutes)
 */
export const fetchCommitDetails =
  (hash, interfaceId = null, forceRefresh = false) =>
  async (dispatch, getState) => {
    const state = getState();
    const existingCommit = state.commits.commits[hash];

    // Use cache if available and not expired (5 minutes) and not forcing refresh
    if (!forceRefresh && existingCommit?.data && existingCommit.lastFetched) {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - existingCommit.lastFetched < fiveMinutes) {
        return existingCommit.data;
      }
    }

    // Don't fetch if already loading
    if (existingCommit?.loading) {
      return existingCommit.data;
    }

    // Get interfaceId from state if not provided
    const currentInterfaceId = interfaceId || state.general?.account?.interfaces?.[0]?.id;

    dispatch(setCommitLoading({ hash, loading: true }));
    try {
      const response = await optimai_pods.get(`/interfaces/dev/${currentInterfaceId}/repo/commits/${hash}`);
      const data = response.data;
      dispatch(setCommitDetails({ hash, data }));
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to fetch commit details';
      dispatch(setCommitError({ hash, error: errorMessage }));
      throw error;
    }
  };

/**
 * Restore to a specific commit
 */
export const restoreCommit = (hash, interfaceId = null) => async (dispatch, getState) => {
  const state = getState();
  
  // Get interfaceId from state if not provided
  const currentInterfaceId = interfaceId || state.general?.account?.interfaces?.[0]?.id;

  dispatch(setRestoring({ hash, restoring: true }));
  try {
    await optimai_pods.post(`/interfaces/dev/${currentInterfaceId}/repo/commits/${hash}/restore`);
    return Promise.resolve();
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to restore commit';
    throw new Error(errorMessage);
  } finally {
    dispatch(setRestoring({ hash, restoring: false }));
  }
};

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCommitsState = (state) => state.commits;

export const selectCommitDetails = createSelector(
  [selectCommitsState, (_, hash) => hash],
  (commitsState, hash) =>
    commitsState.commits[hash] || {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
);

export const selectIsRestoring = createSelector(
  [selectCommitsState, (_, hash) => hash],
  (commitsState, hash) => commitsState.restoring[hash] || false,
);
