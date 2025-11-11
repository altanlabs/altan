/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { setRoomContext, sendMessage, selectMainThread } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';

/**
 * Single source for URL state management
 * - Handle ?context, ?message params (NOT thread_id in ephemeral mode)
 * - One-time initialization
 * - No race conditions
 * - Clean URL after processing
 */
export function useRoomUrlState(roomId: string, initialized: boolean, ephemeralMode: boolean = false) {
  const location = useLocation();
  const history = useHistory();
  const mainThreadId = useSelector(selectMainThread);
  const [processedParams, setProcessedParams] = useState({
    context: false,
    message: false,
    threadId: false,
  });

  // In ephemeral mode, remove thread_id from URL on load
  useEffect(() => {
    if (!ephemeralMode || processedParams.threadId) return;

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('thread_id')) {
      searchParams.delete('thread_id');
      const newSearch = searchParams.toString();
      history.replace({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : '',
      });
    }
    setProcessedParams(prev => ({ ...prev, threadId: true }));
  }, [ephemeralMode, location.pathname, location.search, history, processedParams.threadId]);

  // Extract and store context from URL
  useEffect(() => {
    if (!initialized || !roomId || processedParams.context) return;

    const searchParams = new URLSearchParams(location.search);
    const context = searchParams.get('context');

    if (context) {
      // Store context in Redux
      dispatch(setRoomContext(decodeURIComponent(context)));

      // Clean up URL
      searchParams.delete('context');
      const newSearch = searchParams.toString();
      history.replace({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : '',
      });

      setProcessedParams(prev => ({ ...prev, context: true }));
    } else {
      setProcessedParams(prev => ({ ...prev, context: true }));
    }
  }, [initialized, roomId, location.search, location.pathname, history, processedParams.context]);

  // Handle message query parameter
  useEffect(() => {
    if (!initialized || !roomId || !mainThreadId || processedParams.message) return;

    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message');

    if (message) {
      // Send the message to main thread
      dispatch(
        sendMessage({
          threadId: mainThreadId,
          content: decodeURIComponent(message),
          attachments: [],
        }),
      );

      // Clean up URL
      searchParams.delete('message');
      const newSearch = searchParams.toString();
      history.replace({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : '',
      });

      setProcessedParams(prev => ({ ...prev, message: true }));
    } else {
      setProcessedParams(prev => ({ ...prev, message: true }));
    }
  }, [initialized, roomId, mainThreadId, location.search, location.pathname, history, processedParams.message]);

  // Reset when room changes
  useEffect(() => {
    setProcessedParams({ context: false, message: false });
  }, [roomId]);

  return {
    urlProcessed: processedParams.context && processedParams.message,
  };
}

