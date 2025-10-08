/**
 * Utility to manage marketing and tracking query parameters
 * Captures utm_*, ref, and other tracking params for unauthenticated users
 * and persists them through the signup flow
 */

const STORAGE_KEY = 'altan_tracking_params';
const EXPIRY_DAYS = 30; // How long to keep the params

// List of query params we want to track
const TRACKED_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'referrer',
  'source',
  'campaign',
];

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clear tracking params from localStorage
 * Should be called after successful signup/login
 */
export const clearTrackingParams = () => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail - not critical
  }
};

/**
 * Extract tracking params from URL search params
 */
export const extractTrackingParams = (searchParams) => {
  const params = {};

  TRACKED_PARAMS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      params[key] = value;
    }
  });

  return Object.keys(params).length > 0 ? params : null;
};

/**
 * Store tracking params in localStorage with expiry
 * Only stores if user is unauthenticated
 */
export const storeTrackingParams = (params, isAuthenticated = false) => {
  // Don't store if user is authenticated
  if (isAuthenticated || !params || Object.keys(params).length === 0) {
    return false;
  }

  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const expiryTime = Date.now() + (EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const data = {
      params,
      expiry: expiryTime,
      capturedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

/**
 * Retrieve tracking params from localStorage
 * Returns null if expired or not found
 */
export const getTrackingParams = () => {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);

    // Check if expired
    if (data.expiry && Date.now() > data.expiry) {
      clearTrackingParams();
      return null;
    }

    return data.params || null;
  } catch {
    return null;
  }
};

/**
 * Capture tracking params from current URL
 * Only captures for unauthenticated users
 */
export const captureTrackingParamsFromURL = (isAuthenticated = false) => {
  if (isAuthenticated) {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const params = extractTrackingParams(searchParams);

  if (params) {
    storeTrackingParams(params, isAuthenticated);
    return params;
  }

  return null;
};

/**
 * Get all tracking params, prioritizing URL params over stored params
 * Returns combined params from both sources
 */
export const getAllTrackingParams = (isAuthenticated = false) => {
  if (isAuthenticated) {
    return null;
  }

  // Get params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlParams = extractTrackingParams(searchParams);

  // Get stored params
  const storedParams = getTrackingParams();

  // Merge, with URL params taking priority
  if (urlParams || storedParams) {
    return {
      ...storedParams,
      ...urlParams,
    };
  }

  return null;
};

/**
 * Format tracking params for API submission
 */
export const formatTrackingParamsForAPI = (params) => {
  if (!params || Object.keys(params).length === 0) {
    return null;
  }

  return {
    ...params,
    captured_at: Date.now(),
  };
};
