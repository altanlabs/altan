import { useState, useEffect, useCallback, RefObject } from 'react';

import { ScrollState } from '../types';

/**
 * Custom hook for detecting scroll position and state
 * Works with a scrollable container ref instead of window
 * Following Single Responsibility Principle
 */
export const useScrollDetection = (
  scrollContainerRef: RefObject<HTMLElement>,
  threshold: number = 100
): ScrollState => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    isScrolled: false,
    showCompactPrompt: false,
  });

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollY = container.scrollTop;
    const isScrolled = scrollY > 20;
    const showCompactPrompt = scrollY > threshold;

    setScrollState({
      scrollY,
      isScrolled,
      showCompactPrompt,
    });
  }, [scrollContainerRef, threshold]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Add scroll listener to the container
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollContainerRef]);

  return scrollState;
};

