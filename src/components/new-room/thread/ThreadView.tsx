import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { ThreadMessages } from './ThreadMessages';
import {
  selectRoom,
  selectMainThread,
  makeSelectSortedThreadMessageIds,
  sendMessage,
  addThread,
  setThreadMain,
  fetchThread,
  ensureThreadMessagesLoaded,
} from '../../../redux/slices/room';
import { useSelector, dispatch } from '../../../redux/store';
import { optimai_room } from '../../../utils/axios';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import { RoomPromptInput } from '../input/RoomPromptInput';

interface ThreadViewProps {
  threadId: string;
}

export function ThreadView({ threadId }: ThreadViewProps) {
  const room = useSelector(selectRoom);
  const mainThread = useSelector(selectMainThread);
  const config = useRoomConfig();
  const [inputHeight, setInputHeight] = useState(120);
  const [isLoading, setIsLoading] = useState(false);

  const isMainThread = threadId === mainThread;
  const helmetName = isMainThread ? room?.name || 'Room' : `Thread | ${room?.name || 'Room'}`;

  // Fetch thread data when threadId changes (user switched threads)
  useEffect(() => {
    if (threadId === 'new') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    dispatch(fetchThread({ threadId })).finally(() => {
      setIsLoading(false);
      dispatch(ensureThreadMessagesLoaded(threadId));
    });
  }, [threadId]);

  const handleSuggestionClick = async (suggestion: string) => {
    if (threadId === 'new') {
      // Create thread first, then send message
      try {
        // Create thread in DB
        const response = await optimai_room.post(`/v2/rooms/${config.roomId}/threads`, {
          name: suggestion.substring(0, 50) || 'New Chat',
        });
        const newThread = response.data;

        // Add to Redux and set as current
        dispatch(addThread(newThread));
        dispatch(setThreadMain({ current: newThread.id }));

        // Send message
        await dispatch(
          sendMessage({
            threadId: newThread.id,
            content: suggestion,
            attachments: [],
          }),
        );
      } catch (e) {
        console.error('Failed to create thread:', e);
      }
    } else {
      // Send to existing thread
      dispatch(
        sendMessage({
          threadId,
          content: suggestion,
          attachments: [],
        }),
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>{helmetName}</title>
      </Helmet>

      <div className="h-full flex flex-col relative">
        {/* Show loading ONLY when fetching existing thread */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState message="Loading thread..." />
          </div>
        ) : threadId === 'new' ? (
          /* Empty state ONLY for 'new' thread */
          <div
            className="flex-1 overflow-hidden flex items-center justify-center"
            style={{ paddingBottom: `${inputHeight + 40}px` }}
          >
            <EmptyState
              title={config.title}
              description={config.description}
              suggestions={config.suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        ) : (
          /* Messages for existing threads */
          <div
            className="flex-1 overflow-y-auto"
            style={{ paddingTop: '20px' }}
          >
            <ThreadMessages
              key={threadId}
              threadId={threadId}
            />
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="absolute bottom-2 left-0 right-0 px-2 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm">
          <RoomPromptInput
            threadId={threadId}
            roomId={config.roomId}
            onHeightChange={setInputHeight}
            renderCredits={config.renderCredits ?? false}
          />
        </div>
      </div>
    </>
  );
}
