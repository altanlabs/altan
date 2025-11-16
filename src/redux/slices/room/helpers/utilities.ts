/**
 * Utility Functions
 * General utility functions for the room slice
 */

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns True if copy was successful
 */
export const copy = (text: string): boolean => {
  const parentUrl = window.parent.location.href;
  if (!parentUrl) {
    window.parent.postMessage({ type: 'COPY_TO_CLIPBOARD', text }, '*');
    return true;
  }
  // Try to save to clipboard then save it in the state if worked
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get current timestamp in ISO format
 * @returns ISO timestamp string
 */
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

