import { throttle } from 'lodash';
import { useCallback, useMemo, useState, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Button } from '@/components/ui/button';

import {
  makeSelectSortedThreadMessageIds,
  selectMessagesById,
  fetchThreadResource,
  makeSelectMoreMessages,
  makeSelectPlaceholderMessagesForThread,
} from '../../../redux/slices/room';
import { useSelector, dispatch } from '../../../redux/store';
import Message from '../../room/thread/Message.jsx';
import { SCROLL_THRESHOLDS } from '../constants/room.constants';
// Reuse legacy Message component temporarily (handles parts, thinking, tools)

// --- Icon Components ---
const ArrowDownIcon = () => (
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
export function ThreadMessages({ threadId }: ThreadMessagesProps) {
  // CRITICAL: If threadId is 'new', return empty immediately - no selectors
  if (threadId === 'new') {
    return null;
  }

  // Selectors
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const realMessageIds = useSelector((state) => {
    try {
      return messagesIdsSelector(state, threadId) || [];
    } catch (error) {
      return [];
    }
  });
  const messagesById = useSelector(selectMessagesById);

  // Placeholder messages selector
  const placeholderMessagesSelector = useMemo(makeSelectPlaceholderMessagesForThread, []);
  const placeholderMessages = useSelector((state) => placeholderMessagesSelector(state, threadId));

  // Merge real messages with placeholder messages
  const { messageIds, allMessagesById } = useMemo(() => {
    // Create a set of response_ids that have real messages
    const realResponseIds = new Set(
      Object.values(messagesById)
        .filter((msg) => msg.response_id)
        .map((msg) => msg.response_id),
    );

    // Filter out placeholders that have a corresponding real message
    const validPlaceholders = placeholderMessages.filter(
      (placeholder) => !realResponseIds.has(placeholder.response_id),
    );

    // Create a map for valid placeholder messages
    const placeholderMap: Record<string, any> = {};
    validPlaceholders.forEach((msg) => {
      placeholderMap[msg.id] = msg;
    });

    // Get valid placeholder IDs
    const placeholderIds = validPlaceholders.map((p) => p.id);
    
    // Combine real and placeholder IDs
    const combinedIds = [...realMessageIds, ...placeholderIds];

    // Merge messagesById with placeholder messages
    const combined = { ...messagesById, ...placeholderMap };

    return {
      messageIds: combinedIds,
      allMessagesById: combined,
    };
  }, [realMessageIds, placeholderMessages, messagesById]);

  // Check if there are more messages to load
  const moreMessagesSelector = useMemo(makeSelectMoreMessages, []);
  const moreMessages = useSelector((state) => moreMessagesSelector(state, threadId));

  // State
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const virtuosoRef = useRef<any>(null);

  // Fetch more messages
  const fetchMoreMessages = useCallback(() => {
    if (isFetching || !moreMessages) return Promise.reject('no more');

    setIsFetching(true);
    return dispatch(fetchThreadResource({ threadId, resource: 'messages' })).finally(() => {
      setTimeout(() => setIsFetching(false), 500);
    });
  }, [threadId, isFetching, moreMessages]);

  // Scroll handling with pagination
  const handleScroll = useCallback(
    throttle((e: any) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      const isTop = scrollTop < SCROLL_THRESHOLDS.TOP;
      const isBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLDS.BOTTOM;

      setShowScrollDown(!isBottom);

      // Fetch more when scrolling to top
      if (isTop && !isFetching && moreMessages) {
        fetchMoreMessages();
      }
    }, 1000),
    [isFetching, moreMessages, fetchMoreMessages],
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
        initialTopMostItemIndex={messageIds.length > 0 ? messageIds.length - 1 : 0}
        followOutput="smooth"
        alignToBottom={false}
        overscan={15}
        itemContent={renderItem}
        onScroll={handleScroll}
        className="no-scrollbar"
        components={{
          Footer: () => <div style={{ height: '200px' }} />
        }}
      />
    </div>
  );
}
