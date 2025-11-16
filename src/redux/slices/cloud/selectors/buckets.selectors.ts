/**
 * Buckets selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { CloudBucket } from '../../../../services';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Selects the entire cloud state
 */
export const selectBucketsState = (state: RootState) => state.cloud;

/**
 * Selects the bucket cache
 */
export const selectBucketCache = createSelector(
  [selectBucketsState],
  (cloudState) => cloudState?.bucketCache || {},
);

/**
 * Selects the cache state
 */
export const selectBucketCacheState = createSelector(
  [selectBucketsState],
  (cloudState) => cloudState?.bucketCacheState || { loading: false, lastFetched: null, error: null },
);

/**
 * Selects cache loading state
 */
export const selectBucketCacheLoading = createSelector(
  [selectBucketCacheState],
  (cacheState) => cacheState.loading,
);

/**
 * Selects cache error
 */
export const selectBucketCacheError = createSelector(
  [selectBucketCacheState],
  (cacheState) => cacheState.error,
);

// ============================================================================
// PARAMETERIZED SELECTORS
// ============================================================================

/**
 * Selects buckets for a specific cloud
 */
export const selectBucketsForCloud = createSelector(
  [selectBucketCache, (_: RootState, cloudId: string) => cloudId],
  (bucketCache, cloudId): Record<string, CloudBucket> => bucketCache[cloudId] || {},
);

/**
 * Selects buckets as array for a specific cloud
 */
export const selectBucketsArrayForCloud = createSelector(
  [selectBucketsForCloud],
  (buckets) => Object.values(buckets),
);

/**
 * Selects a specific bucket by cloud ID and bucket ID
 */
export const selectBucketById = createSelector(
  [
    selectBucketCache,
    (_: RootState, cloudId: string, bucketId: string) => ({ cloudId, bucketId }),
  ],
  (bucketCache, { cloudId, bucketId }): CloudBucket | undefined =>
    bucketCache[cloudId]?.[bucketId],
);

/**
 * Selects bucket count for a specific cloud
 */
export const selectBucketCountForCloud = createSelector(
  [selectBucketsForCloud],
  (buckets) => Object.keys(buckets).length,
);

