/* global setTimeout */
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Button } from '@/components/ui/button';

import { makeSelectPlaceholderMessagesForThread } from '../../../redux/slices/room/selectors/lifecycleSelectors';
import { selectMessagesById } from '../../../redux/slices/room/selectors/messageSelectors';
import {
  makeSelectSortedThreadMessageIds,
  makeSelectMoreMessages,
} from '../../../redux/slices/room/selectors/threadSelectors';
import { fetchThreadResource } from '../../../redux/slices/room/thunks/threadThunks';
import { useSelector, dispatch } from '../../../redux/store';
import Message from '../components/Message.jsx';
import { SCROLL_THRESHOLDS } from '../constants/room.constants';

// --- Icon Components ---
const ArrowDownIcon = (): React.JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

// --- Loading Indicator Component ---
const LoadingIndicator = (): React.JSX.Element => (
  <div className="w-full flex justify-center py-6">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
      <span>Loading more messages...</span>
    </div>
  </div>
);

interface ThreadMessagesProps {
  threadId: string;
}

/**
 * Thread Messages Component
 *
 * Replaces: ThreadMessages.jsx (506 lines)
 *
 * Major improvements:
 * - Move message merging to Redux selector (done in Redux)
 * - Remove 6 refs (scrollStateRef, isCreationRef, hasLoadedRef, etc.)
 * - Use proper state management
 * - Simplify scroll logic
 * - Target: ~200-250 lines
 */
export function ThreadMessages({ threadId }: ThreadMessagesProps): React.JSX.Element | null {
  // Selectors
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const realMessageIds = useSelector((state) => messagesIdsSelector(state, threadId) || []);
  const messagesById = useSelector(selectMessagesById);

  // Placeholder messages selector
  const placeholderMessagesSelector = useMemo(makeSelectPlaceholderMessagesForThread, []);
  const placeholderMessages = useSelector((state) => placeholderMessagesSelector(state, threadId));

  // Merge real messages with placeholder messages
  const { messageIds, allMessagesById } = useMemo(() => {
    // Fallback: if selector returns no IDs but messages exist in Redux,
    // derive IDs directly from messagesById using thread_id.
    let effectiveRealIds = realMessageIds;
    if (effectiveRealIds.length === 0 && Object.keys(messagesById || {}).length > 0) {
      const derivedIds =
        Object.values(messagesById || {})
          .filter((msg: any) => msg.thread_id === threadId)
          .map((msg: any) => msg.id)
          .filter(Boolean);

      effectiveRealIds = derivedIds;
    }

    // Create a set of response_ids that have real messages
    const realResponseIds = new Set(
      Object.values(messagesById || {})
        .filter((msg: any) => msg.response_id)
        .map((msg: any) => msg.response_id),
    );

    // Filter out placeholders that have a corresponding real message
    const validPlaceholders = placeholderMessages.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (placeholder: any) => !realResponseIds.has(placeholder.response_id),
    );

    // Create a map for valid placeholder messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeholderMap: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validPlaceholders.forEach((msg: any) => {
      placeholderMap[msg.id] = msg;
    });

    // Get valid placeholder IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeholderIds = validPlaceholders.map((p: any) => p.id);

    // Combine real and placeholder IDs
    const combinedIds = [...effectiveRealIds, ...placeholderIds];

    // Merge messagesById with placeholder messages
    const combined = { ...messagesById, ...placeholderMap };

    return {
      messageIds: combinedIds,
      allMessagesById: combined,
    };
  }, [realMessageIds, placeholderMessages, messagesById, threadId]);

  // Check if there are more messages to load
  const moreMessagesSelector = useMemo(makeSelectMoreMessages, []);
  const moreMessages = useSelector((state) => moreMessagesSelector(state, threadId));

  // State
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const virtuosoRef = useRef<any>(null);
  const firstItemIndex = 10000; // Start high for prepending

  // Fetch more messages
  const fetchMoreMessages = useCallback(() => {
    if (isFetching || !moreMessages) {
      return Promise.reject('no more');
    }

    setIsFetching(true);
    return dispatch(fetchThreadResource({ threadId, resource: 'messages' }))
      .finally(() => {
        // Small delay to show loading state
        setTimeout(() => setIsFetching(false), 300);
      });
  }, [threadId, isFetching, moreMessages]);

  // Trigger load when near top
  const handleAtTopStateChange = useCallback((atTop: boolean) => {
    if (atTop && !isFetching && moreMessages) {
      void fetchMoreMessages();
    }
  }, [isFetching, moreMessages, fetchMoreMessages]);

  // Scroll handling for scroll-down button
  const handleScroll = useCallback(
    throttle((e: any) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      const isBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLDS.BOTTOM;
      setShowScrollDown(!isBottom);
    }, 200),
    [],
  );

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (virtuosoRef.current && messageIds.length > 0) {
      virtuosoRef.current.scrollToIndex({
        index: messageIds.length - 1,
        behavior: 'smooth',
        align: 'end',
      });
    }
    setShowScrollDown(false);
  }, [messageIds.length]);

  // Render message item (reusing legacy Message component)
  const renderItem = useCallback(
    (index: number, messageId: string) => {
      if (!messageId) return null;

      return (
        <div className="w-full flex justify-center">
          <Message
            previousMessageId={index > 0 ? messageIds[index - 1] : null}
            messageId={messageId}
            disableEndButtons={false}
            threadId={threadId}
            mode="main"
            scrollToMessage={() => {}}
            allMessagesById={allMessagesById}
          />
        </div>
      );
    },
    [messageIds, threadId, allMessagesById],
  );

  // Header component with loading indicator
  const Header = useCallback(() => {
    if (!moreMessages) return null;
    
    return isFetching ? <LoadingIndicator /> : <div style={{ height: '1px' }} />;
  }, [isFetching, moreMessages]);

  // CRITICAL: If threadId is 'new', return empty immediately
  if (threadId === 'new') {
    return null;
  }

  if (messageIds.length === 0) {
    return null;
  }

  return (
    <div className="relative h-full w-full">
      {/* Scroll to bottom button */}
      {showScrollDown && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="outline"
          className="absolute bottom-24 right-4 z-50 rounded-full shadow-lg"
        >
          <ArrowDownIcon />
        </Button>
      )}

      {/* Messages List */}
      <Virtuoso
        ref={virtuosoRef}
        data={messageIds}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={firstItemIndex + messageIds.length - 1}
        followOutput="smooth"
        alignToBottom={false}
        overscan={{ main: 15, reverse: 15 }}
        itemContent={(index, messageId) => renderItem(index - firstItemIndex, messageId)}
        onScroll={handleScroll}
        atTopStateChange={handleAtTopStateChange}
        atTopThreshold={SCROLL_THRESHOLDS.TOP}
        className="no-scrollbar"
        components={{
          Header,
          Footer: () => <div style={{ height: '200px' }} />
        }}
      />
    </div>
  );
}
