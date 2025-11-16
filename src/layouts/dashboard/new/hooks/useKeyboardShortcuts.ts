import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * Handles Cmd+K / Ctrl+K to focus prompt input
 */
export const useKeyboardShortcuts = (onActivate: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onActivate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onActivate]);
};

