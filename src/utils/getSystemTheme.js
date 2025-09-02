// ----------------------------------------------------------------------

/**
 * Detects the user's system theme preference
 * @returns {'dark' | 'light'} The current system theme preference
 */
export function getSystemTheme() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }

  // Check if the browser supports prefers-color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Resolves the actual theme mode based on the user's preference
 * @param {string} themeMode - The theme mode setting ('light', 'dark', 'system')
 * @returns {'dark' | 'light'} The resolved theme mode
 */
export function resolveThemeMode(themeMode) {
  if (themeMode === 'system') {
    return getSystemTheme();
  }
  
  return themeMode === 'dark' ? 'dark' : 'light';
}

/**
 * Creates a listener for system theme changes
 * @param {function} callback - Function to call when system theme changes
 * @returns {function} Cleanup function to remove the listener
 */
export function addSystemThemeListener(callback) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return () => {}; // Return empty cleanup function for SSR
  }

  // Check if the browser supports matchMedia
  if (!window.matchMedia) {
    return () => {}; // Return empty cleanup function for unsupported browsers
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e) => {
    const systemTheme = e.matches ? 'dark' : 'light';
    callback(systemTheme);
  };

  // Use the newer addEventListener if available, otherwise use the deprecated addListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
}
