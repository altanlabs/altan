import { m } from 'framer-motion';
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ScrollableContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ScrollableContent - Wrapper for scrollable content areas
 * Provides smooth scrolling with Framer Motion
 * Exposes the scroll container ref for scroll detection
 */
export const ScrollableContent = forwardRef<HTMLDivElement, ScrollableContentProps>(
  ({ children, className = '' }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // Expose the internal ref to parent components
    useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

    useEffect(() => {
      const container = internalRef.current;
      
      // Restore scroll position on mount (if needed for navigation)
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition && container) {
        container.scrollTop = parseInt(savedPosition, 10);
      }

      // Save scroll position on unmount
      return () => {
        if (container) {
          sessionStorage.setItem('scrollPosition', container.scrollTop.toString());
        }
      };
    }, []);

    return (
      <m.div
        ref={internalRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden ${className}`}
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </m.div>
    );
  }
);

ScrollableContent.displayName = 'ScrollableContent';

