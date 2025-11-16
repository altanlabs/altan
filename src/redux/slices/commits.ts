import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk, RootState } from '../store';
import { getCommitService } from '../../services';
import type { Commit, CommitDetails, CommitsState } from '../../services/types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: CommitsState = {
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
    setCommitLoading(state, action: PayloadAction<{ hash: string; loading: boolean }>) {
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
    setCommitDetails(state, action: PayloadAction<{ hash: string; data: Commit }>) {
      const { hash, data } = action.payload;
      state.commits[hash] = {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    },
    setCommitError(state, action: PayloadAction<{ hash: string; error: string }>) {
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
    clearCommitDetails(state, action: PayloadAction<{ hash?: string }>) {
      const { hash } = action.payload;
      if (hash) {
        delete state.commits[hash];
      } else {
        state.commits = {};
      }
    },

    // Restore reducers
    setRestoring(state, action: PayloadAction<{ hash: string; restoring: boolean }>) {
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
  (hash: string, interfaceId: string | null = null, forceRefresh = false): AppThunk<Promise<Commit | null>> =>
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

    if (!currentInterfaceId) {
      const errorMessage = 'No interface ID available';
      dispatch(setCommitError({ hash, error: errorMessage }));
      throw new Error(errorMessage);
    }

    dispatch(setCommitLoading({ hash, loading: true }));
    try {
      const commitService = getCommitService();
      const data = await commitService.fetchCommitDetails(currentInterfaceId, hash);
      dispatch(setCommitDetails({ hash, data }));
      return data;
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.detail || 
        (error as Error)?.message || 
        'Failed to fetch commit details';
      dispatch(setCommitError({ hash, error: errorMessage }));
      throw error;
    }
  };

/**
 * Restore to a specific commit
 */
export const restoreCommit =
  (hash: string, interfaceId: string | null = null): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();

    // Get interfaceId from state if not provided
    const currentInterfaceId = interfaceId || state.general?.account?.interfaces?.[0]?.id;

    if (!currentInterfaceId) {
      const errorMessage = 'No interface ID available';
      throw new Error(errorMessage);
    }

    dispatch(setRestoring({ hash, restoring: true }));
    try {
      const commitService = getCommitService();
      await commitService.restoreCommit(currentInterfaceId, hash);
      return Promise.resolve();
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.detail || 
        (error as Error)?.message || 
        'Failed to restore commit';
      throw new Error(errorMessage);
    } finally {
      dispatch(setRestoring({ hash, restoring: false }));
    }
  };

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCommitsState = (state: RootState): CommitsState => state.commits;

export const selectCommitDetails = createSelector(
  [selectCommitsState, (_: RootState, hash: string) => hash],
  (commitsState: CommitsState, hash: string): CommitDetails =>
    commitsState.commits[hash] || {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
);

export const selectIsRestoring = createSelector(
  [selectCommitsState, (_: RootState, hash: string) => hash],
  (commitsState: CommitsState, hash: string): boolean => commitsState.restoring[hash] || false,
);

