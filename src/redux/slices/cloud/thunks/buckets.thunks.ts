/**
 * Buckets thunks - async operations for bucket management
 */

import type { AppDispatch, RootState } from '../../../store';
import { getCloudService } from '../../../../services';
import { setCacheLoading, setCacheError, setBuckets } from '../slices/buckets.slice';
import { handleThunkError, shouldUseCache, CACHE_DURATION } from '../utils';

const cloudService = getCloudService();

// ============================================================================
// BUCKET OPERATIONS
// ============================================================================

/**
 * Fetches buckets for a cloud instance with caching
 */
export const fetchBuckets =
  (cloudId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    
    // Access the buckets state from the correct location
    // Note: This assumes buckets are under state.cloud.buckets
    // Adjust the path based on your actual store structure
    const bucketsState = state.cloud?.buckets;
    
    if (!bucketsState) {
      throw new Error('Buckets state not found');
    }

    const { bucketCache, cacheState } = bucketsState;
    const existingBuckets = bucketCache[cloudId];

    // Return cached data if fresh
    if (shouldUseCache(existingBuckets, cacheState.lastFetched, cacheState.loading, CACHE_DURATION.ONE_HOUR)) {
      return existingBuckets ? Object.values(existingBuckets) : [];
    }

    // Return stale cache if already loading
    if (cacheState.loading) {
      return existingBuckets ? Object.values(existingBuckets) : [];
    }

    dispatch(setCacheLoading(true));

    try {
      const buckets = await cloudService.fetchBuckets(cloudId);

      dispatch(setBuckets({ cloudId, buckets }));

      return buckets;
    } catch (error) {
      const message = handleThunkError(error);
      dispatch(setCacheError(message));
      throw error;
    } finally {
      dispatch(setCacheLoading(false));
    }
  };

