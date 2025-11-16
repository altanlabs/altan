/**
 * Hook for handling initial message from idea parameter
 * Single Responsibility: Initial message sending logic
 */

import { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { dispatch } from '../../../../redux/store';
import { sendMessage } from '../../../../redux/slices/room/thunks/messageThunks';
import { optimai } from '../../../../utils/axios';
import type { Altaner } from '../types';

export function useInitialMessage(altaner: Altaner | null, mainThreadId: string | null): void {
  const history = useHistory();
  const location = useLocation();
  const initialMessageSentRef = useRef(false);

  useEffect(() => {
    const fetchAndSendIdea = async () => {
      const params = new URLSearchParams(location.search);
      const ideaId = params.get('idea');
      
      if (!ideaId || initialMessageSentRef.current || !altaner?.room_id || !mainThreadId) {
        return;
      }

      initialMessageSentRef.current = true;

      try {
        const response = await optimai.get(`/idea/${ideaId}`);
        const ideaData = response.data;

        const prompt = ideaData.idea || '';
        const attachments = ideaData.attachments || [];

        if (prompt) {
          await dispatch(
            sendMessage({
              content: prompt,
              attachments,
              threadId: mainThreadId,
            }),
          );

          const newParams = new URLSearchParams(location.search);
          newParams.delete('idea');
          const newSearch = newParams.toString();
          history.replace({
            pathname: location.pathname,
            search: newSearch ? `?${newSearch}` : '',
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch or send idea:', error);
      }
    };

    fetchAndSendIdea();
  }, [altaner?.room_id, mainThreadId, location.search, history, location.pathname]);
}
