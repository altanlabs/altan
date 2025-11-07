import React, { useState, useEffect } from 'react';

import { cn } from '@lib/utils';

// Question Option Component - individual option within a question group
const QuestionOption = ({ children, value, isSelected, isRecommended, onSelect, groupId }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const selectionTimeoutRef = React.useRef(null);
  const animationTimeoutRef = React.useRef(null);

  const handleClick = () => {
    if (!isSelected) {
      setIsAnimating(true);
      // Clear any pending selection timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      // Delay the actual selection to show animation
      selectionTimeoutRef.current = setTimeout(() => {
        onSelect(groupId, value || (typeof children === 'string' ? children : ''));
        selectionTimeoutRef.current = null;
      }, 150);
    }
  };

  // Reset animation state when selection changes
  useEffect(() => {
    if (isSelected) {
      // Clear any pending animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, 300);
    }
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isSelected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      style={{
        transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className={cn(
        'w-full px-3 py-2 rounded-lg text-sm font-medium text-left',
        'shadow-sm hover:shadow-md',
        'backdrop-blur-md border-2',
        // Animating state (first flash - bright)
        isAnimating && 'bg-blue-500/30 dark:bg-blue-400/40 border-blue-600 dark:border-blue-300 scale-[1.02]',
        // Selected state (second stage - settled)
        isSelected && !isAnimating && 'bg-blue-500/12 dark:bg-blue-500/25 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-white',
        // Recommended state (when not selected)
        !isSelected && !isAnimating && isRecommended && 'bg-green-500/6 dark:bg-green-500/10 border-green-500/40 dark:border-green-500/50 text-gray-800 dark:text-gray-200',
        // Default state (when not selected and not recommended)
        !isSelected && !isAnimating && !isRecommended && 'bg-white/80 dark:bg-gray-700/50 border-gray-400/30 dark:border-gray-600/40 text-gray-800 dark:text-gray-200',
        // Hover states
        !isSelected && !isAnimating && isRecommended && 'hover:bg-green-500/10 dark:hover:bg-green-500/15 hover:border-green-500/50 dark:hover:border-green-500/60',
        !isSelected && !isAnimating && !isRecommended && 'hover:bg-gray-500/8 dark:hover:bg-gray-600/20 hover:border-gray-500/40 dark:hover:border-gray-500/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 leading-snug flex items-center gap-2">
          {children}
          {isRecommended && !isSelected && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-500/15 dark:bg-green-500/25 text-green-600 dark:text-green-400">
              Recommended
            </span>
          )}
        </span>
        <div
          style={{
            transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0',
            isSelected
              ? 'bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400 scale-100'
              : 'bg-transparent border-gray-400/40 dark:border-gray-500/50 scale-90',
          )}
        >
          {isSelected && (
            <svg
              className="w-3.5 h-3.5 text-white animate-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

// Memoize to prevent unnecessary re-renders during streaming
export default React.memo(QuestionOption);
