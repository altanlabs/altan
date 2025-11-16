/**
 * Users selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { CloudUser } from '../../../../services';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Selects the entire cloud state
 */
export const selectUsersState = (state: RootState) => state.cloud;

/**
 * Selects the user cache
 */
export const selectUserCache = createSelector(
  [selectUsersState],
  (cloudState) => cloudState?.userCache || {},
);

/**
 * Selects the cache state
 */
export const selectUserCacheState = createSelector(
  [selectUsersState],
  (cloudState) => cloudState?.cacheState || { loading: false, lastFetched: null, error: null },
);

/**
 * Selects cache loading state
 */
export const selectUserCacheLoading = createSelector(
  [selectUserCacheState],
  (cacheState) => cacheState.loading,
);

/**
 * Selects cache error
 */
export const selectUserCacheError = createSelector(
  [selectUserCacheState],
  (cacheState) => cacheState.error,
);

// ============================================================================
// PARAMETERIZED SELECTORS
// ============================================================================

/**
 * Selects users for a specific cloud
 */
export const selectUsersForCloud = createSelector(
  [selectUserCache, (_: RootState, cloudId: string) => cloudId],
  (userCache, cloudId): CloudUser[] => Object.values(userCache[cloudId] || {}),
);

/**
 * Selects a specific user by cloud ID and user ID
 */
export const selectUserById = createSelector(
  [selectUserCache, (_: RootState, cloudId: string, userId: string) => ({ cloudId, userId })],
  (userCache, { cloudId, userId }): CloudUser | undefined => userCache[cloudId]?.[userId],
);

/**
 * Selects user count for a specific cloud
 */
export const selectUserCountForCloud = createSelector(
  [selectUsersForCloud],
  (users) => users.length,
);

