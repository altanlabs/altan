import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

import { makeSelectToolPartArguments } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';

const ToolPartArguments = ({ partId, isExpanded, onScroll }) => {
  const contentRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const argumentsSelector = useMemo(() => makeSelectToolPartArguments(), []);
  const argsData = useSelector((state) => argumentsSelector(state, partId));

  const isCompleted = argsData?.is_done;

  // Auto-scroll to bottom when content changes (unless user is scrolling)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || isUserScrollingRef.current) return;

    // Stick to bottom
    contentEl.scrollTop = contentEl.scrollHeight;
  }, [argsData?.arguments]);

  // Filter out special fields from arguments for display
  const filteredArguments = useMemo(() => {
    if (!argsData?.arguments) return '';
    try {
      const parsed = JSON.parse(argsData.arguments);
      // Remove special fields
      const { __act_now, __act_done, __intent, __use_intent, ...filtered } = parsed;
      return Object.keys(filtered).length > 0 ? JSON.stringify(filtered, null, 2) : '';
    } catch {
      // If parsing fails (partial JSON during streaming), try to filter using regex
      let filtered = argsData.arguments;
      // Remove special fields using regex
      filtered = filtered.replace(/"__act_now"\s*:\s*"[^"]*"\s*,?\s*/g, '');
      filtered = filtered.replace(/"__act_done"\s*:\s*"[^"]*"\s*,?\s*/g, '');
      filtered = filtered.replace(/"__intent"\s*:\s*"[^"]*"\s*,?\s*/g, '');
      filtered = filtered.replace(/"__use_intent"\s*:\s*(true|false)\s*,?\s*/g, '');
      // Clean up extra commas and whitespace
      filtered = filtered.replace(/,\s*,/g, ',');
      filtered = filtered.replace(/,\s*}/g, '}');
      filtered = filtered.replace(/{\s*,/g, '{');
      return filtered;
    }
  }, [argsData?.arguments]);

  // Track user scrolling
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Check if scrolled to bottom
    const contentEl = contentRef.current;
    if (contentEl) {
      const isAtBottom = Math.abs(contentEl.scrollHeight - contentEl.scrollTop - contentEl.clientHeight) < 5;

      if (isAtBottom) {
        // Reset to auto-scroll mode when at bottom
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 150);
      } else {
        // Set a longer timeout if not at bottom
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 1000);
      }
    }

    // Call parent onScroll if provided
    if (onScroll) {
      onScroll();
    }
  }, [onScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (!filteredArguments || filteredArguments.length === 0) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      onScroll={handleScroll}
      className="px-3 py-2 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full bg-gray-50/50 dark:bg-gray-900/50"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(209 213 219) transparent',
      }}
    >
      <pre className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words font-mono">
        {filteredArguments}
      </pre>
    </div>
  );
};

export default memo(ToolPartArguments, (prevProps, nextProps) => {
  // Only re-render if partId or isExpanded changes
  return (
    prevProps.partId === nextProps.partId &&
    prevProps.isExpanded === nextProps.isExpanded
  );
});
