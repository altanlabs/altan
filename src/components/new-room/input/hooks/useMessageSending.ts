import { useCallback } from 'react';

import type { SnackbarMessage, VariantType } from '@/components/snackbar';
import { getRoomPort } from '@/di';
import { addThread, setThreadMain } from '@/redux/slices/room/slices/threadsSlice';
import { sendMessage } from '@/redux/slices/room/thunks/messageThunks';
import { dispatch } from '@/redux/store';

interface Attachment {
  file_name: string;
  mime_type: string;
  url?: string;
}

interface MessageContent {
  content: string;
  attachments: Attachment[];
}

interface UseMessageSendingProps {
  threadId: string;
  roomId: string;
  roomContext?: string;
  enqueueSnackbar: (message: SnackbarMessage, options?: { variant?: VariantType }) => void;
}

interface UseMessageSendingReturn {
  sendMessageContent: (messageContent: MessageContent) => Promise<void>;
  createNewThread: (content: string, attachments: Attachment[]) => Promise<void>;
  sendToExistingThread: (content: string, attachments: Attachment[]) => Promise<void>;
  prepareContent: (content: string, agentMention?: string) => string;
}

export const useMessageSending = ({
  threadId,
  roomId,
  roomContext,
  enqueueSnackbar,
}: UseMessageSendingProps): UseMessageSendingReturn => {
  // Prepare content with optional agent mention and room context
  const prepareContent = useCallback(
    (content: string, agentMention?: string): string => {
      let finalContent = content.trim();

      // Prepend agent mention if provided
      if (agentMention) {
        finalContent = agentMention + (finalContent ? '\n' + finalContent : '');
      }

      // Append room context if available
      if (roomContext) {
        finalContent += `\n<hide>${roomContext}</hide>`;
      }

      return finalContent;
    },
    [roomContext],
  );

  // Create a new thread
  const createNewThread = useCallback(
    async (content: string, attachments: Attachment[]): Promise<void> => {
      try {
        const threadName = content.substring(0, 50).trim() || 'New Chat';
        const roomPort = getRoomPort();
        const newThread = await roomPort.createThread(roomId, { name: threadName });

        dispatch(addThread(newThread));
        dispatch(setThreadMain({ current: newThread.id }));

        await dispatch(
          sendMessage({
            threadId: newThread.id,
            content,
            attachments,
          }),
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create thread';
        console.error('Failed to create thread:', error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [roomId, enqueueSnackbar],
  );

  // Send message to existing thread
  const sendToExistingThread = useCallback(
    async (content: string, attachments: Attachment[]): Promise<void> => {
      try {
        await dispatch(
          sendMessage({
            threadId,
            content,
            attachments,
          }),
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        console.error('Failed to send message:', error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [threadId, enqueueSnackbar],
  );

  // Main send function
  const sendMessageContent = useCallback(
    async (messageContent: MessageContent): Promise<void> => {
      if (threadId === 'new') {
        await createNewThread(messageContent.content, messageContent.attachments);
      } else {
        await sendToExistingThread(messageContent.content, messageContent.attachments);
      }
    },
    [threadId, createNewThread, sendToExistingThread],
  );

  return {
    sendMessageContent,
    createNewThread,
    sendToExistingThread,
    prepareContent,
  };
};

