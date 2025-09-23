/**
 * Utility functions for managing per-project display mode preferences in localStorage
 */

const DISPLAY_MODE_STORAGE_KEY = 'altaner_display_modes';

/**
 * Get the display mode preference for a specific project
 * @param {string} altanerId - The project/altaner ID
 * @returns {string|null} - The display mode ('chat', 'preview', 'both') or null if not set
 */
export const getDisplayModeForProject = (altanerId) => {
  if (!altanerId) return null;
  
  try {
    const storedModes = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    if (!storedModes) return null;
    
    const modes = JSON.parse(storedModes);
    return modes[altanerId] || null;
  } catch (error) {
    console.warn('Error reading display mode from localStorage:', error);
    return null;
  }
};

/**
 * Set the display mode preference for a specific project
 * @param {string} altanerId - The project/altaner ID
 * @param {string} displayMode - The display mode ('chat', 'preview', 'both')
 */
export const setDisplayModeForProject = (altanerId, displayMode) => {
  if (!altanerId || !displayMode) return;
  
  try {
    const storedModes = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    const modes = storedModes ? JSON.parse(storedModes) : {};
    
    modes[altanerId] = displayMode;
    
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, JSON.stringify(modes));
  } catch (error) {
    console.warn('Error saving display mode to localStorage:', error);
  }
};

/**
 * Remove the display mode preference for a specific project
 * @param {string} altanerId - The project/altaner ID
 */
export const removeDisplayModeForProject = (altanerId) => {
  if (!altanerId) return;
  
  try {
    const storedModes = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    if (!storedModes) return;
    
    const modes = JSON.parse(storedModes);
    delete modes[altanerId];
    
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, JSON.stringify(modes));
  } catch (error) {
    console.warn('Error removing display mode from localStorage:', error);
  }
};

/**
 * Clear all display mode preferences
 */
export const clearAllDisplayModes = () => {
  try {
    localStorage.removeItem(DISPLAY_MODE_STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing display modes from localStorage:', error);
  }
};
