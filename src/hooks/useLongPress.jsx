import { useCallback, useRef } from 'react';

import { isMobile } from '../utils/responsive';

/**
 * A hook to detect long press on touch devices.
 * @param {Function} onLongPress - The callback function to execute on long press.
 * @param {number|Object} [durationOrOptions=750] - The duration (in milliseconds) to consider as a long press, or options object with ms property.
 */
const useLongPress = (onLongPress, durationOrOptions = 750) => {
  const longPressTimerRef = useRef(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const isLongPressRef = useRef(false);

  // Handle both number and object formats for backward compatibility
  const duration = typeof durationOrOptions === 'object' ? durationOrOptions.ms || 750 : durationOrOptions;

  const triggerHapticFeedback = useCallback(() => {
    // Provide haptic feedback on mobile devices when available
    try {
      if (navigator.vibrate) {
        navigator.vibrate(50); // Short vibration to indicate long press detected
      }
    } catch (error) {
      // Silently fail if vibration is not available
      console.debug('Haptic feedback not available:', error);
    }
  }, []);

  const handleTouchStart = useCallback((event) => {
    if (!isMobile()) return;
    
    // Clear any existing timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    isLongPressRef.current = false;
    
    // Store the initial touch position
    const touch = event.touches[0];
    startPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    // Start the long press timer
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      triggerHapticFeedback();
      onLongPress(event);
    }, duration);
  }, [onLongPress, duration, triggerHapticFeedback]);

  const handleTouchMove = useCallback((event) => {
    if (!isMobile() || !longPressTimerRef.current) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - startPositionRef.current.x);
    const deltaY = Math.abs(touch.clientY - startPositionRef.current.y);

    // Cancel long press if the finger moved too much (more than 10px)
    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((event) => {
    if (!isMobile()) return;

    // Clear the timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If it was a long press, prevent the default behavior (like text selection)
    if (isLongPressRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }

    isLongPressRef.current = false;
  }, []);

  const handleTouchCancel = useCallback(() => {
    if (!isMobile()) return;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    isLongPressRef.current = false;
  }, []);

  // Return event handlers to be spread on the component
  return isMobile() ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  } : {};
};

export default useLongPress;
