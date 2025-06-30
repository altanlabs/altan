import { useEffect } from 'react';

import { isMobile } from '../utils/responsive';

/**
 * A hook to detect long press on touch devices.
 * @param {Function} onLongPress - The callback function to execute on long press.
 * @param {number} [duration=750] - The duration (in milliseconds) to consider as a long press.
 */
const useLongPress = (onLongPress, duration = 750) => {
  useEffect(() => {
    let longPressTimer;
    let startX = 0; // Initial touch X coordinate
    let startY = 0; // Initial touch Y coordinate

    const handleLongPressStart = (event) => {
      event.stopPropagation();
      // Capture starting touch position
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      longPressTimer = setTimeout(() => {
        // Check if touch position hasn't changed significantly
        onLongPress(event);
      }, duration);
    };

    const cancelContextMenuByLocation = (e) => {
      if (
        Math.abs(e.touches[0].clientX - startX) > 10 ||
        Math.abs(e.touches[0].clientY - startY) > 10
      ) {
        clearTimeout(longPressTimer);
      }
    };

    const cancelContextMenu = () => {
      clearTimeout(longPressTimer);
    };

    if (!!isMobile()) {
      document.addEventListener('touchstart', handleLongPressStart, { passive: false });
      document.addEventListener('touchmove', cancelContextMenuByLocation, { passive: false });
      document.addEventListener('touchend', cancelContextMenu, { passive: false });
      document.addEventListener('touchcancel', cancelContextMenu, { passive: false });

      return () => {
        document.removeEventListener('touchstart', handleLongPressStart);
        document.removeEventListener('touchmove', cancelContextMenuByLocation);
        document.removeEventListener('touchend', cancelContextMenu);
        document.removeEventListener('touchcancel', cancelContextMenu);
      };
    }
  }, [onLongPress, duration]);
};

export default useLongPress;
