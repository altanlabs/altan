/**
 * Bucket cache operations thunks
 */

import type { AppDispatch, RootState } from '../../../store';
import { getDatabaseService } from '../../../../di';
import { setBucketCacheLoading, setBucketCache, setBucketCacheError } from '../slices/buckets.slice';
import { handleThunkError, isCacheFresh, CACHE_DURATION } from '../utils';

const getService = () => getDatabaseService();

export const preloadBucketsForBase = (baseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const bucketCacheState = state.bases.bucketCacheState;
  const existingBuckets = state.bases.bucketCache[baseId];

  // Return cached if fresh
  if (
    existingBuckets &&
    Object.keys(existingBuckets).length > 0 &&
    isCacheFresh(bucketCacheState.lastFetched, CACHE_DURATION.ONE_HOUR)
  ) {
    return Promise.resolve(existingBuckets);
  }

  // Return stale cache if already loading
  if (bucketCacheState.loading) {
    return Promise.resolve({});
  }

  dispatch(setBucketCacheLoading(true));

  try {
    const service = getService();
    const buckets = await service.fetchBuckets(baseId);
    dispatch(setBucketCache({ buckets, baseId }));
    return Promise.resolve(state.bases.bucketCache[baseId] || {});
  } catch (error: unknown) {
    dispatch(setBucketCacheError(handleThunkError(error)));
    throw error;
  }
};

