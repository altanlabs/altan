import { createSelector } from '@reduxjs/toolkit';
import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import RoomDetailsSection from './RoomDetailsSection.jsx';
import ThreadMessages from './ThreadMessages.jsx';
import useResponsive from '../../../hooks/useResponsive';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
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
  const isCreation = mode === 'drawer' && drawer.isCreation;
  const messageId = mode === 'drawer' && isCreation ? drawer.messageId : null;

  const manageSubscription = useCallback(
    (threadId) => {
      if (threadId) {
        subscribe(`thread:${threadId}`); // , () => dispatch(readThread({ threadId })));
      }
    },
    [subscribe],
  );

  // INITIALIZATION LOGIC
  useEffect(() => {
    if (!!threadId && threadId !== lastThreadId && !isCreation && !!isOpen) {
      setLastThreadId(threadId);

      dispatch(fetchThread({ threadId }))
        .then((response) => {
          if (!response) {
            history.replace('/404');
          } else {
            manageSubscription(threadId);
            setTimeout(() => setHasLoaded(true), 1500);
          }
        })
        .catch((error) => {
          console.error('error: fetching thread:', error);
          history.replace('/404');
        });
    } else if (!threadId || isCreation) {
      // If no threadId or in creation mode, mark as loaded immediately
      // so empty state can show
      setHasLoaded(true);
    }
  }, [threadId, isCreation, isOpen]);

  useEffect(() => {
    if (isOpen && threadId) {
      manageSubscription(threadId);
      return () => {
        unsubscribe(`thread:${threadId}`, () => dispatch(readThread({ threadId })));
      };
    }
  }, [isOpen, threadId]);

  // Get message IDs to check if the thread has messages
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const messageIds = useSelector((state) => messagesIdsSelector(state, threadId));
  const hasMessages = messageIds && messageIds.length > 0;
  return (
    <>
      {/* Main container with flex layout for proper centering in empty state */}
      <div
        className="h-full ml-2"
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
            paddingBottom: isMobile && !hideInput ? '100px' : '0px',
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
          {!hasMessages && mode !== 'drawer' && (
            <div className="text-center mb-8 flex-shrink-0">
              <h1 className="text-3xl font-normal text-gray-800 dark:text-gray-200">
                {room?.meta_data?.title || 'How can I help?'}
              </h1>
            </div>
          )}
          {!hideInput &&
            (isMobile ? (
              <div
                className="fixed bottom-0 left-0 right-0"
                style={{
                  zIndex: 1000,
                  transform: 'translate3d(0, 0, 0)',
                  WebkitTransform: 'translate3d(0, 0, 0)',
                }}
              >
                <FloatingTextArea
                  threadId={threadId}
                  messageId={isCreation ? messageId || 'orphan_thread' : null}
                  containerRef={containerRef}
                  roomId={room?.id}
                  mode="mobile"
                />
              </div>
            ) : (
              <div className="flex justify-center w-full max-w-4xl mx-auto mb-2">
                <div className="w-full">
                  <FloatingTextArea
                    threadId={threadId}
                    messageId={isCreation ? messageId || 'orphan_thread' : null}
                    containerRef={containerRef}
                    roomId={room?.id}
                    mode="standard"
                  />
                </div>
              </div>
            ))}
          {!hideInput && !hasMessages && mode !== 'drawer' && (
            <div className="w-full max-w-4xl mx-auto px-4">
              <RoomDetailsSection room={room} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(Thread);
