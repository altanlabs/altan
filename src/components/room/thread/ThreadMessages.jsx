import { IconButton } from '@mui/material';
import { throttle } from 'lodash';
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  memo,
} from 'react';
import { Virtuoso } from 'react-virtuoso';

import Message from './Message.jsx';
import ExecutionDialogProvider from '../../../providers/ExecutionDialogProvider.jsx';
import {
  fetchThreadResource,
  selectThreadDrawerDetails,
  makeSelectSortedThreadMessageIds,
  selectCurrentDrawerThreadId,
  makeSelectMoreMessages,
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

const Footer = memo(() => (<div className="h-[170px]" />));
Footer.displayName = 'Footer';

const ThreadHeader = memo(({ isCreation, moreMessages, hasLoaded }) => (
  <div
    style={{
      paddingTop: isCreation ? '275px' : '85px',
      ...(!moreMessages || isCreation) && {
        height: 1,
      },
      paddingLeft: 15,
      paddingRight: 15,
    }}
  >
    {moreMessages && !isCreation && hasLoaded && (
      <>
        <ScrollSeekPlaceholder disableImage lines={lines[0]} />
        <ScrollSeekPlaceholder disableImage lines={lines[1]} />
      </>
    )}
  </div>
));
ThreadHeader.displayName = 'ThreadHeader';

/**
 * Optional: A separate memoized button to jump to bottom
 * so that only IT re-renders when `showButton` changes
 */
const ScrollToBottomButton = memo(({
  showButton,
  onClick,
}) => {
  if (!showButton) return null;
  return (
    <IconButton
      sx={{ position: 'absolute', bottom: 100, right: 15, zIndex: 999 }}
      onClick={onClick}
    >
      <Iconify icon="mdi:arrow-down" className="text-black dark:text-white" width={25} />
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
const ThreadMessages = ({ mode = 'main', hasLoaded, setHasLoaded, tId = null }) => {
  const isCreation = useIsCreation(mode);
  const moreMessagesSelector = useMemo(makeSelectMoreMessages, []);
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);

  const threadId = useThreadIdAtLocation(mode, tId);
  const moreMessages = useSelector((state) => moreMessagesSelector(state, threadId));
  const messageIds = useSelector((state) => messagesIdsSelector(state, threadId));
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
    } else if (mode === 'main' && !!hasLoaded) {
      scrollToBottom('instant');
    }
    hasLoadedRef.current = hasLoaded;
  }, [threadId, hasLoaded]);

  useEffect(() => {
    isCreationRef.current = isCreation;
  }, [isCreation]);

  const handleScroll = useMemo(() => throttle((e) => {
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
  }, 1000), [fetchMessages, isFetching, scrollToIndex]);

  // ----------------------------------------------
  // 4d) followOutput logic
  // Let Virtuoso auto-scroll if near bottom
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
        <div className="w-full flex flex-row items-center justify-center">
          <Message
            previousMessageId={index ? messageIds[index - 1] : null}
            messageId={mId}
            disableEndButtons={isCreation}
            threadId={threadId}
            mode={mode}
            scrollToMessage={setMessageToScroll}
          />
        </div>
      );
    },
    [mode, threadId, messageIds, isCreation],
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
      {!hasLoaded && !isCreation && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 px-10">
          <div className="max-w-[700px] w-full mx-auto">
            {[...Array(5)].map((_, index) => (
              <ScrollSeekPlaceholder key={`ph_${index}`} />
            ))}
          </div>
        </div>
      )}

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
                />
              ),
              Footer,
            }}
            onScroll={handleScroll}
          />
        )}
      </ExecutionDialogProvider>
    </>
  );
};

export default memo(ThreadMessages);
