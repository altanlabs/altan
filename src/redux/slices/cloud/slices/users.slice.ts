/**
 * Users slice - manages user cache
 * Following Single Responsibility Principle: Only handles user caching
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudUser } from '../../../../services';
import type { UsersState } from '../types';
import { createInitialCacheState } from '../utils';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UsersState = {
  userCache: {},
  cacheState: createInitialCacheState(),
};

// ============================================================================
// SLICE
// ============================================================================

const usersSlice = createSlice({
  name: 'cloud/users',
  initialState,
  reducers: {
    // Cache state management
    setCacheLoading(state, action: PayloadAction<boolean>) {
      state.cacheState.loading = action.payload;
      if (action.payload) {
        state.cacheState.error = null;
      }
    },
    setCacheError(state, action: PayloadAction<string | null>) {
      state.cacheState.error = action.payload;
      state.cacheState.loading = false;
    },

    // User operations
    setUsers(state, action: PayloadAction<{ cloudId: string; users: CloudUser[] }>) {
      const { cloudId, users } = action.payload;
      if (!state.userCache[cloudId]) {
        state.userCache[cloudId] = {};
      }
      users.forEach((user) => {
        if (user?.id) {
          state.userCache[cloudId][user.id] = user;
        }
      });
      state.cacheState.lastFetched = Date.now();
      state.cacheState.error = null;
    },

    addUser(state, action: PayloadAction<{ cloudId: string; user: CloudUser }>) {
      const { cloudId, user } = action.payload;
      if (!state.userCache[cloudId]) {
        state.userCache[cloudId] = {};
      }
      if (user?.id) {
        state.userCache[cloudId][user.id] = user;
      }
    },

    updateUser(
      state,
      action: PayloadAction<{ cloudId: string; userId: string; changes: Partial<CloudUser> }>,
    ) {
      const { cloudId, userId, changes } = action.payload;
      if (state.userCache[cloudId]?.[userId]) {
        state.userCache[cloudId][userId] = {
          ...state.userCache[cloudId][userId],
          ...changes,
        };
      }
    },

    removeUser(state, action: PayloadAction<{ cloudId: string; userId: string }>) {
      const { cloudId, userId } = action.payload;
      if (state.userCache[cloudId]) {
        delete state.userCache[cloudId][userId];
      }
    },

    // Clear cache
    clearUserCache(state, action: PayloadAction<string | undefined>) {
      const cloudId = action.payload;
      if (cloudId) {
        delete state.userCache[cloudId];
      } else {
        state.userCache = {};
        state.cacheState = createInitialCacheState();
      }
    },
  },
});

export const {
  setCacheLoading,
  setCacheError,
  setUsers,
  addUser,
  updateUser,
  removeUser,
  clearUserCache,
} = usersSlice.actions;

export default usersSlice.reducer;

