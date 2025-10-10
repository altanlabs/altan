import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { useExecutionDialog } from '../../providers/ExecutionDialogProvider.jsx';
import { makeSelectMessagePartById } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';
import IconRenderer from '../icons/IconRenderer.jsx';
import { getCustomRenderer, getToolIcon } from './tool-renderers/index.js';

function extractAndCapitalize(str) {
  if (!str) return 'Tool';
  const lastSubstring = str.split('.').pop();
  return lastSubstring
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const ToolPartCard = ({
  partId,
  noClick = false,
  children,
}) => {
  const { setExecutionId } = useExecutionDialog() || {};
  const partSelector = useMemo(() => makeSelectMessagePartById(), []);
  const part = useSelector((state) => partSelector(state, partId));
  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
  const contentRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const isCompleted = part?.is_done;
  const isExecuting = !isCompleted && (part?.arguments !== undefined || ['running', 'preparing'].includes(part?.status));

  // Get custom renderer component if available (must be defined before useEffect)
  const CustomRenderer = useMemo(() => {
    return getCustomRenderer(part?.name);
  }, [part?.name]);

  // Auto-expand when executing, auto-collapse when completed
  // Skip auto-expand for custom renderers (they handle their own display logic)
  useEffect(() => {
    if (CustomRenderer) {
      // Custom renderers stay collapsed by default
      return;
    }
    
    if (!isCompleted) {
      setManuallyCollapsed(false); // Expand when executing
    } else {
      setManuallyCollapsed(true); // Collapse when completed
    }
  }, [isCompleted, CustomRenderer]);

  // Auto-scroll to bottom when content changes (unless user is scrolling)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || isUserScrollingRef.current) return;

    // Stick to bottom
    contentEl.scrollTop = contentEl.scrollHeight;
  }, [part?.arguments]);

  // Determine what to display as the main text
  const displayText = useMemo(() => {
    if (!part) return '';
    if (isExecuting && part.act_now) {
      return part.act_now;
    }
    if (!isExecuting && part.act_done) {
      return part.act_done;
    }
    return extractAndCapitalize(part.name);
  }, [part, isExecuting]);

  // Get tool icon from registry or task_execution
  const toolIcon = useMemo(() => {
    const toolName = part?.name;
    const fallbackIcon = part?.task_execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill';
    return getToolIcon(toolName, fallbackIcon);
  }, [part?.name, part?.task_execution?.tool?.action_type?.connection_type?.icon]);

  // Get execution ID for the dialog
  const executionId = useMemo(() => {
    return part?.task_execution_id || part?.task_execution?.id || part?.execution?.id || null;
  }, [part?.task_execution_id, part?.task_execution?.id, part?.execution?.id]);

  const partCreatedAt = part?.created_at || part?.date_creation;
  const duration = useMemo(() => {
    if (!isCompleted || !partCreatedAt || !part?.finished_at) return null;
    const start = new Date(partCreatedAt).getTime();
    const end = new Date(part.finished_at).getTime();
    const s = (end - start) / 1000;
    return s < 10 ? s.toFixed(1) : Math.round(s);
  }, [isCompleted, partCreatedAt, part?.finished_at]);

  const isExpanded = useMemo(() => !isCompleted || !manuallyCollapsed, [isCompleted, manuallyCollapsed]);

  const handleToggle = useCallback(() => {
    if (isCompleted) setManuallyCollapsed((v) => !v);
  }, [isCompleted]);

  // Click handler to open execution dialog (only on icon, not on whole card)
  const handleIconClick = useCallback((e) => {
    e.stopPropagation();
    if (!noClick && executionId && setExecutionId) {
      setExecutionId(executionId);
    }
  }, [noClick, executionId, setExecutionId]);

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
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Filter out special fields from arguments for display
  const filteredArguments = useMemo(() => {
    if (!part?.arguments) return '';
    try {
      const parsed = JSON.parse(part.arguments);
      // Remove special fields
      const { __act_now, __act_done, __intent, __use_intent, ...filtered } = parsed;
      return Object.keys(filtered).length > 0 ? JSON.stringify(filtered, null, 2) : '';
    } catch {
      // If parsing fails (partial JSON during streaming), try to filter using regex
      let filtered = part.arguments;
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
  }, [part?.arguments]);

  const hasDisplayableArguments = !!(filteredArguments && filteredArguments.length > 0);

  // Get intent for tooltip
  const intentText = useMemo(() => {
    return part?.intent || part?.task_execution?.intent || null;
  }, [part?.intent, part?.task_execution?.intent]);

  const headerText = useMemo(() => {
    if (duration && parseFloat(duration) > 0) return `${displayText} (${duration}s)`;
    return displayText;
  }, [duration, displayText]);

  const hasError = !!part?.error;
  const [showError, setShowError] = useState(false);

  const handleErrorClick = useCallback((e) => {
    e.stopPropagation();
    setShowError((v) => !v);
  }, []);

  // Format error for display
  const formattedError = useMemo(() => {
    if (!part?.error) return '';

    // If error is a string, return it
    if (typeof part.error === 'string') return part.error;

    // If error has __stats property
    if (part.error.__stats) {
      const stats = part.error.__stats;
      let errorMsg = '';

      // Add the main error message
      if (stats.error) {
        errorMsg += `Error: ${stats.error}\n`;
      }

      // Add status code and URL
      if (stats.status_code) {
        errorMsg += `Status: ${stats.status_code}\n`;
      }
      if (stats.url) {
        errorMsg += `URL: ${stats.url}\n`;
      }

      // Add detailed error data if available
      if (stats.data) {
        errorMsg += `\nDetails:\n${JSON.stringify(stats.data, null, 2)}`;
      }

      return errorMsg || JSON.stringify(part.error, null, 2);
    }

    // If error has content or message properties
    if (part.error.content) return part.error.content;
    if (part.error.message) return part.error.message;

    // Fallback to JSON stringify
    return JSON.stringify(part.error, null, 2);
  }, [part?.error]);

  if (!part) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Custom Renderer (handles own header) or Default Header + Content */}
      {CustomRenderer ? (
        <CustomRenderer
          part={part}
          onScroll={handleScroll}
          isExpanded={isExpanded}
          onToggle={handleToggle}
        />
      ) : (
        <>
          {/* Default Header */}
          <button
            onClick={handleToggle}
            aria-expanded={isExpanded}
            className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 group"
            title={intentText || undefined}
          >
            <span className="flex items-center gap-1">
              <IconRenderer
                icon={toolIcon}
                className={cn(
                  'text-[11px] flex-shrink-0',
                  !isCompleted && 'animate-pulse',
                )}
                onClick={handleIconClick}
              />
              {!isCompleted && <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />}
            </span>

            {!duration ? (
              <TextShimmer className="inline-block">
                {headerText}
              </TextShimmer>
            ) : (
              <span className="font-medium">{headerText}</span>
            )}

            {hasDisplayableArguments && (
              <Icon
                icon="mdi:chevron-down"
                className={cn(
                  'w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-all duration-150',
                  isExpanded ? 'rotate-180' : 'rotate-0',
                )}
              />
            )}

            {hasError && (
              <Icon
                icon="mdi:alert-circle"
                className="text-red-500 text-sm flex-shrink-0 cursor-pointer hover:text-red-600 ml-auto"
                onClick={handleErrorClick}
              />
            )}
          </button>

          {/* Default Arguments Display */}
          {isExpanded && hasDisplayableArguments && (
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="px-3 pb-3 pt-0.5 max-h-[100px] overflow-y-auto elegant-scrollbar"
            >
              <pre className="text-[11px] leading-relaxed opacity-60 whitespace-pre-wrap break-words font-mono">
                {filteredArguments}
              </pre>
            </div>
          )}
        </>
      )}

      {/* Error Display - Only show when clicked */}
      {showError && hasError && (
        <div className="px-3 pb-3 pt-0.5 max-h-[200px] overflow-y-auto elegant-scrollbar">
          <pre className="text-[11px] text-red-600 dark:text-red-400 opacity-80 whitespace-pre-wrap break-words font-mono">
            {formattedError}
          </pre>
        </div>
      )}

      {children}
    </div>
  );
};

export default memo(ToolPartCard);
