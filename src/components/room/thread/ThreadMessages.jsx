import { IconButton } from '@mui/material';
import { throttle } from 'lodash';
import React, { useRef, useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import Message from './Message.jsx';
import ThreadActionBar from './ThreadActionBar.jsx';
import ExecutionDialogProvider from '../../../providers/ExecutionDialogProvider.jsx';
import {
  fetchThreadResource,
  selectThreadDrawerDetails,
  makeSelectSortedThreadMessageIds,
  selectCurrentDrawerThreadId,
  makeSelectMoreMessages,
  selectMessagesById,
  selectMembers,
  selectMe,
  selectActiveResponsesByThread,
  makeSelectPlaceholderMessagesForThread,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import Iconify from '../../iconify/Iconify.jsx';
import ScrollSeekPlaceholder from '../skeletons/ScrollSeekPlaceholder.jsx';

// -----------------------------------------------------
// 3) Some small memoized components
// -----------------------------------------------------
const lines = [
  [
    [5, 5, 10, 5, 5, 5, 10],
    [20, 5, 10, 15, 15, 10],
    [15, 20, 20, 25],
    [10, 25, 25, 5],
  ],
  [
    [5, 15, 10, 10],
    [15, 15, 5, 15, 15, 5],
    [25, 20, 20, 5],
    [10, 15, 25, 5, 5, 5],
  ],
];

const increaseViewportBy = {
  bottom: 4000,
  top: 2000,
};

const Footer = memo(({ threadId, messageIds, renderFeedback = false, isStreaming = false, paddingBottom = 32 }) => {
  const messagesById = useSelector(selectMessagesById);
  const members = useSelector(selectMembers);

  // Get the last message and check if it's from an agent
  const lastMessageId = messageIds && messageIds.length > 0 ? messageIds[messageIds.length - 1] : null;
  const lastMessage = lastMessageId ? messagesById[lastMessageId] : null;
  const lastMessageSender = lastMessage ? members.byId[lastMessage.member_id] : null;
  const isLastMessageFromAgent = lastMessageSender?.member?.member_type === 'agent';

  return (
    <div style={{ paddingBottom: `${paddingBottom}px` }}>
      {/* Show ThreadActionBar if there are messages and not streaming */}
      {messageIds && messageIds.length > 0 && isLastMessageFromAgent && renderFeedback && !isStreaming && (
        <ThreadActionBar
          threadId={threadId}
          lastMessageId={lastMessageId}
          isAgentMessage={isLastMessageFromAgent}
        />
      )}
    </div>
  );
});
Footer.displayName = 'Footer';

const ThreadHeader = memo(({ isCreation, moreMessages, hasLoaded, isFetching }) => (
  <div
    style={{
      paddingTop: isCreation ? '275px' : '85px',
      ...((!moreMessages || isCreation) && {
        height: 1,
      }),
      paddingLeft: 15,
      paddingRight: 15,
    }}
  >
    {moreMessages && !isCreation && hasLoaded && isFetching && (
      <>
        <ScrollSeekPlaceholder
          disableImage
          lines={lines[1]}
        />
      </>
    )}
  </div>
));
ThreadHeader.displayName = 'ThreadHeader';

/**
 * Optional: A separate memoized button to jump to bottom
 * so that only IT re-renders when `showButton` changes
 */
const ScrollToBottomButton = memo(({ showButton, onClick }) => {
  if (!showButton) return null;
  return (
    <IconButton
      sx={{ position: 'absolute', bottom: 100, right: 15, zIndex: 999 }}
      onClick={onClick}
    >
      <Iconify
        icon="mdi:arrow-down"
        className="text-black dark:text-white"
        width={25}
      />
    </IconButton>
  );
});
ScrollToBottomButton.displayName = 'ScrollToBottomButton';

// -----------------------------------------------------
// 1) Define selectors outside so they don't get recreated
// -----------------------------------------------------
const selectIsCreation = (state) => selectThreadDrawerDetails(state).isCreation;

// -----------------------------------------------------
// 2) Custom Hooks
// -----------------------------------------------------
const useThreadIdAtLocation = (mode, threadId) => {
  const drawerCurrentId = useSelector(selectCurrentDrawerThreadId);
  return useMemo(() => {
    return mode === 'drawer' ? drawerCurrentId : threadId;
  }, [drawerCurrentId, mode, threadId]);
};

const useIsCreation = (mode) => {
  const isCreation = useSelector(selectIsCreation);
  return useMemo(() => mode === 'drawer' && isCreation, [isCreation, mode]);
};
// -----------------------------------------------------
// 4) The Main Component
// -----------------------------------------------------
const ThreadMessages = ({ mode = 'main', hasLoaded, setHasLoaded, tId = null, renderFeedback = false, footerPaddingBottom = 32 }) => {
  const isCreation = useIsCreation(mode);
  const moreMessagesSelector = useMemo(makeSelectMoreMessages, []);
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const placeholderMessagesSelector = useMemo(makeSelectPlaceholderMessagesForThread, []);

  const threadId = useThreadIdAtLocation(mode, tId);
  const moreMessages = useSelector((state) => moreMessagesSelector(state, threadId));
  const realMessageIds = useSelector((state) => messagesIdsSelector(state, threadId));
  const placeholderMessages = useSelector((state) => placeholderMessagesSelector(state, threadId));
  const messagesById = useSelector(selectMessagesById);
  const me = useSelector(selectMe);
  const activeResponses = useSelector((state) => selectActiveResponsesByThread(threadId)(state));
  
  // Merge real messages with placeholder messages
  const { messageIds, allMessagesById } = useMemo(() => {
    // Create a map for placeholder messages
    const placeholderMap = {};
    placeholderMessages.forEach(msg => {
      placeholderMap[msg.id] = msg;
    });
    
    // Get placeholder IDs
    const placeholderIds = placeholderMessages.map(p => p.id);
    // Combine real and placeholder IDs
    const combinedIds = [...realMessageIds, ...placeholderIds];
    
    // Merge messagesById with placeholder messages
    const combined = { ...messagesById, ...placeholderMap };
    
    return { 
      messageIds: combinedIds,
      allMessagesById: combined
    };
  }, [realMessageIds, placeholderMessages, messagesById]);
  
  // console.log('ThreadMessages render', mode, threadId, messageIds); // Keep for debugging, or remove

  // We only track "am I fetching?" in local state
  const [isFetching, setIsFetching] = useState(false);
  const [mustScroll, setMustScroll] = useState(false);

  // For scrolling to a specific message if needed
  const [, setMessageToScroll] = useState(null);

  // Instead of storing yPosition in component state, store in a ref
  // so that updating it on scroll doesn't cause entire re-renders.
  // We'll store a separate piece of state just for showing the "scroll down" button.
  const scrollStateRef = useRef({ top: false, bottom: true, semiBottom: true });
  const [showScrollDown, setShowScrollDown] = useState(false);

  const virtuosoRef = useRef(null);

  // ----------------------------------------------
  // 4a) Scrolling helpers
  // ----------------------------------------------
  const scrollToIndex = useCallback(
    (index, behavior = 'smooth') => {
      if (!virtuosoRef.current) return;
      virtuosoRef.current.scrollToIndex({
        index,
        behavior,
        align: 'end',
      });
    },
    [virtuosoRef],
  );

  const scrollToBottom = useCallback(
    (behavior = 'smooth') => {
      if (!messageIds.length) return;
      scrollToIndex(messageIds.length - 1, behavior);

      // Mark bottom as scrolled
      scrollStateRef.current = {
        top: false,
        bottom: true,
        semiBottom: true,
      };
      setShowScrollDown(false);

      if (!hasLoaded) {
        setTimeout(() => setHasLoaded(true), 500);
      }
    },
    [messageIds, scrollToIndex, hasLoaded, setHasLoaded],
  );

  // ----------------------------------------------
  // 4b) Fetch more messages (top scroll)
  // ----------------------------------------------
  const fetchMessages = useCallback(() => {
    if (isFetching || !moreMessages) {
      return Promise.reject('no more messages');
    }
    setIsFetching(true);
    return dispatch(fetchThreadResource({ threadId, resource: 'messages' }));
  }, [threadId, moreMessages, isFetching]);

  // ----------------------------------------------
  // 4c) Throttled scroll handler
  // We keep a stable reference to avoid re-renders
  // ----------------------------------------------
  // We rely on refs for isCreation, isFetching, etc. if needed
  const isCreationRef = useRef(isCreation);
  const hasLoadedRef = useRef(hasLoaded);

  useEffect(() => {
    if (!!mustScroll) {
      scrollToBottom('instant');
      setMustScroll(false);
    }
  }, [mustScroll]);

  useEffect(() => {
    if (messageIds.length === 1 && !!hasLoaded) {
      fetchMessages()
        .then(() => {
          setMustScroll(true);
        })
        .finally(() => {
          setTimeout(() => setIsFetching(false), 1000);
        });
    }
    // Removed auto-scroll on hasLoaded - only scroll when user sends message
    hasLoadedRef.current = hasLoaded;
  }, [threadId, hasLoaded, fetchMessages, messageIds.length]);

  // Ensure hasLoaded is set when messages are available
  useEffect(() => {
    if (messageIds.length > 0 && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [messageIds.length, hasLoaded, setHasLoaded]);

  useEffect(() => {
    isCreationRef.current = isCreation;
  }, [isCreation]);
  
  // Track message count and initialization to detect new messages only
  const prevMessageCountRef = useRef(messageIds.length);
  const isInitializedRef = useRef(false);
  
  // Detect when a NEW user message is sent and scroll to bottom
  useEffect(() => {
    if (messageIds.length > 0 && hasLoaded && mode === 'main') {
      const lastMessageId = messageIds[messageIds.length - 1];
      const lastMessage = allMessagesById[lastMessageId];
      const isUserMessage = lastMessage && lastMessage.member_id === me?.id;
      
      // Mark as initialized after first load
      if (!isInitializedRef.current && messageIds.length > 0) {
        isInitializedRef.current = true;
        prevMessageCountRef.current = messageIds.length;
        return; // Skip scroll logic on initial load
      }
      
      // Only scroll if message count increased and last message is from user
      const messageCountIncreased = messageIds.length > prevMessageCountRef.current;
      
      if (messageCountIncreased && isUserMessage && isInitializedRef.current) {
        // New user message was just sent - scroll to bottom
        setTimeout(() => {
          scrollToBottom('smooth');
        }, 50);
      }
      
      prevMessageCountRef.current = messageIds.length;
    }
  }, [messageIds, allMessagesById, me, hasLoaded, mode, scrollToBottom]);

  const handleScroll = useMemo(
    () =>
      throttle((e) => {
        // If we're in "creation" mode, we skip the scroll logic
        if (isCreationRef.current) return;

        const { scrollTop, clientHeight, scrollHeight } = e.target;
        const isTop = scrollTop <= 300;
        const isBottom = scrollHeight - scrollTop - clientHeight < 300;
        const isSemiBottom = scrollHeight - scrollTop - clientHeight < 1500;

        // Update our internal ref
        scrollStateRef.current = { top: isTop, bottom: isBottom, semiBottom: isSemiBottom };

        // If near top, fetch more messages
        if (isTop && !isFetching && hasLoadedRef.current) {
          fetchMessages()
            .then(() => {
              // If fetch is successful, scroll to the desired index
              scrollToIndex(25, 'instant');
            })
            .catch(() => {
              // Handle rejection here
            })
            .finally(() => {
              setTimeout(() => setIsFetching(false), 500);
            });
        }

        // If near bottom, hide the scroll-down button
        // If not near bottom, show it
        setShowScrollDown(!isBottom);
      }, 1000),
    [fetchMessages, isFetching, scrollToIndex],
  );

  // ----------------------------------------------
  // 4d) followOutput logic
  // Auto-scroll when near bottom
  // ----------------------------------------------
  const followOutput = useCallback(() => {
    const { bottom, semiBottom } = scrollStateRef.current;
    if ((bottom || semiBottom) && !isFetching) {
      return 'smooth';
    }
    return false;
  }, [isFetching]);

  // ----------------------------------------------
  // 4e) itemContent callback
  // ----------------------------------------------
  const renderItem = useCallback(
    (index, mId) => {
      if (!mId) return null;
      return (
        <div className="w-full flex justify-center">
          <Message
            previousMessageId={index ? messageIds[index - 1] : null}
            messageId={mId}
            disableEndButtons={isCreation}
            threadId={threadId}
            mode={mode}
            scrollToMessage={setMessageToScroll}
            allMessagesById={allMessagesById}
          />
        </div>
      );
    },
    [mode, threadId, messageIds, isCreation, allMessagesById],
  );

  // ----------------------------------------------
  // 4f) onBottomScroll

  // ----------------------------------------------
  const onBottomScroll = useCallback(() => {
    // If we're somewhat near bottom, use smooth. Otherwise, just jump instantly.
    const behavior = scrollStateRef.current.semiBottom ? 'smooth' : 'instant';
    scrollToBottom(behavior);
  }, [scrollToBottom]);

  // ----------------------------------------------
  // 4g) Render
  // ----------------------------------------------
  return (
    <>
      {/* Loading placeholder if not loaded and not creation */}


      {/* {!hasLoaded && !isCreation && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 px-10">
          <div className="max-w-[700px] w-full mx-auto">
            {[...Array(5)].map((_, index) => (
              <ScrollSeekPlaceholder key={`ph_${index}`} />
            ))}
          </div>
        </div>
      )} */}

      {/* Scroll to bottom button (memoized) */}
      <ScrollToBottomButton
        showButton={!!messageIds.length && showScrollDown}
        onClick={onBottomScroll}
      />

      {/* The virtuoso list */}
      <ExecutionDialogProvider>
        {!!messageIds.length && (
          <Virtuoso
            ref={virtuosoRef}
            data={messageIds}
            initialTopMostItemIndex={messageIds.length - 1}
            followOutput={followOutput}
            alignToBottom={false}
            overscan={15}
            increaseViewportBy={increaseViewportBy}
            defaultItemHeight={150}
            itemContent={renderItem}
            className="no-scrollbar"
            components={{
              Header: () => (
                <ThreadHeader
                  hasLoaded={hasLoaded}
                  moreMessages={moreMessages}
                  isCreation={isCreation}
                  isFetching={isFetching}
                />
              ),
              Footer: () => (
                <Footer
                  threadId={threadId}
                  messageIds={messageIds}
                  renderFeedback={renderFeedback}
                  isStreaming={activeResponses && activeResponses.length > 0}
                  paddingBottom={footerPaddingBottom}
                />
              ),
            }}
            onScroll={handleScroll}
          />
        )}
      </ExecutionDialogProvider>
    </>
  );
};

export default memo(ThreadMessages);
