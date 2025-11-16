/**
 * Users cache slice
 * Single Responsibility: Manages user cache for bases
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BaseUser } from '../../../../types/database';
import { createInitialCacheState, type CacheState } from '../utils';

interface UsersSliceState {
  userCache: Record<string, Record<string, BaseUser>>;
  userCacheState: CacheState;
}

const initialState: UsersSliceState = {
  userCache: {},
  userCacheState: createInitialCacheState(),
};

const usersSlice = createSlice({
  name: 'bases/users',
  initialState,
  reducers: {
    setUserCacheLoading(state, action: PayloadAction<boolean>) {
      state.userCacheState.loading = action.payload;
      if (action.payload) {
        state.userCacheState.error = null;
      }
    },
    setUserCache(state, action: PayloadAction<{ users: BaseUser[]; baseId: string }>) {
      const { users, baseId } = action.payload;

      if (!state.userCache[baseId]) {
        state.userCache[baseId] = {};
      }

      users.forEach((user) => {
        if (user && user.id) {
          state.userCache[baseId][user.id] = user;
        }
      });

      state.userCacheState.loading = false;
      state.userCacheState.lastFetched = Date.now();
      state.userCacheState.error = null;
    },
    setUserCacheError(state, action: PayloadAction<string>) {
      state.userCacheState.loading = false;
      state.userCacheState.error = action.payload;
    },
    clearUserCache(state, action: PayloadAction<{ baseId?: string } | undefined>) {
      const baseId = action.payload?.baseId;
      if (baseId) {
        delete state.userCache[baseId];
      } else {
        state.userCache = {};
      }
      state.userCacheState = createInitialCacheState();
    },
  },
});

export const { setUserCacheLoading, setUserCache, setUserCacheError, clearUserCache } =
  usersSlice.actions;

export default usersSlice.reducer;

