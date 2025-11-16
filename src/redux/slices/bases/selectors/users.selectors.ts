/**
 * Users cache selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

export const selectUserCache = createSelector(
  [(state: RootState) => state.bases],
  (state) => state.userCache,
);

export const selectUserCacheState = createSelector(
  [(state: RootState) => state.bases],
  (state) => state.userCacheState,
);

export const selectUserCacheForBase = createSelector(
  [selectUserCache, (_: RootState, baseId: string) => baseId],
  (userCache, baseId) => userCache[baseId] || {},
);

export const selectUserById = createSelector(
  [selectUserCacheForBase, (_: RootState, __: string, userId: string) => userId],
  (users, userId) => users[userId] || null,
);

export const createUserDisplayValueSelector = (baseId: string, userId: string): ReturnType<typeof createSelector> =>
  createSelector([(state: RootState) => selectUserCacheForBase(state, baseId)], (users): string => {
    const user = users[userId];
    if (!user) {
      return userId;
    }

    const displayValue =
      user.email ||
      user.username ||
      user.name ||
      user.display_name ||
      user.full_name ||
      user.first_name ||
      user.last_name ||
      user.user_name ||
      user.displayName ||
      user.firstName ||
      user.lastName ||
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
      userId;

    return displayValue;
  });

