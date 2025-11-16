/**
 * Buckets slice - manages bucket cache
 * Following Single Responsibility Principle: Only handles bucket caching
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CloudBucket } from '../../../../services';
import type { BucketsState } from '../types';
import { createInitialCacheState } from '../utils';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: BucketsState = {
  bucketCache: {},
  cacheState: createInitialCacheState(),
};

// ============================================================================
// SLICE
// ============================================================================

const bucketsSlice = createSlice({
  name: 'cloud/buckets',
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

    // Bucket operations
    setBuckets(state, action: PayloadAction<{ cloudId: string; buckets: CloudBucket[] }>) {
      const { cloudId, buckets } = action.payload;
      if (!state.bucketCache[cloudId]) {
        state.bucketCache[cloudId] = {};
      }
      buckets.forEach((bucket) => {
        if (bucket?.id) {
          state.bucketCache[cloudId][bucket.id] = bucket;
        }
      });
      state.cacheState.lastFetched = Date.now();
      state.cacheState.error = null;
    },

    addBucket(state, action: PayloadAction<{ cloudId: string; bucket: CloudBucket }>) {
      const { cloudId, bucket } = action.payload;
      if (!state.bucketCache[cloudId]) {
        state.bucketCache[cloudId] = {};
      }
      state.bucketCache[cloudId][bucket.id] = bucket;
    },

    updateBucket(state, action: PayloadAction<{ cloudId: string; bucket: CloudBucket }>) {
      const { cloudId, bucket } = action.payload;
      if (state.bucketCache[cloudId]?.[bucket.id]) {
        state.bucketCache[cloudId][bucket.id] = {
          ...state.bucketCache[cloudId][bucket.id],
          ...bucket,
        };
      }
    },

    removeBucket(state, action: PayloadAction<{ cloudId: string; bucketId: string }>) {
      const { cloudId, bucketId } = action.payload;
      if (state.bucketCache[cloudId]) {
        delete state.bucketCache[cloudId][bucketId];
      }
    },

    // Clear cache
    clearBucketCache(state, action: PayloadAction<string | undefined>) {
      const cloudId = action.payload;
      if (cloudId) {
        delete state.bucketCache[cloudId];
      } else {
        state.bucketCache = {};
        state.cacheState = createInitialCacheState();
      }
    },
  },
});

export const {
  setCacheLoading,
  setCacheError,
  setBuckets,
  addBucket,
  updateBucket,
  removeBucket,
  clearBucketCache,
} = bucketsSlice.actions;

export default bucketsSlice.reducer;

