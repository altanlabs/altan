import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { memo, useMemo, useState, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { selectMessagePartsById, sendMessage } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';

const EASE = [0.4, 0, 0.2, 1];

// Selector that extracts error fields from either the part or message meta_data
const selectErrorPartFields = (state, partId) => {
  const part = selectMessagePartsById(state)[partId];
  if (!part) return null;

  // Try to get error from part first, then fallback to message meta_data
  const message = part.message_id ? state.room.messages.byId[part.message_id] : null;
  const messageMeta = message?.meta_data || {};

  return {
    error_code: part.error_code || messageMeta.error_code,
    error_message: part.error_message || messageMeta.error_message,
    error_type: part.error_type || messageMeta.error_type,
    failed_in: part.failed_in || messageMeta.failed_in,
    retryable: part.retryable ?? messageMeta.retryable,
    total_attempts: part.total_attempts || messageMeta.total_attempts,
    thread_id: part.thread_id || message?.thread_id,
    message_id: part.message_id || message?.id,
  };
};

const ErrorPartCard = ({ partId }) => {
  // Use a selector that only returns the fields we need
  const part = useSelector((s) => selectErrorPartFields(s, partId), shallowEqual);
  const [isExpanded, setIsExpanded] = useState(false);

  const onToggle = useMemo(() => () => setIsExpanded((v) => !v), []);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (part?.thread_id) {
      dispatch(sendMessage({
        content: 'continue',
        threadId: part.thread_id,
      }));
    }
  }, [part?.thread_id]);

  // Extract user-friendly error message
  const displayMessage = useMemo(() => {
    if (!part?.error_message) return 'An error occurred';

    // Try to extract the most relevant part of the error message
    const message = part.error_message;

    // If it's a nested error with quotes, try to extract the inner message
    const match = message.match(/'message': '([^']+)'/);
    if (match) return match[1];

    // Otherwise return the full message
    return message;
  }, [part?.error_message]);

  if (!part) return null;

  return (
    <m.div
      layout
      initial={false}
      className="w-full rounded-md bg-red-50/30 dark:bg-red-950/10 border-l-2 border-red-400 dark:border-red-600"
    >
      {/* Header */}
      <div className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs">
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex-1 flex items-center gap-1.5 group min-w-0"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0 opacity-70"
          />
          <span className="flex-1 text-left font-medium text-red-800 dark:text-red-200 truncate">
            {part.error_type || 'Error'}
          </span>
          {part.error_code && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100/60 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex-shrink-0">
              {part.error_code}
            </span>
          )}
          <m.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <Icon icon="mdi:chevron-down" className="w-3 h-3 text-red-600 dark:text-red-400" />
          </m.span>
        </button>
        {/* Retry button - always visible on the right */}
        <button
          onClick={handleRetry}
          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <Icon icon="mdi:refresh" className="w-3 h-3" />
          Retry
        </button>
      </div>

      {/* Content */}
      <m.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-2.5 pb-2 pt-0 space-y-1.5 text-xs">
          {/* Error message */}
          <div className="text-red-700 dark:text-red-300 leading-relaxed">
            {displayMessage}
          </div>

          {/* Additional details */}
          {(part.failed_in || part.total_attempts) && (
            <div className="flex flex-wrap gap-2 text-[11px] text-red-600/70 dark:text-red-400/70">
              {part.failed_in && (
                <div className="flex items-center gap-1">
                  <Icon icon="mdi:map-marker" className="w-2.5 h-2.5" />
                  <span>{part.failed_in}</span>
                </div>
              )}
              {part.total_attempts && (
                <div className="flex items-center gap-1">
                  <Icon icon="mdi:refresh" className="w-2.5 h-2.5" />
                  <span>{part.total_attempts} attempt{part.total_attempts > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Full error message if different from display message */}
          {displayMessage !== part.error_message && (
            <details className="text-[11px]">
              <summary className="cursor-pointer text-red-600/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                View full details
              </summary>
              <pre className="mt-1 p-1.5 rounded bg-red-100/40 dark:bg-red-900/10 text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre-wrap break-words">
                {part.error_message}
              </pre>
            </details>
          )}
        </div>
      </m.div>
    </m.div>
  );
};

export default memo(ErrorPartCard);
