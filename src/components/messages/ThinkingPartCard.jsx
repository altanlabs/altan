import { Icon } from '@iconify/react';
import { memo, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import CustomMarkdown from './CustomMarkdown';
import { selectMessagePartsById } from '../../redux/slices/room';

// Selector that only extracts the fields we need for this component
const selectThinkingPartFields = (state, partId) => {
  const part = selectMessagePartsById(state)[partId];
  if (!part) return null;

  return {
    text: part.text,
    is_done: part.is_done,
    status: part.status,
    created_at: part.created_at,
    finished_at: part.finished_at,
    summary: part.summary,
    provider: part.provider,
    provider_id: part.provider_id,
  };
};

const ThinkingPartCard = ({ partId }) => {
  const part = useSelector((s) => selectThinkingPartFields(s, partId), shallowEqual);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
  const contentRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const isCompleted = part?.is_done || part?.status === 'completed';

  // Expand when thinking starts, collapse when thinking completes
  useEffect(() => {
    if (!isCompleted) {
      setManuallyCollapsed(false);
    } else {
      setManuallyCollapsed(true);
    }
  }, [isCompleted]);

  // Auto-scroll to bottom when content changes (unless user is scrolling)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || isUserScrollingRef.current) return;

    // Stick to bottom
    contentEl.scrollTop = contentEl.scrollHeight;
  }, [part?.text, part?.summary]);

  const duration = useMemo(() => {
    if (!isCompleted || !part?.created_at || !part?.finished_at) return null;
    const start = new Date(part.created_at).getTime();
    const end = new Date(part.finished_at).getTime();
    const s = (end - start) / 1000;
    return s < 10 ? s.toFixed(1) : Math.round(s);
  }, [isCompleted, part?.created_at, part?.finished_at]);

  const hasContent = useMemo(() => {
    const hasText = !!(part?.text && part.text.length);
    const hasSummary = !!(part?.summary && Array.isArray(part.summary) && part.summary.length > 0);
    return hasText || hasSummary;
  }, [part?.text, part?.summary]);

  const isExpanded = useMemo(() => !isCompleted || !manuallyCollapsed, [isCompleted, manuallyCollapsed]);

  const onToggle = useCallback(() => {
    if (isCompleted) setManuallyCollapsed((v) => !v);
  }, [isCompleted]);

  const headerText = useMemo(() => duration ? `Thought for ${duration}s` : 'Thinking…', [duration]);

  // Track user scrolling
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const contentEl = contentRef.current;
    if (contentEl) {
      const isAtBottom = Math.abs(contentEl.scrollHeight - contentEl.scrollTop - contentEl.clientHeight) < 5;

      if (isAtBottom) {
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 150);
      } else {
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

  if (!part) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 group"
      >
        <span className="flex items-center gap-1">
          <Icon
            icon="mdi:brain"
            className={cn(
              'w-3.5 h-3.5',
              !isCompleted && 'animate-pulse',
            )}
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

        {hasContent && (
          <Icon
            icon="mdi:chevron-down"
            className={cn(
              'w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-all duration-150',
              isExpanded ? 'rotate-180' : 'rotate-0',
            )}
          />
        )}
      </button>

      {/* Content */}
      {isExpanded && hasContent && (
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="px-3 pb-3 pt-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-500 scrollbar-thumb-rounded-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(216 180 254) transparent',
          }}
        >
          <div className="opacity-60 [&_.markdown]:text-[11px] [&_.markdown]:leading-relaxed [&_p]:mb-1">
            {part?.text ? (
              <CustomMarkdown text={part.text} codeActive={false} minified />
            ) : part?.summary && Array.isArray(part.summary) ? (
              <div className="space-y-2">
                {part.summary.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-gray-300/30 dark:border-gray-600/30 pl-2">
                    <CustomMarkdown text={item} codeActive={false} minified />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ThinkingPartCard);
