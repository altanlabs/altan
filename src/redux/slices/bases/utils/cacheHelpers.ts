/**
 * Cache management utilities for bases slice
 */

export const CACHE_DURATION = {
  ONE_HOUR: 60 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
} as const;

/**
 * Checks if cache is still fresh
 */
export const isCacheFresh = (
  lastFetched: number | null,
  duration: number = CACHE_DURATION.ONE_HOUR,
): boolean => {
  if (lastFetched === null) return false;
  return Date.now() - lastFetched < duration;
};

/**
 * Cache state interface
 */
export interface CacheState {
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

/**
 * Creates initial cache state
 */
export const createInitialCacheState = (): CacheState => ({
  loading: false,
  lastFetched: null,
  error: null,
});

