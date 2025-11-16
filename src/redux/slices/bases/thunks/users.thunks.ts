/**
 * User cache operations thunks
 */

import type { AppDispatch, RootState } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setLoading, setError } from '../slices/bases.slice';
import { setUserCacheLoading, setUserCache, setUserCacheError } from '../slices/users.slice';
import { handleThunkError, isCacheFresh, CACHE_DURATION } from '../utils';

const getService = () => getDatabaseService();

export const preloadUsersForBase = (baseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const userCacheState = state.bases.userCacheState;
  const existingUsers = state.bases.userCache[baseId];

  // Return cached if fresh
  if (
    existingUsers &&
    Object.keys(existingUsers).length > 0 &&
    isCacheFresh(userCacheState.lastFetched, CACHE_DURATION.ONE_HOUR)
  ) {
    return Promise.resolve(existingUsers);
  }

  // Return stale cache if already loading
  if (userCacheState.loading) {
    return Promise.resolve({});
  }

  dispatch(setUserCacheLoading(true));

  try {
    const service = getService();
    const users = await service.fetchUsers(baseId);
    dispatch(setUserCache({ users, baseId }));
    return Promise.resolve(state.bases.userCache[baseId] || {});
  } catch (error: unknown) {
    dispatch(setUserCacheError(handleThunkError(error)));
    throw error;
  }
};

export const deleteUserFromBase = (baseId: string, userId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setLoading(true));
  
  try {
    const service = getService();
    await service.deleteUser(baseId, userId);

    // Remove from Redux cache
    const state = getState();
    if (state.bases.userCache[baseId] && state.bases.userCache[baseId][userId]) {
      const updatedCache = { ...state.bases.userCache[baseId] };
      delete updatedCache[userId];
      
      dispatch(setUserCache({ 
        users: Object.values(updatedCache), 
        baseId 
      }));
    }

    return Promise.resolve();
  } catch (error: unknown) {
    dispatch(setError(handleThunkError(error)));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

