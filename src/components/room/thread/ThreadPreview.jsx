import { memo, useMemo, useEffect, useRef } from 'react';
import { createSelector } from '@reduxjs/toolkit';

import { makeSelectSortedThreadMessageIds, selectMessagesById, makeSelectMessageContent } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import { TextShimmer } from '../../aceternity/text/text-shimmer.tsx';

// Selector to get the last few messages from a thread with content
const makeSelectRecentMessagesWithContent = () =>
  createSelector(
    [makeSelectSortedThreadMessageIds(), selectMessagesById],
    (messageIds, messagesById) => {
      if (!messageIds || messageIds.length === 0) return [];
      
      // Get last 2-3 messages for streaming view
      const recentIds = messageIds.slice(-2);
      return recentIds.map(id => messagesById[id]).filter(Boolean);
    }
  );

const StreamingMessage = memo(({ message, isLatest }) => {
  const contentSelector = useMemo(() => makeSelectMessageContent(), []);
  const content = useSelector((state) => contentSelector(state, message?.id));
  
  // Clean content by removing mention annotations
  const cleanContent = content?.replace(/\[@([^\]]+)\]\([^)]+\)/g, '@$1') || '';
  
  if (!cleanContent) return null;

  return (
    <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
      {isLatest ? (
        <TextShimmer
          className="inline"
          duration={3}
        >
          {cleanContent}
        </TextShimmer>
      ) : (
        <span className="opacity-75">{cleanContent}</span>
      )}
    </div>
  );
});

const ThreadPreview = ({ threadId, className = '' }) => {
  const recentMessagesSelector = useMemo(makeSelectRecentMessagesWithContent, []);
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
    <div className={`bg-gray-50/30 dark:bg-gray-900/30 rounded-md border border-gray-200/20 dark:border-gray-700/20 ${className}`}>
      <div 
        ref={scrollRef}
        className="px-2 py-2 space-y-1.5 max-h-24 overflow-y-auto scrollbar-none"
      >
        {recentMessages.map((message, index) => (
          <StreamingMessage
            key={message.id}
            message={message}
            isLatest={message.id === latestMessage?.id}
          />
        ))}
      </div>
      
      {/* Subtle indicator for active streaming */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent dark:via-blue-900/20">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 opacity-60">live</span>
      </div>
    </div>
  );
};

export default memo(ThreadPreview);
