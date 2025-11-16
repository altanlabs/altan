/**
 * Safe TextShimmer Component
 * Wrapper for TextShimmer with error handling
 */

import type React from 'react';

import { TextShimmer } from '../../aceternity/text/text-shimmer';

interface SafeTextShimmerProps {
  text: string | null | undefined;
  fallbackText?: string;
  className?: string;
  duration?: number;
}

/**
 * Safe wrapper for TextShimmer that handles errors and invalid inputs
 * Follows DRY - eliminates repeated error handling logic
 */
export const SafeTextShimmer = ({
  text,
  fallbackText = 'Untitled Task',
  className = 'text-xs font-medium truncate leading-none',
  duration = 2,
}: SafeTextShimmerProps): React.JSX.Element => {
  try {
    const safeText =
      text !== null && text !== undefined && text !== '' ? String(text).trim() : fallbackText;

    if (!safeText || safeText.length === 0) {
      return (
        <span className={`${className} text-gray-900 dark:text-gray-100`}>
          {fallbackText}
        </span>
      );
    }

    return (
      <TextShimmer className={className} duration={duration}>
        {safeText}
      </TextShimmer>
    );
  } catch (error) {
    console.error('TextShimmer error:', error, text);
    return (
      <span className={`${className} text-gray-900 dark:text-gray-100`}>
        {fallbackText}
      </span>
    );
  }
};

