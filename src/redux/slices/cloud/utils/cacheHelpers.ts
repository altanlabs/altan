/**
 * Utility functions for cache management
 */

export const CACHE_DURATION = {
  ONE_HOUR: 60 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
} as const;

/**
 * Checks if cache is still fresh based on last fetch time
 */
export const isCacheFresh = (
  lastFetched: number | null,
  duration: number = CACHE_DURATION.ONE_HOUR,
): boolean => {
  if (lastFetched === null) return false;
  return Date.now() - lastFetched < duration;
};

/**
 * Checks if cache should be used (exists, has data, and is fresh)
 */
export const shouldUseCache = <T>(
  cache: Record<string, T> | undefined,
  lastFetched: number | null,
  isLoading: boolean,
  duration?: number,
): boolean => {
  if (isLoading) return true; // Return stale cache if already loading
  if (!cache || Object.keys(cache).length === 0) return false;
  return isCacheFresh(lastFetched, duration);
};

/**
 * Creates initial cache state
 */
export interface CacheState {
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

export const createInitialCacheState = (): CacheState => ({
  loading: false,
  lastFetched: null,
  error: null,
});

