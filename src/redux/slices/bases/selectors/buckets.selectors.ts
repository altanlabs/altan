/**
 * Buckets cache selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

export const selectBucketCache = createSelector(
  [(state: RootState) => state.bases],
  (state) => state.bucketCache,
);

export const selectBucketCacheState = createSelector(
  [(state: RootState) => state.bases],
  (state) => state.bucketCacheState,
);

export const selectBucketCacheForBase = createSelector(
  [selectBucketCache, (_: RootState, baseId: string) => baseId],
  (bucketCache, baseId) => bucketCache[baseId] || {},
);

export const selectBucketById = createSelector(
  [selectBucketCacheForBase, (_: RootState, __: string, bucketId: string) => bucketId],
  (buckets, bucketId) => buckets[bucketId] || null,
);

export const createRecordPrimaryValueSelector = (baseId: string, tableId: number, recordId: string): ReturnType<typeof createSelector> =>
  createSelector(
    [
      (state: RootState) => state.bases.records[String(tableId)]?.items || [],
      (state: RootState) => {
        const table = state.bases.tables[baseId]?.items?.find((t) => t.id === tableId);
        return table?.fields?.items || [];
      },
    ],
    (records, fields) => {
      const record = records.find((r) => r.id === recordId);
      if (!record) return `Record ${recordId}`;

      const fieldToUse = fields.find((field) => field.is_primary) || fields[0];
      return (record[fieldToUse?.db_field_name || 'id'] as string) || `Record ${recordId}`;
    },
  );

