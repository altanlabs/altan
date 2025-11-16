/**
 * Buckets cache slice
 * Single Responsibility: Manages bucket cache for bases
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BaseBucket } from '../../../../types/database';
import { createInitialCacheState, type CacheState } from '../utils';

interface BucketsSliceState {
  bucketCache: Record<string, Record<string, BaseBucket>>;
  bucketCacheState: CacheState;
}

const initialState: BucketsSliceState = {
  bucketCache: {},
  bucketCacheState: createInitialCacheState(),
};

const bucketsSlice = createSlice({
  name: 'bases/buckets',
  initialState,
  reducers: {
    setBucketCacheLoading(state, action: PayloadAction<boolean>) {
      state.bucketCacheState.loading = action.payload;
      if (action.payload) {
        state.bucketCacheState.error = null;
      }
    },
    setBucketCache(state, action: PayloadAction<{ buckets: BaseBucket[]; baseId: string }>) {
      const { buckets, baseId } = action.payload;

      if (!state.bucketCache[baseId]) {
        state.bucketCache[baseId] = {};
      }

      buckets.forEach((bucket) => {
        if (bucket && bucket.id) {
          state.bucketCache[baseId][bucket.id] = bucket;
        }
      });

      state.bucketCacheState.loading = false;
      state.bucketCacheState.lastFetched = Date.now();
      state.bucketCacheState.error = null;
    },
    setBucketCacheError(state, action: PayloadAction<string>) {
      state.bucketCacheState.loading = false;
      state.bucketCacheState.error = action.payload;
    },
    clearBucketCache(state, action: PayloadAction<{ baseId?: string } | undefined>) {
      const baseId = action.payload?.baseId;
      if (baseId) {
        delete state.bucketCache[baseId];
      } else {
        state.bucketCache = {};
      }
      state.bucketCacheState = createInitialCacheState();
    },
    addBucketToCache(state, action: PayloadAction<{ bucket: BaseBucket; baseId: string }>) {
      const { bucket, baseId } = action.payload;
      if (!state.bucketCache[baseId]) {
        state.bucketCache[baseId] = {};
      }
      state.bucketCache[baseId][bucket.id] = bucket;
    },
    removeBucketFromCache(state, action: PayloadAction<{ bucketId: string; baseId: string }>) {
      const { bucketId, baseId } = action.payload;
      if (state.bucketCache[baseId]) {
        delete state.bucketCache[baseId][bucketId];
      }
    },
    updateBucketInCache(state, action: PayloadAction<{ bucket: BaseBucket; baseId: string }>) {
      const { bucket, baseId } = action.payload;
      if (state.bucketCache[baseId] && state.bucketCache[baseId][bucket.id]) {
        state.bucketCache[baseId][bucket.id] = bucket;
      }
    },
  },
});

export const {
  setBucketCacheLoading,
  setBucketCache,
  setBucketCacheError,
  clearBucketCache,
  addBucketToCache,
  removeBucketFromCache,
  updateBucketInCache,
} = bucketsSlice.actions;

export default bucketsSlice.reducer;

