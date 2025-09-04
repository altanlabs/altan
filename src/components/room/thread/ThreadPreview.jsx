import { memo, useMemo, useEffect, useRef } from 'react';
import { createSelector } from '@reduxjs/toolkit';

import {
  makeSelectSortedThreadMessageIds,
  selectMessagesById,
} from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import { TextShimmer } from '../../aceternity/text/text-shimmer.tsx';
import MessageMinified from './MessageMinified.jsx';

// Selector to get the last few messages from a thread
const makeSelectRecentMessages = () =>
  createSelector(
    [makeSelectSortedThreadMessageIds(), selectMessagesById],
    (messageIds, messagesById) => {
      if (!messageIds || messageIds.length === 0) return [];

      // Get last 2 messages for streaming view
      const recentIds = messageIds.slice(-2);
      return recentIds.map((id) => messagesById[id]).filter(Boolean);
    },
  );


const ThreadPreview = ({ threadId, className = '' }) => {
  const recentMessagesSelector = useMemo(makeSelectRecentMessages, []);
  const recentMessages = useSelector((state) => recentMessagesSelector(state, threadId));
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentMessages]);

  if (!threadId || !recentMessages || recentMessages.length === 0) {
    return (
      <div className={`px-2 py-1.5 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse"></div>
          <span className="text-xs opacity-75">Initializing...</span>
        </div>
      </div>
    );
  }

  const latestMessage = recentMessages[recentMessages.length - 1];

  return (
    <div
      className={`bg-gray-50/30 dark:bg-gray-900/30 rounded-md border border-gray-200/20 dark:border-gray-700/20 ${className}`}
    >
      <div
        ref={scrollRef}
        className="px-2 py-2 space-y-1 max-h-32 overflow-y-auto scrollbar-none"
      >
        {recentMessages.map((message, index) => (
          <div key={message.id} className="mb-1 last:mb-0">
            <MessageMinified message={message} />
          </div>
        ))}
      </div>

      {/* Subtle indicator for active streaming */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent dark:via-blue-900/20">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
          <div
            className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 opacity-60">live</span>
      </div>
    </div>
  );
};

export default memo(ThreadPreview);
