import { Icon } from '@iconify/react';
import { memo, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';

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
    streamingChunks: part.streamingChunks,
  };
};

const ThinkingPartCard = ({ partId }) => {
  const part = useSelector((s) => selectThinkingPartFields(s, partId), shallowEqual);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
  const contentRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const isCompleted = part?.is_done || part?.status === 'completed';

  // Split text for streaming animation
  const { mainText, animatedChunk } = useMemo(() => {
    const isStreaming = !part?.is_done;
    const chunks = part?.streamingChunks || [];

    if (isStreaming && chunks.length > 0) {
      if (chunks.length === 1) {
        return { mainText: '', animatedChunk: chunks[0] };
      }
      const allButLast = chunks.slice(0, -1).join('');
      const last = chunks[chunks.length - 1];
      return { mainText: allButLast, animatedChunk: last };
    }

    return { mainText: part?.text || '', animatedChunk: null };
  }, [part?.text, part?.streamingChunks, part?.is_done]);

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
  }, [mainText, animatedChunk, part?.summary]);

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

  const headerText = useMemo(() => {
    if (duration) {
      return isExpanded ? `Thought for ${duration}s` : `Thought for ${duration}s`;
    }
    return 'Thinking…';
  }, [duration, isExpanded]);

  // Check if text is long enough to need fade
  const needsFade = headerText.length > 40;

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
    <div className="w-full my-0.5">
      <div className={`group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150 ${isExpanded ? 'w-full' : 'inline-flex max-w-full'}`}>
        {/* Header */}
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          className={`inline-flex items-center gap-1.5 px-2 py-1 select-none relative min-w-0 ${isExpanded ? 'w-full' : ''}`}
        >
          {/* Expand Icon */}
          <Icon
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-all"
          />

          {/* Brain Icon */}
          <Icon
            icon="mdi:brain"
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 text-[10px] flex-shrink-0 transition-colors"
          />

          {/* Status Icon - just icon when collapsed */}
          {!isCompleted && !isExpanded && (
            <Icon
              icon="svg-spinners:ring-resize"
              className="text-[11px] flex-shrink-0 text-blue-500"
            />
          )}

          {/* Text Display - with optional fade when collapsed */}
          {!isExpanded && (
            <div className="min-w-0 max-w-md overflow-hidden">
              {!isCompleted ? (
                <TextShimmer
                  className="text-[10px] block whitespace-nowrap"
                  style={needsFade ? {
                    maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                  } : {}}
                >
                  {headerText}
                </TextShimmer>
              ) : (
                <span
                  className="text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-[10px] transition-colors block whitespace-nowrap"
                  style={needsFade ? {
                    maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                  } : {}}
                >
                  {headerText}
                </span>
              )}
            </div>
          )}

          {/* Text Display - full when expanded */}
          {isExpanded && (
            <>
              {!isCompleted ? (
                <TextShimmer className="text-[10px]">
                  {headerText}
                </TextShimmer>
              ) : (
                <span className="text-gray-700 dark:text-gray-300 text-[10px]">
                  {headerText}
                </span>
              )}
            </>
          )}

          {/* Spacer when expanded */}
          {isExpanded && <div className="flex-1" />}
        </button>

        {/* Content */}
        {isExpanded && hasContent && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="px-3 py-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full bg-gray-50/50 dark:bg-gray-900/50"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
              }}
            >
              <div className="text-gray-600 dark:text-gray-400 [&_.markdown]:text-[10px] [&_.markdown]:leading-relaxed [&_p]:mb-1">
                {(mainText || animatedChunk) ? (
                  <CustomMarkdown text={mainText} animatedSuffix={animatedChunk} codeActive={false} minified />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ThinkingPartCard);
