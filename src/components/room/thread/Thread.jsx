import { createSelector } from '@reduxjs/toolkit';
import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory, useParams } from 'react-router-dom';

import ThreadMessages from './ThreadMessages.jsx';
import useResponsive from '../../../hooks/useResponsive';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import { selectGate } from '../../../redux/slices/gate';
import {
  fetchThread,
  makeSelectThread,
  readThread,
  selectRoom,
  selectThreadDrawerDetails,
  makeSelectSortedThreadMessageIds,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import FloatingTextArea from '../../FloatingTextArea.jsx';

const makeSelectThreadById = () =>
  createSelector(
    [makeSelectThread()],
    (thread) => {
      if (!thread) {
        return thread;
      }
      return {
        is_main: thread.is_main,
        name: thread.name,
        id: thread.id,
      };
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    },
  );

const Thread = ({ mode = 'main', tId = null, containerRef = null, hideInput = false }) => {
  const { gateId } = useParams();
  const history = useHistory();
  const { isOpen, subscribe, unsubscribe } = useWebSocket();
  const [lastThreadId, setLastThreadId] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const room = useSelector(selectRoom);
  const drawer = useSelector(selectThreadDrawerDetails);
  const isMobile = useResponsive('down', 'md');

  const threadSelector = useMemo(makeSelectThreadById, []);
  const thread = useSelector((state) =>
    threadSelector(state, mode === 'drawer' ? drawer.current : tId),
  );
  const threadId = thread?.id;
  const gate = useSelector(selectGate);
  const isCreation = mode === 'drawer' && drawer.isCreation;
  const messageId = mode === 'drawer' && isCreation ? drawer.messageId : null;

  // Debug logging for Thread component state
  console.log('🧵 === THREAD COMPONENT DEBUG ===');
  console.log('🧵 Mode:', mode);
  console.log('🧵 ThreadId:', threadId);
  console.log('🧵 LastThreadId:', lastThreadId);
  console.log('🧵 HasLoaded:', hasLoaded);
  console.log('🧵 IsCreation:', isCreation);
  console.log('🧵 WebSocket isOpen:', isOpen);
  console.log('🧵 Room:', room?.id);
  console.log('🧵 Thread object:', thread);

  const manageSubscription = useCallback(
    (threadId) => {
      if (threadId) {
        subscribe(`thread:${threadId}`);
      }
    },
    [subscribe],
  );

  // INITIALIZATION LOGIC
  useEffect(() => {
    console.log('🧵 === THREAD INITIALIZATION EFFECT ===');
    console.log('🧵 ThreadId:', threadId);
    console.log('🧵 LastThreadId:', lastThreadId);
    console.log('🧵 IsCreation:', isCreation);
    console.log('🧵 WebSocket isOpen:', isOpen);
    console.log(
      '🧵 Should fetch thread?',
      !!threadId && threadId !== lastThreadId && !isCreation && !!isOpen,
    );

    if (!!threadId && threadId !== lastThreadId && !isCreation && !!isOpen) {
      console.log('🧵 Fetching thread:', threadId);
      setLastThreadId(threadId);
      setHasLoaded(false); // Reset loading state

      dispatch(fetchThread({ threadId }))
        .then((response) => {
          console.log('🧵 fetchThread response:', response);
          if (!response) {
            console.log('🧵 No response, redirecting to 404');
            history.replace('/404');
          } else {
            console.log('🧵 Thread fetched successfully, managing subscription');
            manageSubscription(threadId);
            console.log('🧵 Setting hasLoaded to true in 1.5s');
            setTimeout(() => {
              console.log('🧵 Setting hasLoaded to true NOW');
              setHasLoaded(true);
            }, 1500);
          }
        })
        .catch((error) => {
          console.error('🧵 Error fetching thread:', error);
          history.replace('/404');
        });
    } else if (!threadId || isCreation) {
      console.log('🧵 No threadId or in creation mode, setting hasLoaded to true immediately');
      // If no threadId or in creation mode, mark as loaded immediately
      // so empty state can show
      setHasLoaded(true);
    } else {
      console.log('🧵 Conditions not met for thread fetch, current state:', {
        hasThreadId: !!threadId,
        isDifferentThread: threadId !== lastThreadId,
        notCreation: !isCreation,
        websocketOpen: !!isOpen,
      });
    }
  }, [threadId, isCreation, isOpen]);

  useEffect(() => {
    console.log('🧵 === WEBSOCKET SUBSCRIPTION EFFECT ===');
    console.log('🧵 WebSocket isOpen:', isOpen);
    console.log('🧵 ThreadId:', threadId);
    if (isOpen && threadId) {
      console.log('🧵 Managing subscription for thread:', threadId);
      manageSubscription(threadId);
      return () => {
        console.log('🧵 Unsubscribing from thread:', threadId);
        unsubscribe(`thread:${threadId}`, () => dispatch(readThread({ threadId })));
      };
    } else {
      console.log('🧵 Not managing subscription - isOpen:', isOpen, 'threadId:', threadId);
    }
  }, [isOpen, threadId]);

  const helmetName = thread?.is_main
    ? room?.name || 'Room'
    : `${thread?.name || 'Thread'} | ${room?.name || 'Room'}`;

  // Get message IDs to check if the thread has messages
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const messageIds = useSelector((state) => messagesIdsSelector(state, threadId));
  const hasMessages = messageIds && messageIds.length > 0;
  return (
    <>
      <Helmet>
        <title>
          {helmetName} |{' '}
          {gateId && !!gate?.account?.company?.name ? gate?.account?.company?.name : 'Altan'}
        </title>
      </Helmet>
      {/* Main container with flex layout for proper centering in empty state */}
      <div
        className="h-full"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          ...(!hasMessages && mode !== 'drawer'
            ? {
                justifyContent: 'center',
                alignItems: 'center',
              }
            : {}),
        }}
      >
        {/* Thread messages container - always show unless explicitly no messages in main mode */}
        <div
          style={{
            height: mode === 'drawer' ? 'calc(100% - 100px)' : '100%',
            overflowY: 'auto',
            position: 'relative',
            width: '100%',
            // Add bottom padding for mobile to account for floating text area
            paddingBottom: isMobile && hideInput ? '120px' : '0px',
            // Only hide if we're certain there are no messages AND not in drawer mode
            ...(!hasMessages && mode !== 'drawer' ? { display: 'none' } : {}),
          }}
          className="no-scrollbar"
        >
          <ThreadMessages
            mode={mode}
            tId={tId}
            hasLoaded={hasLoaded}
            setHasLoaded={setHasLoaded}
          />
        </div>

        {/* Input container - positioned at bottom or centered in empty state */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            ...(mode === 'drawer' ? { marginTop: 'auto' } : {}),
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 flex items-center flex-col overflow-hidden z-0 transition-all duration-300 px-2 py-2">
            {!hasMessages && mode !== 'drawer' && (
              <div className="text-center mb-8 flex-shrink-0">
                <h1 className="text-3xl font-normal text-gray-800 dark:text-gray-200">
                  {room?.meta_data?.title || 'How can I help?'}
                </h1>
              </div>
            )}
            {!hideInput && (
              <FloatingTextArea
                threadId={threadId}
                messageId={isCreation ? messageId || 'orphan_thread' : null}
                containerRef={containerRef}
                roomId={room?.id}
                mode="standard"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Thread);
