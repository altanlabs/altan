import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { ThreadMessages } from './ThreadMessages';
import { getRoomPort } from '../../../di';
import { selectRoom } from '../../../redux/slices/room/selectors/roomSelectors';
import {
  selectMainThread,
} from '../../../redux/slices/room/selectors/threadSelectors';
import { addThread, setThreadMain } from '../../../redux/slices/room/slices/threadsSlice';
import { sendMessage } from '../../../redux/slices/room/thunks/messageThunks';
import { fetchThread, ensureThreadMessagesLoaded } from '../../../redux/slices/room/thunks/threadThunks';
import { useSelector, dispatch } from '../../../redux/store';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import { RoomPromptInput } from '../input/RoomPromptInput';


interface ThreadViewProps {
  threadId: string;
}

function ThreadView({ threadId }: ThreadViewProps): React.JSX.Element {
  const room = useSelector(selectRoom);
  const mainThread = useSelector(selectMainThread);
  const config = useRoomConfig();
  const [inputHeight, setInputHeight] = useState(120);
  const [isLoading, setIsLoading] = useState(false);

  const isMainThread = threadId === mainThread;
  const helmetName = isMainThread ? room?.name || 'Room' : `Thread | ${room?.name || 'Room'}`;

  console.log('🎬 ThreadView render', { 
    threadId, 
    mainThread,
    isMainThread,
    isLoading,
    roomId: room?.id 
  });

  // Fetch thread data when threadId changes (user switched threads)
  useEffect(() => {
    console.log('🔄 ThreadView useEffect triggered', { threadId });
    
    if (threadId === 'new') {
      console.log('⚪ ThreadId is "new" - skipping fetch');
      setIsLoading(false);
      return;
    }

    console.log('📡 Starting thread fetch for:', threadId);
    setIsLoading(true);
    
    dispatch(fetchThread({ threadId }))
      .then(() => {
        console.log('✅ fetchThread completed for:', threadId);
        return dispatch(ensureThreadMessagesLoaded(threadId));
      })
      .then(() => {
        console.log('✅ ensureThreadMessagesLoaded completed for:', threadId);
      })
      .catch((error) => {
        console.error('❌ Error in thread fetch:', error);
      })
      .finally(() => {
        console.log('🏁 Thread fetch flow finished for:', threadId);
        setIsLoading(false);
      });
  }, [threadId]);

  const handleSuggestionClick = async (suggestion: string) => {
    if (threadId === 'new') {
      // Create thread first, then send message
      try {
        // Create thread in DB
        const roomPort = getRoomPort();
        const newThread = await roomPort.createThread(config.roomId, {
          name: suggestion.substring(0, 50) || 'New Chat',
        });

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

export default ThreadView;